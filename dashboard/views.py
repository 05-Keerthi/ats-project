from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from drf_spectacular.utils import extend_schema

from users.models import User
from jobs.models import Job
from applications.models import Application
from interviews.models import Interview
from common.permissions import IsAdmin
from .serializers import AdminUserListSerializer


# PLATFORM KPI TRACKING
@extend_schema(
    tags=["Admin Dashboard"],
    summary="Admin: Get platform KPIs",
    description="Retrieve high-level statistics about users, jobs, and applications."
)
class PlatformKPIView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        stats = {
            "users": {
                "total": User.objects.count(),
                "admins": User.objects.filter(role="ADMIN").count(),
                "employers": User.objects.filter(role="EMPLOYER").count(),
                "candidates": User.objects.filter(role="CANDIDATE").count(),
            },
            "jobs": {
                "total": Job.objects.count(),
                "active": Job.objects.filter(status="ACTIVE").count(),
            },
            "applications": {
                "total": Application.objects.count(),
            },
            "interviews": {
                "total": Interview.objects.count(),
                "scheduled": Interview.objects.filter(status="SCHEDULED").count(),
            }
        }
        return Response({
            "success": True,
            "data": stats
        })


# MEMBER MANAGEMENT
@extend_schema(
    tags=["Admin Dashboard"],
    summary="Admin: List all users",
    description="Retrieve a list of all users on the platform with their roles and statuses."
)
class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserListSerializer
    permission_classes = [IsAdmin]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({
            "success": True,
            "count": self.get_queryset().count(),
            "data": response.data
        })
