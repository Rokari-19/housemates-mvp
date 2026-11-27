from rest_framework import serializers
from .models import Listing, ListingPhoto, HostelProfile, Enquiry, VerificationCheck, ViewingRequest


class ListingPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingPhoto
        fields = ["id", "image", "caption", "sort_order"]
        read_only_fields = ["id"]


class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model = HostelProfile
        exclude = ["listing"]
        read_only_fields = ["id"]


class VerificationCheckSerializer(serializers.ModelSerializer):
    check_label = serializers.CharField(source="get_check_type_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = VerificationCheck
        fields = ["id", "check_type", "check_label", "status", "status_label", "checked_at", "evidence_summary"]
        read_only_fields = fields


class ListingSerializer(serializers.ModelSerializer):
    photos = ListingPhotoSerializer(many=True, required=False)
    hostel_details = HostelSerializer(required=False)
    verification_checks = VerificationCheckSerializer(many=True, read_only=True)
    move_in_total = serializers.IntegerField(read_only=True)
    owner_name = serializers.CharField(source="owner.display_name", read_only=True)
    owner_id = serializers.IntegerField(source="owner_id", read_only=True)

    class Meta:
        model = Listing
        fields = [
            "id", "owner", "owner_id", "owner_name", "title", "description", "listing_type",
            "city", "area", "address_hint", "rent", "rent_period", "deposit", "agency_fee",
            "agreement_fee", "service_charge", "utility_estimate", "move_in_total", "bedrooms",
            "bathrooms", "available_from", "amenities", "house_rules", "is_furnished",
            "max_occupants", "latitude", "longitude", "status", "photos", "hostel_details",
            "verification_checks", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "owner", "status", "move_in_total", "verification_checks", "created_at", "updated_at"]

    def validate(self, attrs):
        listing_type = attrs.get("listing_type", getattr(self.instance, "listing_type", None))
        hostel = attrs.get("hostel_details")
        if listing_type == "hostel" and not hostel and not (self.instance and hasattr(self.instance, "hostel_details")):
            raise serializers.ValidationError({"hostel_details": "Hostel listings require institution, session and bed-space details."})
        return attrs

    def create(self, validated_data):
        photos = validated_data.pop("photos", [])
        hostel = validated_data.pop("hostel_details", None)
        listing = Listing.objects.create(**validated_data)
        for photo in photos:
            ListingPhoto.objects.create(listing=listing, **photo)
        if hostel:
            HostelProfile.objects.create(listing=listing, **hostel)
        return listing

    def update(self, instance, validated_data):
        photos = validated_data.pop("photos", None)
        hostel = validated_data.pop("hostel_details", None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        if photos is not None:
            instance.photos.all().delete()
            for photo in photos:
                ListingPhoto.objects.create(listing=instance, **photo)
        if hostel is not None:
            HostelProfile.objects.update_or_create(listing=instance, defaults=hostel)
        return instance


class EnquirySerializer(serializers.ModelSerializer):
    seeker_name = serializers.CharField(source="seeker.display_name", read_only=True)
    listing_title = serializers.CharField(source="listing.title", read_only=True)

    class Meta:
        model = Enquiry
        fields = ["id", "listing", "listing_title", "seeker", "seeker_name", "message", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "seeker", "seeker_name", "listing_title", "status", "created_at", "updated_at"]


class ViewingRequestSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    seeker_name = serializers.CharField(source="seeker.display_name", read_only=True)

    class Meta:
        model = ViewingRequest
        fields = [
            "id", "listing", "listing_title", "seeker", "seeker_name", "preferred_at",
            "next_of_kin_name", "next_of_kin_phone", "message", "status", "outcome",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "seeker", "seeker_name", "listing_title", "status", "outcome", "created_at", "updated_at"]
