from rest_framework import generics, permissions, views
from rest_framework.response import Response
from .models import LocationUpdate, Attendance
from .serializers import LocationSerializer, AttendanceSerializer
from django.db.models import Max
from django.contrib.auth.models import User

class LocationUpdateView(generics.CreateAPIView):
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LatestLocationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        try:
            latest = LocationUpdate.objects.filter(user_id=user_id).latest('timestamp')
            serializer = LocationSerializer(latest)
            return Response(serializer.data)
        except LocationUpdate.DoesNotExist:
            return Response({"error": "No location found"}, status=404)

class AttendanceCreateView(generics.CreateAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AttendanceListView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Attendance.objects.filter(user=self.request.user).order_by('-timestamp')

class StaffAttendanceView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if not user_id:
            return Attendance.objects.none()
        return Attendance.objects.filter(user_id=user_id).order_by('-timestamp')

class AllAgentsLatestLocationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Subquery to find the latest ID for each user
        from django.db.models import Max
        latest_ids = LocationUpdate.objects.values('user').annotate(max_id=Max('id')).values_list('max_id', flat=True)
        latest_locations = LocationUpdate.objects.filter(id__in=latest_ids)

        serializer = LocationSerializer(latest_locations, many=True)
        return Response(serializer.data)

from .models import Route, Store, StoreVisit
from .serializers import RouteSerializer, StoreSerializer, StoreVisitSerializer

class RouteListView(generics.ListAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

class StoreListView(generics.ListCreateAPIView):
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Store.objects.all()
        route_id = self.request.query_params.get('route_id')
        if route_id:
            queryset = queryset.filter(route_id=route_id)
        return queryset

class StoreVisitCreateView(generics.CreateAPIView):
    serializer_class = StoreVisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ManagerStoreVisitListView(generics.ListAPIView):
    serializer_class = StoreVisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtering logic can be added here (e.g., by route, date)
        return StoreVisit.objects.all().order_by('-timestamp')

class ApproveStoreView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            store = Store.objects.get(pk=pk)
            store.is_approved = True
            store.save()
            return Response({"status": "approved"})
        except Store.DoesNotExist:
            return Response({"error": "Store not found"}, status=404)

class ApproveStoreVisitView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            visit = StoreVisit.objects.get(pk=pk)
            visit.is_approved = True
            visit.save()
            return Response({"status": "approved"})
        except StoreVisit.DoesNotExist:
            return Response({"error": "Visit not found"}, status=404)

class PendingApprovalsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pending_stores = Store.objects.filter(is_approved=False)
        pending_visits = StoreVisit.objects.filter(is_approved=False)
        
        return Response({
            "pending_stores": StoreSerializer(pending_stores, many=True).data,
            "pending_visits": StoreVisitSerializer(pending_visits, many=True).data
        })
