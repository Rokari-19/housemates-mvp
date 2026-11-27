from django.contrib import admin
from .models import Introduction


@admin.register(Introduction)
class IntroductionAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "recipient", "status", "created_at")
    list_filter = ("status",)
