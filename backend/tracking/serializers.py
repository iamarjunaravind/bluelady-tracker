from rest_framework import serializers
from .models import LocationUpdate, Attendance, Route, Store, StoreVisit, Notification, RegularizationRequest, RouteAssignment

class LocationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = LocationUpdate
        fields = ['id', 'user', 'username', 'latitude', 'longitude', 'timestamp']
        read_only_fields = ['user', 'timestamp']

class AttendanceSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)


    class Meta:
        model = Attendance
        fields = ['id', 'user', 'username', 'latitude', 'longitude', 'photo', 'timestamp']
        read_only_fields = ['user', 'timestamp']

class RouteSerializer(serializers.ModelSerializer):
    store_count = serializers.IntegerField(source='stores.count', read_only=True)

    class Meta:
        model = Route
        fields = ['id', 'name', 'description', 'store_count', 'created_at']

class StoreSerializer(serializers.ModelSerializer):
    route_name = serializers.CharField(source='route.name', read_only=True)

    class Meta:
        model = Store
        fields = ['id', 'route', 'route_name', 'name', 'manager_name', 'phone_number', 'address', 'latitude', 'longitude', 'capacity_size', 'is_approved', 'created_at']
        read_only_fields = ['is_approved', 'created_at']

class StoreVisitSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)

    class Meta:
        model = StoreVisit
        fields = ['id', 'store', 'store_name', 'user', 'username', 'photo', 'latitude', 'longitude', 'is_approved', 'timestamp']
        read_only_fields = ['user', 'is_approved', 'timestamp']

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'sender_name', 'title', 'message', 'created_at']
        read_only_fields = ['sender', 'created_at']

class RegularizationRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = RegularizationRequest
        fields = ['id', 'user', 'username', 'date', 'reason', 'status', 'created_at']
        read_only_fields = ['user', 'status', 'created_at']

class RouteAssignmentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    route_name = serializers.CharField(source='route.name', read_only=True)

    class Meta:
        model = RouteAssignment
        fields = ['id', 'user', 'username', 'route', 'route_name', 'date', 'created_at']
        read_only_fields = ['created_at']
