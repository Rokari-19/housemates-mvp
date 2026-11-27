from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ("seeker", "Home seeker"),
        ("landlord", "Landlord"),
        ("agent", "Property agent"),
        ("provider", "Legacy provider"),
        ("hostel_operator", "Hostel operator"),
        ("hostel", "Legacy hostel operator"),
        ("staff", "Staff"),
    ]
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default="seeker")
    phone = models.CharField(max_length=20, blank=True)
    phone_verified = models.BooleanField(default=False)
    avatar = models.URLField(blank=True)
    display_name = models.CharField(max_length=80, blank=True)

    def __str__(self):
        return self.display_name or self.username


class SeekerProfile(models.Model):
    STATUS = [
        ("student", "Student"),
        ("nysc", "NYSC member"),
        ("graduate", "Fresh graduate"),
        ("professional", "Young professional"),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="seeker_profile")
    status = models.CharField(max_length=16, choices=STATUS, default="student")
    institution = models.CharField(max_length=160, blank=True)
    ppa = models.CharField(max_length=160, blank=True)
    local_government = models.CharField(max_length=120, blank=True)
    budget_min = models.PositiveIntegerField(default=0)
    budget_max = models.PositiveIntegerField(default=0)
    preferred_areas = models.JSONField(default=list, blank=True)
    move_in_date = models.DateField(null=True, blank=True)
    cleanliness = models.PositiveSmallIntegerField(default=3)
    sleep_schedule = models.CharField(max_length=24, blank=True)
    guest_frequency = models.CharField(max_length=24, blank=True)
    smoking = models.CharField(max_length=20, blank=True)
    pets = models.CharField(max_length=20, blank=True)
    work_mode = models.CharField(max_length=24, blank=True)
    noise_preference = models.CharField(max_length=24, blank=True)
    communication_style = models.CharField(max_length=80, blank=True)
    dealbreakers = models.JSONField(default=list, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    seeking_housemate = models.BooleanField(default=True)

    def __str__(self):
        return "Seeker profile: " + self.user.username
