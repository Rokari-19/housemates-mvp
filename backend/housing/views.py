from rest_framework import viewsets,permissions,filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Listing,Enquiry
from .serializers import ListingSerializer,EnquirySerializer
class ListingViewSet(viewsets.ModelViewSet):
 serializer_class=ListingSerializer;queryset=Listing.objects.filter(status='active').prefetch_related('photos');permission_classes=[permissions.IsAuthenticatedOrReadOnly]
 filter_backends=[filters.SearchFilter,filters.OrderingFilter];search_fields=['title','description','area','city'];ordering_fields=['rent','created_at'];ordering=['-created_at']
 def get_queryset(self):
  qs=Listing.objects.all().prefetch_related('photos')
  if self.action=='mine':return qs.filter(owner=self.request.user)
  if not self.request.user.is_staff:qs=qs.filter(status='active')
  if self.request.query_params.get('area'):qs=qs.filter(area__icontains=self.request.query_params['area'])
  if self.request.query_params.get('type'):qs=qs.filter(listing_type=self.request.query_params['type'])
  if self.request.query_params.get('max_rent'):qs=qs.filter(rent__lte=self.request.query_params['max_rent'])
  return qs
 def perform_create(self,serializer):serializer.save(owner=self.request.user,status='review')
 def perform_update(self,serializer):
  if serializer.instance.owner_id!=self.request.user.id and not self.request.user.is_staff:raise PermissionDenied('You cannot edit this listing.')
  serializer.save()
 def perform_destroy(self,instance):
  if instance.owner_id!=self.request.user.id and not self.request.user.is_staff:raise PermissionDenied('You cannot delete this listing.')
  instance.delete()
 @action(detail=False,methods=['get'],permission_classes=[permissions.IsAuthenticated],url_path='mine')
 def mine(self,request):return Response(self.get_serializer(self.get_queryset(),many=True).data)
class EnquiryViewSet(viewsets.ModelViewSet):
 serializer_class=EnquirySerializer;permission_classes=[permissions.IsAuthenticated];http_method_names=['get','post','patch']
 def get_queryset(self):return Enquiry.objects.filter(seeker=self.request.user) | Enquiry.objects.filter(listing__owner=self.request.user)
 def perform_create(self,serializer):serializer.save(seeker=self.request.user)
