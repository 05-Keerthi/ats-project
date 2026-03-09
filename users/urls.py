from django.urls import path
from .views import RegisterView, LoginView, ProfileView, LogoutView, ChangePasswordView, ForgotPasswordView, ResetPasswordView, SendVerificationEmailView, VerifyEmailView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [

    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("profile/", ProfileView.as_view()),

    path("logout/", LogoutView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),

    path("forgot-password/", ForgotPasswordView.as_view()),
    path("reset-password/<uid>/<token>/", ResetPasswordView.as_view()),

    path("verify-email/", SendVerificationEmailView.as_view()),
    path("verify-email/<uid>/<token>/", VerifyEmailView.as_view()),
]