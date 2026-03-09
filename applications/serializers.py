from rest_framework import serializers
from .models import Application
from users.serializers import ProfileSerializer


class ApplicationSerializer(serializers.ModelSerializer):

    candidate_details = ProfileSerializer(source="candidate", read_only=True)

    class Meta:
        model = Application
        fields = "__all__"
        read_only_fields = ["candidate", "status", "applied_at"]

    def validate_resume(self, value):

        allowed_types = ["pdf", "doc", "docx"]

        file_extension = value.name.split(".")[-1].lower()

        if file_extension not in allowed_types:
            raise serializers.ValidationError(
                "Only PDF, DOC, DOCX files allowed."
            )

        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "File size must be under 5MB."
            )

        return value


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Application
        fields = ["status"]  # Only allow status update