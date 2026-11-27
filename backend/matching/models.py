from django.conf import settings
from django.db import models


class Introduction(models.Model):
    STATUS = [("pending", "Pending"), ("accepted", "Accepted"), ("declined", "Declined")]
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="introductions_sent")
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="introductions_received")
    message = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=16, choices=STATUS, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["sender", "recipient"], name="unique_introduction_pair_direction")
        ]
