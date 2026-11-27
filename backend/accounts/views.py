from rest_framework import generics,permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate,login,logout
from .models import SeekerProfile
from .serializers import SignupSerializer,UserSerializer,ProfileSerializer
class SignupView(generics.CreateAPIView):
 serializer_class=SignupSerializer;permission_classes=[permissions.AllowAny]
 def create(self,request,*args,**kwargs):
  serializer=self.get_serializer(data=request.data);serializer.is_valid(raise_exception=True);user=serializer.save();return Response(UserSerializer(user).data,status=201)
class LoginView(APIView):
 permission_classes=[permissions.AllowAny]
 def post(self,request):
  user=authenticate(request,username=request.data.get('username'),password=request.data.get('password'))
  if not user:return Response({'detail':'Invalid credentials.'},status=400)
  login(request,user);return Response(UserSerializer(user).data)
class LogoutView(APIView):
 def post(self,request):logout(request);return Response({'detail':'Logged out.'})
class MeView(APIView):
 permission_classes=[IsAuthenticated]
 def get(self,request):return Response(UserSerializer(request.user).data)
class ProfileView(APIView):
 permission_classes=[IsAuthenticated]
 def get(self,request):
  profile,created=SeekerProfile.objects.get_or_create(user=request.user);return Response(ProfileSerializer(profile).data)
 def patch(self,request):
  profile,created=SeekerProfile.objects.get_or_create(user=request.user);serializer=ProfileSerializer(profile,data=request.data,partial=True);serializer.is_valid(raise_exception=True);serializer.save();return Response(serializer.data)
