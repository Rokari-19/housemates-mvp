from rest_framework import serializers
from .models import Listing,ListingPhoto,HostelProfile,Enquiry
class ListingPhotoSerializer(serializers.ModelSerializer):
 class Meta:model=ListingPhoto;fields=['id','image','caption','sort_order']
class HostelSerializer(serializers.ModelSerializer):
 class Meta:model=HostelProfile;fields='__all__'
class ListingSerializer(serializers.ModelSerializer):
 photos=ListingPhotoSerializer(many=True,read_only=True);move_in_total=serializers.IntegerField(read_only=True);owner_name=serializers.CharField(source='owner.display_name',read_only=True)
 class Meta:model=Listing;fields='__all__'
class EnquirySerializer(serializers.ModelSerializer):
 class Meta:model=Enquiry;fields=['id','listing','seeker','message','status','created_at'];read_only_fields=['seeker','status','created_at']
