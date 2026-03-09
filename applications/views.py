from rest_framework import generics, status
from rest_framework.response import Response
from .models import Application
from .serializers import ApplicationSerializer, ApplicationStatusUpdateSerializer
from drf_spectacular.utils import extend_schema
from common.permissions import IsCandidate, IsEmployer
from rest_framework.parsers import MultiPartParser, FormParser
from notifications.email_utils import send_email

# APPLY JOB
@extend_schema(
    tags=["Applications"],
    summary="Candidate: Apply for a job",
    description="Allows a candidate to apply for a job by uploading a resume.",
    request={
        "multipart/form-data": {
            "type": "object",
            "properties": {
                "resume": {
                    "type": "string",
                    "format": "binary"
                },
                "job": {
                    "type": "integer"
                }
            },
            "required": ["resume", "job"]
        }
    }
)
class ApplyJobView(generics.CreateAPIView):

    serializer_class = ApplicationSerializer
    permission_classes = [IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(candidate=self.request.user)

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(
            {
                "message": "Application submitted successfully",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


# CANDIDATE APPLICATION HISTORY
@extend_schema(
    tags=["Applications"],
    summary="Candidate: Get candidate applications",
    description="Retrieve all job applications submitted by the logged-in candidate."
)
class CandidateApplicationsView(generics.ListAPIView):

    serializer_class = ApplicationSerializer
    permission_classes = [IsCandidate]

    def get_queryset(self):
        return Application.objects.filter(candidate=self.request.user)


# EMPLOYER VIEW APPLICATIONS FOR JOB
@extend_schema(
    tags=["Applications"],
    summary="Employer: Get applications for a job",
    description="Allows an employer to view all applications submitted for a specific job."
)
class JobApplicationsView(generics.ListAPIView):

    serializer_class = ApplicationSerializer
    permission_classes = [IsEmployer]

    def get_queryset(self):

        job_id = self.kwargs["job_id"]

        return Application.objects.filter(job_id=job_id)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "message": "Applications fetched successfully",
            "count": queryset.count(),
            "data": serializer.data
        })


# UPDATE APPLICATION STATUS
@extend_schema(
    tags=["Applications"],
    summary="Employer: Update application status",
    description="Allows an employer to update the status of a candidate's application (e.g., REVIEWING, SHORTLISTED, REJECTED, HIRED)."
)
class UpdateApplicationStatusView(generics.UpdateAPIView):

    queryset = Application.objects.all()
    serializer_class = ApplicationStatusUpdateSerializer
    permission_classes = [IsEmployer]
    http_method_names = ["patch", "put"]

    def update(self, request, *args, **kwargs):

        partial = kwargs.pop("partial", True)
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        # get updated status
        new_status = serializer.validated_data["status"]

        candidate = instance.candidate
        job = instance.job

        # send email notification
        send_email(
            subject="Application Status Update",
            message=f"""
Hello {candidate.username},

Your application for the job '{job.title}' has been updated.

New Status: {new_status}

Thank you for applying.

Regards,
Recruitment Team
""",
            recipient_list=[candidate.email]
        )

        return Response({
            "message": "Application status updated successfully",
            "data": serializer.data
        })