from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from notifications.email_utils import send_email
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes


from .models import User
from .serializers import RegisterSerializer, LoginSerializer, ProfileSerializer, LogoutSerializer, ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer, EmptySerializer


# REGISTER
@extend_schema(tags=["Users"], summary="Register new user", description="Creates a new user account with username, email, password and role.")
class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "User registered successfully",
                    "data": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role
                    }
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "success": False,
                "message": "Registration failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

@extend_schema(tags=["Users"],
    summary="User login",
    description="Authenticate user and return access and refresh tokens."
)

# LOGIN
class LoginView(APIView):

    serializer_class = LoginSerializer

    def post(self, request):

        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():

            user = serializer.validated_data["user"]

            return Response({
                "success": True,
                "message": "Login successful",
                "data": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "access_token": serializer.validated_data["access"],
                    "refresh_token": serializer.validated_data["refresh"]
                }
            })

        return Response({
            "success": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# PROFILE
@extend_schema(tags=["Users"],
    summary="Get user profile",
    description="Retrieve profile details of the currently logged-in user.")

class ProfileView(APIView):

    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get(self, request):

        serializer = self.serializer_class(request.user)

        return Response({
            "success": True,
            "data": serializer.data
        })
        
@extend_schema(
    tags=["Users"],
    summary="Logout user",
    description="Invalidate refresh token and log the user out.",
    request=LogoutSerializer,
    responses={200: None}
)
class LogoutView(APIView):

    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request):

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "success": True,
            "message": "Logout successful"
        }, status=status.HTTP_200_OK)

@extend_schema(tags=["Users"],
    summary="Change password",
    description="Allows authenticated user to change password using old password.")
    
class ChangePasswordView(APIView):

    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    @extend_schema(
        request=ChangePasswordSerializer,
        responses={200: OpenApiTypes.OBJECT},
        description="Change user password (requires old password)"
    )
    def post(self, request):

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"success": False, "message": "Old password is incorrect"},
                status=400
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        send_email(
            subject="Password Changed",
            message="Your password has been changed successfully.",
            recipient_list=[user.email]
        )

        return Response({
            "success": True,
            "message": "Password changed successfully"
        })  
        
@extend_schema( tags=["Users"],
    summary="Forgot password",
    description="Send password reset email to the user.")
       
class ForgotPasswordView(APIView):

    @extend_schema(
        request=ForgotPasswordSerializer,
        responses={200: OpenApiTypes.OBJECT},
        description="Send password reset email"
    )
    def post(self, request):

        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                "success": True,
                "message": "If the email exists, a reset link has been sent."
            })

        token = PasswordResetTokenGenerator().make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.id))

        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}"

        send_email(
            subject="Password Reset Request",
            message=f"Click the link below to reset your password:\n{reset_link}",
            recipient_list=[email]
        )

        return Response({
            "success": True,
            "message": "Password reset email sent"
        })
        
@extend_schema(tags=["Users"],
    summary="Reset password",
    description="Reset user password using uid and reset token.")

class ResetPasswordView(APIView):

    @extend_schema(
        request=ResetPasswordSerializer,
        parameters=[
            OpenApiParameter(
                name="uid",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="User ID encoded"
            ),
            OpenApiParameter(
                name="token",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="Password reset token"
            ),
        ],
        responses={200: OpenApiTypes.OBJECT},
        description="Reset password using uid and token"
    )
    def post(self, request, uid, token):

        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(id=user_id)
        except:
            return Response({"success": False, "message": "Invalid link"}, status=400)

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({"success": False, "message": "Token invalid"}, status=400)

        user.set_password(serializer.validated_data["password"])
        user.save()

        return Response({
            "success": True,
            "message": "Password reset successful"
        })
 
@extend_schema( tags=["Users"],
    summary="Send email verification link",
    description="Send verification email to the authenticated user.")
       
class SendVerificationEmailView(APIView):

    permission_classes = [IsAuthenticated]
    serializer_class = EmptySerializer

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT},
        description="Send email verification link"
    )
    def post(self, request):

        user = request.user

        token = PasswordResetTokenGenerator().make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.id))

        verify_link = f"http://localhost:3000/verify-email/{uid}/{token}"

        send_email(
            subject="Verify Your Email",
            message=f"Click the link below to verify your email:\n{verify_link}",
            recipient_list=[user.email]
        )

        return Response({
            "success": True,
            "message": "Verification email sent"
        })      
        
@extend_schema( tags=["Users"],
    summary="Verify user email",
    description="Verify user email using uid and verification token.")
     
class VerifyEmailView(APIView):

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="uid",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
            ),
            OpenApiParameter(
                name="token",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
            ),
        ],
        responses={200: OpenApiTypes.OBJECT},
        description="Verify user email"
    )
    def get(self, request, uid, token):

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(id=user_id)
        except:
            return Response({"success": False, "message": "Invalid link"}, status=400)

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({"success": False, "message": "Token invalid"}, status=400)

        user.is_verified = True
        user.save()

        return Response({
            "success": True,
            "message": "Email verified successfully"
        })