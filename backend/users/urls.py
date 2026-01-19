from django.urls import path
from .views import CustomAuthToken, EmployeeCreateView, EmployeeListView

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='api_login'),
    path('create/', EmployeeCreateView.as_view(), name='create_employee'),
    path('list/', EmployeeListView.as_view(), name='list_employees'),
]
