from rest_framework import serializers
from .models import User,SeekerProfile
class UserSerializer(serializers.ModelSerializer):
 class Meta:
  model=User;fields=['id','username','email','display_name','role','phone','avatar']
class ProfileSerializer(serializers.ModelSerializer):
 class Meta:
  model=SeekerProfile;fields='__all__';read_only_fields=['user']
class SignupSerializer(serializers.ModelSerializer):
 password=serializers.CharField(write_only=True,min_length=8)
 class Meta:
  model=User;fields=['username','email','password','display_name','role','phone']
 def create(self,validated):
  password=validated.pop('password');user=User.objects.create_user(password=password,**validated)
  if user.role=='seeker':SeekerProfile.objects.create(user=user)
  return user
