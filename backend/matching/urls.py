from django.urls import path
from .views import MatchesView, IntroductionListView, IntroductionRespondView

urlpatterns = [
    path("matches/", MatchesView.as_view(), name="matches"),
    path("introductions/", IntroductionListView.as_view(), name="introductions"),
    path("introductions/<int:pk>/respond/", IntroductionRespondView.as_view(), name="introduction-respond"),
]
