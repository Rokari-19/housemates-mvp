from django.contrib import admin
from django.urls import path,include
from rest_framework.decorators import api_view
from rest_framework.response import Response
@api_view(['GET'])
def health(_request): return Response({'status':'ok','service':'housemates-api','version':'0.1.0'})
urlpatterns=[path('admin/',admin.site.urls),path('api/health/',health),path('api/auth/',include('accounts.urls')),path('api/housing/',include('housing.urls')),path('api/matching/',include('matching.urls')),path('api/safety/',include('safety.urls'))]
