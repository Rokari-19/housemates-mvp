from rest_framework.routers import DefaultRouter
from .views import ListingViewSet, EnquiryViewSet, ViewingRequestViewSet

router = DefaultRouter()
router.register("listings", ListingViewSet, basename="listing")
router.register("enquiries", EnquiryViewSet, basename="enquiry")
router.register("viewings", ViewingRequestViewSet, basename="viewing")
urlpatterns = router.urls
