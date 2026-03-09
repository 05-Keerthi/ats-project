from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):

    skills = serializers.ListField(
        child=serializers.CharField(),
        required=True
    )

    location = serializers.ListField(
        child=serializers.CharField(),
        required=True
    )

    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at"]