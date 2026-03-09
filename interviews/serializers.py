from rest_framework import serializers
from .models import Interview
from jobs.serializers import JobSerializer
from applications.models import Application


class CreateInterviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Interview
        fields = [
            "application",
            "mode",
            "start_date",
            "end_date",
            "start_time",
            "end_time"
        ]


class CandidateSlotSerializer(serializers.ModelSerializer):

    class Meta:
        model = Interview
        fields = ["selected_slot"]


class ApplicationForInterviewSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ["id", "job", "resume", "status", "applied_at"]


class InterviewDetailSerializer(serializers.ModelSerializer):
    application = ApplicationForInterviewSerializer(read_only=True)

    class Meta:
        model = Interview
        fields = "__all__"
        depth = 1