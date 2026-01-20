from rest_framework import serializers
from .models import LocationUpdate, Attendance

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
