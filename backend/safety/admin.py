from django.contrib import admin
from .models import Report,Block
@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
 list_display=('id','target_type','target_id','reason','status','created_at');list_filter=('status','target_type');search_fields=('details','reason')
admin.site.register(Block)
