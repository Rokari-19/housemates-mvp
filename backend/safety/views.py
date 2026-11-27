from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from housing.models import Listing
from .models import Report, Block
from .serializers import ReportSerializer

User = get_user_model()


class ReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Report.objects.select_related("reporter").order_by("-created_at")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(reporter=self.request.user)

    def perform_create(self, serializer):
        target_type = serializer.validated_data["target_type"]
        target_id = serializer.validated_data["target_id"]
        if target_type == "listing" and not Listing.objects.filter(pk=target_id).exists():
            raise ValidationError({"target_id": "Listing does not exist."})
        if target_type == "user" and not User.objects.filter(pk=target_id, is_active=True).exists():
            raise ValidationError({"target_id": "User does not exist."})
        serializer.save(reporter=self.request.user)


class BlockListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        blocks = Block.objects.filter(blocker=request.user).select_related("blocked")
        return Response([
            {"user_id": item.blocked_id, "display_name": item.blocked.display_name or item.blocked.username}
            for item in blocks
        ])

    def post(self, request):
        target = get_object_or_404(User, pk=request.data.get("user_id"), is_active=True)
        if target == request.user:
            return Response({"detail": "You cannot block your own account."}, status=400)
        Block.objects.get_or_create(blocker=request.user, blocked=target)
        return Response({"status": "blocked"}, status=201)


class BlockDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, user_id):
        Block.objects.filter(blocker=request.user, blocked_id=user_id).delete()
        return Response(status=204)
