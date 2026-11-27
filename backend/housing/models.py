from django.conf import settings
from django.db import models


class Listing(models.Model):
    TYPES = [
        ("room", "Room in shared apartment"),
        ("private", "Private room"),
        ("shared", "Shared apartment"),
        ("flat", "Entire apartment"),
        ("house", "House"),
        ("commercial", "Commercial space"),
        ("hostel", "Hostel"),
    ]
    STATUS = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("paused", "Paused"),
        ("review", "Under review"),
        ("removed", "Removed"),
    ]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="listings")
    title = models.CharField(max_length=180)
    description = models.TextField(max_length=4000)
    listing_type = models.CharField(max_length=16, choices=TYPES)
    city = models.CharField(max_length=80, default="Abuja")
    area = models.CharField(max_length=120)
    address_hint = models.CharField(max_length=255, blank=True)
    rent = models.PositiveIntegerField()
    rent_period = models.CharField(max_length=20, default="yearly")
    deposit = models.PositiveIntegerField(default=0)
    agency_fee = models.PositiveIntegerField(default=0)
    agreement_fee = models.PositiveIntegerField(default=0)
    service_charge = models.PositiveIntegerField(default=0)
    utility_estimate = models.PositiveIntegerField(default=0)
    bedrooms = models.PositiveSmallIntegerField(default=1)
    bathrooms = models.PositiveSmallIntegerField(default=1)
    available_from = models.DateField(null=True, blank=True)
    amenities = models.JSONField(default=list, blank=True)
    house_rules = models.JSONField(default=list, blank=True)
    is_furnished = models.BooleanField(default=False)
    max_occupants = models.PositiveSmallIntegerField(default=1)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def move_in_total(self):
        return sum([
            self.rent, self.deposit, self.agency_fee, self.agreement_fee,
            self.service_charge, self.utility_estimate,
        ])


class ListingPhoto(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="photos")
    image = models.URLField()
    caption = models.CharField(max_length=160, blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]


class HostelProfile(models.Model):
    listing = models.OneToOneField(Listing, on_delete=models.CASCADE, related_name="hostel_details")
    institution = models.CharField(max_length=160)
    room_types = models.JSONField(default=list, blank=True)
    session_label = models.CharField(max_length=80, blank=True)
    session_price = models.PositiveIntegerField(null=True, blank=True)
    bedspaces_available = models.PositiveSmallIntegerField(default=0)
    rules = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.institution + " / " + self.listing.title


class Enquiry(models.Model):
    STATUS = [("new", "New"), ("responded", "Responded"), ("closed", "Closed")]
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="enquiries")
    seeker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enquiries")
    message = models.TextField(max_length=1000)
    status = models.CharField(max_length=16, default="new", choices=STATUS)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class VerificationCheck(models.Model):
    CHECKS = [
        ("identity", "Provider identity"),
        ("location", "Location presence"),
        ("authority", "Authority to let"),
        ("inspection", "Physical inspection"),
    ]
    STATUSES = [
        ("pending", "Pending"),
        ("checked", "Checked"),
        ("not_checked", "Not checked"),
        ("expired", "Expired"),
    ]
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="verification_checks")
    check_type = models.CharField(max_length=20, choices=CHECKS)
    status = models.CharField(max_length=16, choices=STATUSES, default="pending")
    checked_at = models.DateTimeField(null=True, blank=True)
    evidence_summary = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-checked_at", "-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["listing", "check_type"], name="unique_listing_verification_check")
        ]


class ViewingRequest(models.Model):
    STATUS = [
        ("requested", "Requested"),
        ("confirmed", "Confirmed"),
        ("declined", "Declined"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    OUTCOMES = [("successful", "Successful"), ("unsuccessful", "Unsuccessful")]
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="viewing_requests")
    seeker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="viewing_requests")
    preferred_at = models.DateTimeField()
    next_of_kin_name = models.CharField(max_length=120)
    next_of_kin_phone = models.CharField(max_length=24)
    message = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=16, choices=STATUS, default="requested")
    outcome = models.CharField(max_length=16, choices=OUTCOMES, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return "Viewing request: " + self.listing.title
