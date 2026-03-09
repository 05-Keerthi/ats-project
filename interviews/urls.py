from django.urls import path
from .views import CreateInterviewView, SelectInterviewSlotView, EmployerInterviewsView, CandidateInterviewsView

urlpatterns = [
    path("schedule/", CreateInterviewView.as_view()),
    path("select-slot/<int:pk>/", SelectInterviewSlotView.as_view()),
    path("employer/", EmployerInterviewsView.as_view()),
    path("candidate/", CandidateInterviewsView.as_view()),
]