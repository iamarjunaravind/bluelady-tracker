from rest_framework import serializers
from .models import LocationUpdate

class LocationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = LocationUpdate
        fields = ['id', 'user', 'username', 'latitude', 'longitude', 'timestamp']
        read_only_fields = ['user', 'timestamp']
