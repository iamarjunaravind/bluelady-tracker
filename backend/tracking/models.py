from django.db import models
from django.contrib.auth.models import User
import django.utils.timezone

class LocationUpdate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.timestamp}"

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    latitude = models.FloatField()
    longitude = models.FloatField()
    photo = models.ImageField(upload_to='attendance_photos/')
    timestamp = models.DateTimeField(default=django.utils.timezone.now)


    def __str__(self):
        return f"{self.user.username} - {self.timestamp.date()}"

class Route(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Store(models.Model):
    CAPACITY_CHOICES = [
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
    ]

    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name='stores')
    name = models.CharField(max_length=200)
    manager_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    capacity_size = models.CharField(max_length=10, choices=CAPACITY_CHOICES)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class StoreVisit(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='visits')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='store_visits')
    photo = models.ImageField(upload_to='store_visit_photos/')
    latitude = models.FloatField()
    longitude = models.FloatField()
    is_approved = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.store.name} - {self.timestamp}"

class Notification(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class RegularizationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='regularization_requests')
    date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.status}"

class RouteAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='route_assignments')
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='assignments')
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.route.name}"
