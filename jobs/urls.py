from django.urls import path
from .views import *

urlpatterns = [

    path("create/", CreateJobView.as_view()),

    path("list/", JobListView.as_view()),

    path("<int:pk>/", JobDetailView.as_view()),

    path("update/<int:pk>/", UpdateJobView.as_view()),

    path("delete/<int:pk>/", DeleteJobView.as_view()),

]