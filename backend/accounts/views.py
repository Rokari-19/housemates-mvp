from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import SeekerProfile
from .serializers import SignupSerializer, UserSerializer, ProfileSerializer


class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=201)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""
        user = authenticate(request, username=identifier, password=password)
        if not user and "@" in identifier:
            candidate = __import__("django.contrib.auth", fromlist=["get_user_model"]).get_user_model().objects.filter(email__iexact=identifier).first()
            if candidate:
                user = authenticate(request, username=candidate.username, password=password)
        if not user or not user.is_active:
            return Response({"detail": "Invalid username/email or password."}, status=400)
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # JWT access tokens are short-lived. The client discards access/refresh tokens.
        # Add a persisted blacklist after a shared cache/database is configured.
        return Response({"detail": "Logged out."})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_profile(self, user):
        if user.role != "seeker":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only home-seeker accounts have housemate discovery profiles.")
        profile, _ = SeekerProfile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        return Response(ProfileSerializer(self.get_profile(request.user)).data)

    def patch(self, request):
        profile = self.get_profile(request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
