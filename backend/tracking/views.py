from rest_framework import generics, permissions, views
from rest_framework.response import Response
from .models import LocationUpdate
from .serializers import LocationSerializer

class LocationUpdateView(generics.CreateAPIView):
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BuildingLatestLocationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        try:
            latest = LocationUpdate.objects.filter(user_id=user_id).latest('timestamp')
            serializer = LocationSerializer(latest)
            return Response(serializer.data)
        except LocationUpdate.DoesNotExist:
            return Response({"error": "No location found"}, status=404)
