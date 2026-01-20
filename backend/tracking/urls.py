from django.urls import path
from .views import (
    LocationUpdateView, 
    LatestLocationView, 
    AllAgentsLatestLocationView,
    AttendanceCreateView,
    AttendanceListView,
    StaffAttendanceView
)

urlpatterns = [
    path('update/', LocationUpdateView.as_view(), name='location-update'),
    path('latest/', LatestLocationView.as_view(), name='latest-location'),
    path('all/', AllAgentsLatestLocationView.as_view(), name='all-agents-location'),
    path('punch/', AttendanceCreateView.as_view(), name='attendance-punch'),
    path('my-attendance/', AttendanceListView.as_view(), name='my-attendance'),
    path('staff-attendance/', StaffAttendanceView.as_view(), name='staff-attendance'),
]
