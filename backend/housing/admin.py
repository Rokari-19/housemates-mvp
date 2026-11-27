from django.contrib import admin
from .models import Listing, ListingPhoto, HostelProfile, Enquiry, VerificationCheck, ViewingRequest


class ListingPhotoInline(admin.TabularInline):
    model = ListingPhoto
    extra = 0


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "area", "rent", "status", "created_at")
    list_filter = ("status", "listing_type", "city")
    search_fields = ("title", "area", "owner__username", "owner__email")
    list_editable = ("status",)
    inlines = [ListingPhotoInline]


@admin.register(VerificationCheck)
class VerificationCheckAdmin(admin.ModelAdmin):
    list_display = ("listing", "check_type", "status", "checked_at")
    list_filter = ("check_type", "status")
    search_fields = ("listing__title", "evidence_summary")


@admin.register(ViewingRequest)
class ViewingRequestAdmin(admin.ModelAdmin):
    list_display = ("listing", "seeker", "preferred_at", "status", "outcome")
    list_filter = ("status", "outcome")
    search_fields = ("listing__title", "seeker__username", "next_of_kin_name")


admin.site.register(HostelProfile)
admin.site.register(Enquiry)
