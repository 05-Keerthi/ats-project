from django.urls import path
from .views import *

urlpatterns = [

    path("apply/", ApplyJobView.as_view()),

    path("my-applications/", CandidateApplicationsView.as_view()),

    path("job/<int:job_id>/applications/", JobApplicationsView.as_view()),

    path(
        "update-status/<int:pk>/",
        UpdateApplicationStatusView.as_view()
    ),
]