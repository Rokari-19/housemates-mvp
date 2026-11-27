from rest_framework.routers import DefaultRouter
from .views import ListingViewSet,EnquiryViewSet
router=DefaultRouter();router.register('listings',ListingViewSet);router.register('enquiries',EnquiryViewSet)
urlpatterns=router.urls
