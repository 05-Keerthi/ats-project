from rest_framework import generics, status
from rest_framework.response import Response
from .models import Job
from .serializers import JobSerializer
from common.permissions import IsEmployer
from drf_spectacular.utils import extend_schema


# CREATE JOB
@extend_schema(
    tags=["Jobs"],
    summary="Employer: Create a new job",
    description="Allows an employer to create a new job posting."
)
class CreateJobView(generics.CreateAPIView):

    serializer_class = JobSerializer
    permission_classes = [IsEmployer]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        return Response({
            "message": "Job created successfully",
            "data": response.data
        }, status=status.HTTP_201_CREATED)


# LIST JOBS
@extend_schema(
    tags=["Jobs"],
    summary="Candidate/Employer: List all jobs",
    description="Retrieve a list of all available job postings."
)
class JobListView(generics.ListAPIView):

    serializer_class = JobSerializer
    queryset = Job.objects.all()

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        return Response({
            "message": "Jobs fetched successfully",
            "data": response.data
        })


# UPDATE JOB
@extend_schema(
    tags=["Jobs"],
    summary="Employer: Update job",
    description="Allows an employer to update job details such as title, description, skills, or status."
)
class UpdateJobView(generics.UpdateAPIView):

    serializer_class = JobSerializer
    queryset = Job.objects.all()
    permission_classes = [IsEmployer]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)

        return Response({
            "message": "Job updated successfully",
            "data": response.data
        })


# DELETE JOB
@extend_schema(
    tags=["Jobs"],
    summary="Employer: Delete job",
    description="Allows an employer to delete a job posting."
)
class DeleteJobView(generics.DestroyAPIView):

    queryset = Job.objects.all()
    permission_classes = [IsEmployer]

    def destroy(self, request, *args, **kwargs):

        super().destroy(request, *args, **kwargs)

        return Response({
            "message": "Job deleted successfully"
        })


# JOB DETAIL
@extend_schema(
    tags=["Jobs"],
    summary="Candidate/Employer: Get job details",
    description="Retrieve detailed information about a specific job."
)
class JobDetailView(generics.RetrieveAPIView):

    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def retrieve(self, request, *args, **kwargs):

        response = super().retrieve(request, *args, **kwargs)

        return Response({
            "message": "Job fetched successfully",
            "data": response.data
        })