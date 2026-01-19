from django.urls import path
from .views import LocationUpdateView, BuildingLatestLocationView

urlpatterns = [
    path('update/', LocationUpdateView.as_view(), name='update_location'),
    path('<int:user_id>/latest/', BuildingLatestLocationView.as_view(), name='latest_location'),
]
