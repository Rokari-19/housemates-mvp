from django.urls import path
from .views import ReportListCreateView, BlockListCreateView, BlockDeleteView

urlpatterns = [
    path("reports/", ReportListCreateView.as_view(), name="reports"),
    path("blocks/", BlockListCreateView.as_view(), name="blocks"),
    path("blocks/<int:user_id>/", BlockDeleteView.as_view(), name="block-delete"),
]
