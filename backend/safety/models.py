from django.conf import settings
from django.db import models


class Report(models.Model):
    REPORT_TYPES = [("listing", "Listing"), ("user", "User")]
    STATUSES = [("open", "Open"), ("review", "In review"), ("resolved", "Resolved"), ("dismissed", "Dismissed")]
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports_made")
    target_type = models.CharField(max_length=12, choices=REPORT_TYPES)
    target_id = models.PositiveIntegerField()
    reason = models.CharField(max_length=80)
    details = models.TextField(max_length=1200, blank=True)
    status = models.CharField(max_length=12, default="open", choices=STATUSES)
    resolution_note = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Block(models.Model):
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocks_made")
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["blocker", "blocked"], name="unique_block_direction")
        ]
