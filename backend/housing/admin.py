from django.contrib import admin
from .models import Listing,ListingPhoto,HostelProfile,Enquiry
@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
 list_display=('title','owner','area','rent','status','created_at');list_filter=('status','listing_type','city');search_fields=('title','area')
admin.site.register(ListingPhoto);admin.site.register(HostelProfile);admin.site.register(Enquiry)
