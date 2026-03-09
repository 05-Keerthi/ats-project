from django.db import models
from django.conf import settings
from jobs.models import Job

User = settings.AUTH_USER_MODEL


class Application(models.Model):

    STATUS_CHOICES = (
        ("APPLIED", "Applied"),
        ("REVIEWING", "Reviewing"),
        ("SHORTLISTED", "Shortlisted"),
        ("INTERVIEW_SCHEDULED", "Interview Scheduled"),
        ("SELECTED", "Selected"),
        ("REJECTED", "Rejected"),
    )

    candidate = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    resume = models.FileField(upload_to="resumes/")

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="APPLIED"
    )

    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("candidate", "job")  # Prevent duplicate application

    def __str__(self):
        return f"{self.candidate} -> {self.job}"