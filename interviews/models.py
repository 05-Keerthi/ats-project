from django.db import models
from django.conf import settings
from applications.models import Application

User = settings.AUTH_USER_MODEL


class Interview(models.Model):

    MODE_CHOICES = (
        ("ONLINE", "Online"),
        ("IN_PERSON", "In Person"),
    )

    STATUS_CHOICES = (
        ("SCHEDULE_PENDING", "Schedule Pending"),
        ("SCHEDULED", "Scheduled"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    )

    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        related_name="interview"
    )

    employer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="interviews_created"
    )

    candidate = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="candidate_interviews"
    )

    mode = models.CharField(
        max_length=20,
        choices=MODE_CHOICES
    )

    start_date = models.DateField()
    end_date = models.DateField()

    start_time = models.TimeField(default="09:00")
    end_time = models.TimeField(default="18:00")

    selected_slot = models.DateTimeField(null=True, blank=True)

    meeting_link = models.URLField(blank=True, null=True)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="SCHEDULE_PENDING"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.application} Interview"