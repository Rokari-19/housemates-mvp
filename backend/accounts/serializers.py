from rest_framework import serializers
from .models import User, SeekerProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "display_name", "role", "phone", "avatar"]
        read_only_fields = ["id", "username", "email", "role"]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeekerProfile
        exclude = ["user"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        minimum = attrs.get("budget_min", getattr(self.instance, "budget_min", 0))
        maximum = attrs.get("budget_max", getattr(self.instance, "budget_max", 0))
        if minimum and maximum and minimum > maximum:
            raise serializers.ValidationError({"budget_max": "Maximum budget must be greater than or equal to minimum budget."})
        cleanliness = attrs.get("cleanliness", getattr(self.instance, "cleanliness", 3))
        if not 1 <= int(cleanliness) <= 5:
            raise serializers.ValidationError({"cleanliness": "Choose a cleanliness preference from 1 to 5."})
        areas = attrs.get("preferred_areas", getattr(self.instance, "preferred_areas", []))
        dealbreakers = attrs.get("dealbreakers", getattr(self.instance, "dealbreakers", []))
        if not isinstance(areas, list):
            raise serializers.ValidationError({"preferred_areas": "Preferred areas must be a list."})
        if not isinstance(dealbreakers, list):
            raise serializers.ValidationError({"dealbreakers": "Dealbreakers must be a list."})
        return attrs


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)
    role = serializers.ChoiceField(choices=[
        ("seeker", "Home seeker"),
        ("landlord", "Landlord"),
        ("agent", "Property agent"),
        ("hostel_operator", "Hostel operator"),
    ])

    class Meta:
        model = User
        fields = ["username", "email", "password", "display_name", "role", "phone"]

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated):
        password = validated.pop("password")
        user = User.objects.create_user(password=password, **validated)
        if user.role == "seeker":
            SeekerProfile.objects.get_or_create(user=user)
        return user
