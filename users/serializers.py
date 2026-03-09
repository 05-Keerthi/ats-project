from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):

        email = data.get("email")
        password = data.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")

        user = authenticate(username=user.username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        refresh = RefreshToken.for_user(user)

        return {
            "user": user,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]
        
class LogoutSerializer(serializers.Serializer):

    refresh = serializers.CharField()

    def validate(self, data):

        self.token = data["refresh"]

        return data

    def save(self):

        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except Exception:
            raise serializers.ValidationError("Invalid token")
        
class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField()
    new_password = serializers.CharField()
    
class ForgotPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()
    
class ResetPasswordSerializer(serializers.Serializer):

    password = serializers.CharField()
    
class EmailVerificationSerializer(serializers.Serializer):
    pass


class EmptySerializer(serializers.Serializer):
    pass