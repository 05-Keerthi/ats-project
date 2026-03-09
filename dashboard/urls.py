from django.urls import path
from .views import PlatformKPIView, AdminUserListView


urlpatterns = [
    path("kpis/", PlatformKPIView.as_view(), name="admin-kpis"),
    path("users/", AdminUserListView.as_view(), name="admin-user-list"),
]
