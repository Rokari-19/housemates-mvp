from django.db.models import Q
from django.utils import timezone
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from .models import Listing, Enquiry, ViewingRequest
from .serializers import ListingSerializer, EnquirySerializer, ViewingRequestSerializer


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "area", "city", "address_hint"]
    ordering_fields = ["rent", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Listing.objects.select_related("owner").prefetch_related(
            "photos", "verification_checks", "hostel_details"
        )
        user = self.request.user
        if self.action == "mine":
            return queryset.filter(owner=user)
        if user.is_authenticated:
            queryset = queryset.filter(Q(status="active") | Q(owner=user))
        else:
            queryset = queryset.filter(status="active")

        params = self.request.query_params
        if params.get("city"):
            queryset = queryset.filter(city__icontains=params["city"])
        if params.get("area"):
            queryset = queryset.filter(area__icontains=params["area"])
        listing_type = params.get("listing_type") or params.get("type")
        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)
        max_rent = params.get("max_price") or params.get("max_rent")
        if max_rent:
            queryset = queryset.filter(rent__lte=max_rent)
        if params.get("min_price"):
            queryset = queryset.filter(rent__gte=params["min_price"])
        if params.get("move_in_date"):
            queryset = queryset.filter(Q(available_from__isnull=True) | Q(available_from__lte=params["move_in_date"]))
        if params.get("furnished") in ("true", "false"):
            queryset = queryset.filter(is_furnished=params["furnished"] == "true")
        if params.get("amenity"):
            queryset = queryset.filter(amenities__contains=[params["amenity"]])
        return queryset.distinct()

    def perform_create(self, serializer):
        role = self.request.user.role
        if role not in ("provider", "landlord", "agent", "hostel", "hostel_operator", "staff"):
            raise PermissionDenied("Only landlord, agent or hostel-operator accounts can publish listings.")
        if serializer.validated_data.get("listing_type") == "hostel" and role not in ("hostel", "hostel_operator", "staff"):
            raise PermissionDenied("Hostel listings require a hostel-operator account.")
        serializer.save(owner=self.request.user, status="review")

    def perform_update(self, serializer):
        if serializer.instance.owner_id != self.request.user.id and not self.request.user.is_staff:
            raise PermissionDenied("You can only edit your own listing.")
        serializer.save(status="review")

    def perform_destroy(self, instance):
        if instance.owner_id != self.request.user.id and not self.request.user.is_staff:
            raise PermissionDenied("You can only delete your own listing.")
        instance.delete()

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated], url_path="mine")
    def mine(self, request):
        return Response(self.get_serializer(self.get_queryset(), many=True).data)


class EnquiryViewSet(viewsets.ModelViewSet):
    serializer_class = EnquirySerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        return Enquiry.objects.filter(
            Q(seeker=self.request.user) | Q(listing__owner=self.request.user)
        ).select_related("listing", "seeker")

    def perform_create(self, serializer):
        if self.request.user.role != "seeker":
            raise PermissionDenied("Only home seekers can send enquiries.")
        listing = serializer.validated_data["listing"]
        if listing.owner_id == self.request.user.id:
            raise ValidationError({"listing": "You cannot enquire about your own listing."})
        if listing.status != "active":
            raise ValidationError({"listing": "This listing is not currently available for enquiries."})
        if Enquiry.objects.filter(listing=listing, seeker=self.request.user).exists():
            raise ValidationError({"listing": "You have already enquired about this listing."})
        serializer.save(seeker=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        enquiry = self.get_object()
        if enquiry.listing.owner_id != request.user.id and not request.user.is_staff:
            raise PermissionDenied("Only the listing provider can respond to this enquiry.")
        new_status = request.data.get("status")
        if new_status not in ("responded", "closed"):
            raise ValidationError({"status": "Choose responded or closed."})
        enquiry.status = new_status
        enquiry.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(enquiry).data)


class ViewingRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ViewingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        return ViewingRequest.objects.filter(
            Q(seeker=self.request.user) | Q(listing__owner=self.request.user)
        ).select_related("listing", "seeker")

    def perform_create(self, serializer):
        if self.request.user.role != "seeker":
            raise PermissionDenied("Only home seekers can request property viewings.")
        listing = serializer.validated_data["listing"]
        if listing.status != "active" or listing.owner_id == self.request.user.id:
            raise ValidationError({"listing": "This listing is not available for a viewing request."})
        if serializer.validated_data["preferred_at"] <= timezone.now():
            raise ValidationError({"preferred_at": "Choose a future date and time."})
        serializer.save(seeker=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        viewing = self.get_object()
        new_status = request.data.get("status")
        new_outcome = request.data.get("outcome")
        is_provider = viewing.listing.owner_id == request.user.id or request.user.is_staff
        is_seeker = viewing.seeker_id == request.user.id

        if is_provider:
            allowed = {
                "requested": ("confirmed", "declined"),
                "confirmed": ("completed", "declined"),
            }
            if new_status not in allowed.get(viewing.status, ()):
                raise ValidationError({"status": "That viewing status transition is not allowed."})
            if new_status == "completed" and viewing.preferred_at > timezone.now():
                raise ValidationError({"status": "A viewing cannot be completed before its scheduled time."})
            viewing.status = new_status
        elif is_seeker:
            if new_status == "cancelled" and viewing.status in ("requested", "confirmed"):
                viewing.status = "cancelled"
            elif new_outcome in ("successful", "unsuccessful") and viewing.status == "completed":
                viewing.outcome = new_outcome
            else:
                raise PermissionDenied("You can cancel an upcoming viewing or record an outcome after it is completed.")
        else:
            raise PermissionDenied("You cannot update this viewing request.")

        viewing.save(update_fields=["status", "outcome", "updated_at"])
        return Response(self.get_serializer(viewing).data)
