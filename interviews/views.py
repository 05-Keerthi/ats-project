from rest_framework import generics, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import Interview
from .serializers import CreateInterviewSerializer, CandidateSlotSerializer, InterviewDetailSerializer
from applications.models import Application
from notifications.email_utils import send_email
from .utils import generate_meeting_link
from common.permissions import IsEmployer, IsCandidate


# EMPLOYER CREATE INTERVIEW SCHEDULE
@extend_schema(
    tags=["Interviews"],
    summary="Employer: Create interview schedule",
    description="""
Allows an employer to create an interview schedule window for a candidate.

The employer defines:
- Interview mode (ONLINE / IN_PERSON)
- Start date and end date
- Daily interview time range

After creation, an email will be sent to the candidate asking them to select their preferred interview slot.
"""
)
class CreateInterviewView(generics.CreateAPIView):

    serializer_class = CreateInterviewSerializer
    permission_classes = [IsEmployer]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application = Application.objects.get(
            id=serializer.validated_data["application"].id
        )

        interview = serializer.save(
            employer=request.user,
            candidate=application.candidate
        )

        # Send email to candidate
        send_email(
            subject="Interview Scheduling",
            message=f"""
Dear {application.candidate.username},

You have been shortlisted for an interview.

Please select your preferred interview slot.

Interview Mode: {interview.mode}

Scheduling Window:
From {interview.start_date} to {interview.end_date}
Time: {interview.start_time} - {interview.end_time}

Please choose your slot from the portal.

Best regards,
Hiring Team
""",
            recipient_list=[application.candidate.email]
        )

        return Response({
            "message": "Interview schedule created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


# CANDIDATE SELECT INTERVIEW SLOT
@extend_schema(
    tags=["Interviews"],
    summary="Candidate: Select interview slot",
    description="""
Allows a candidate to choose an interview slot within the employer's scheduling window.

If the interview mode is ONLINE:
- A meeting link will be automatically generated.

If the interview mode is IN_PERSON:
- Candidate will attend the interview at the employer's location.

After selecting the slot, a confirmation email will be sent to the candidate with interview details.
"""
)
class SelectInterviewSlotView(generics.UpdateAPIView):

    queryset = Interview.objects.all()
    serializer_class = CandidateSlotSerializer
    permission_classes = [IsCandidate]

    def update(self, request, *args, **kwargs):

        interview = self.get_object()

        serializer = self.get_serializer(
            interview,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)

        meeting_link = None

        # Generate meeting link for online interviews
        if interview.mode == "ONLINE":
            meeting_link = generate_meeting_link()

        serializer.save(
            meeting_link=meeting_link,
            status="SCHEDULED"
        )

        # Send confirmation email
        send_email(
            subject="Interview Scheduled",
            message=f"""
Dear {interview.candidate.username},

Your interview has been successfully scheduled.

Interview Details:

Date & Time: {serializer.validated_data['selected_slot']}
Mode: {interview.mode}

Meeting Link:
{meeting_link if meeting_link else "This will be an in-person interview at the company location."}

Best of luck!

Regards,
Hiring Team
""",
            recipient_list=[interview.candidate.email]
        )

        return Response({
            "message": "Interview slot selected successfully",
            "data": serializer.data
        })


# EMPLOYER VIEW ALL INTERVIEWS
@extend_schema(
    tags=["Interviews"],
    summary="Employer: Get all scheduled interviews",
    description="Retrieve a list of all interviews created by the logged-in employer."
)
class EmployerInterviewsView(generics.ListAPIView):

    serializer_class = InterviewDetailSerializer
    permission_classes = [IsEmployer]

    def get_queryset(self):
        return Interview.objects.filter(employer=self.request.user)


# CANDIDATE VIEW ALL INTERVIEWS
@extend_schema(
    tags=["Interviews"],
    summary="Candidate: Get all scheduled interviews",
    description="Retrieve a list of all interviews assigned to the logged-in candidate."
)
class CandidateInterviewsView(generics.ListAPIView):

    serializer_class = InterviewDetailSerializer
    permission_classes = [IsCandidate]

    def get_queryset(self):
        return Interview.objects.filter(candidate=self.request.user)