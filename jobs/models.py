from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Job(models.Model):

    JOB_STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
        ("CLOSED", "Closed"),
    )

    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, default="")
    description = models.TextField()

    skills = models.JSONField(default=list)
    location = models.JSONField(default=list)

    experience = models.IntegerField()

    status = models.CharField(
        max_length=20,
        choices=JOB_STATUS_CHOICES,
        default="ACTIVE"
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="jobs"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title