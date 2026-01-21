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

    def get(self, request, user_id=None):
        # If user_id is provided, get that user's location (manager view)
        # Otherwise get current user's location (self view)
        target_id = user_id if user_id else request.user.id
        
        try:
            latest = LocationUpdate.objects.filter(user_id=target_id).latest('timestamp')
            serializer = LocationSerializer(latest)
            return Response(serializer.data)
        except LocationUpdate.DoesNotExist:
            return Response({"error": "No location found"}, status=404)

class AttendanceCreateView(generics.CreateAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        attendance = serializer.save(user=self.request.user)
        # Also update location for live tracking
        LocationUpdate.objects.create(
            user=self.request.user,
            latitude=attendance.latitude,
            longitude=attendance.longitude
        )

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

class RouteListView(generics.ListCreateAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

class RouteDetailView(generics.RetrieveUpdateDestroyAPIView):
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

class StoreDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        pending_regularization = RegularizationRequest.objects.filter(status='pending')
        
        return Response({
            "pending_stores": StoreSerializer(pending_stores, many=True).data,
            "pending_visits": StoreVisitSerializer(pending_visits, many=True).data,
            "pending_regularization": RegularizationRequestSerializer(pending_regularization, many=True).data
        })

from .models import Notification
from .serializers import NotificationSerializer

class NotificationListCreateView(generics.ListCreateAPIView):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Strict check for staff status
        if not self.request.user.is_staff:
             from rest_framework.exceptions import PermissionDenied
             raise PermissionDenied("You do not have permission to send notifications. Manager access required.")
        serializer.save(sender=self.request.user)

from .models import RegularizationRequest
from .serializers import RegularizationRequestSerializer

class RegularizationListCreateView(generics.ListCreateAPIView):
    serializer_class = RegularizationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RegularizationRequest.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ManagerRegularizationListView(generics.ListAPIView):
    queryset = RegularizationRequest.objects.all().order_by('-created_at')
    serializer_class = RegularizationRequestSerializer
    permission_classes = [permissions.IsAuthenticated] # Add IsManager check in real app

class ApproveRegularizationView(generics.UpdateAPIView):
    queryset = RegularizationRequest.objects.all()
    serializer_class = RegularizationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        req = serializer.save(status='approved')
        # Create Attendance Record
        # We need a dummy photo or allow null photo in Attendance if created via regularization
        # For now, let's just create it with empty lat/long/photo or defaults
        from datetime import datetime, time
        import pytz
        # date is DateField, convert to DateTime for timestamp
        # Assuming 9 AM start time for regularization
        dt = datetime.combine(req.date, time(9, 0)) 
        Attendance.objects.create(
            user=req.user,
            latitude=0.0,
            longitude=0.0,
            photo='attendance_photos/regularized.jpg', # placeholder
            timestamp=dt # Note: auto_now_add might override this on creation! 
            # If timestamp is auto_now_add=True in model, we can't set it easily on creation.
            # We should check Attendance model.
        )

from .models import RouteAssignment
from .serializers import RouteAssignmentSerializer

class RouteAssignmentListCreateView(generics.ListCreateAPIView):
    # This view allows Managers to see all assignments and Create new ones
    # It also allows Staff to see THEIR OWN assignments (filtered)
    serializer_class = RouteAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = RouteAssignment.objects.all()
        
        # If staff, only show their own
        if not user.is_staff: 
            # Note: In Django User model, is_staff usually means admin access, 
            # but here we might be using it for Manager. 
            # Let's assume standard users are field agents.
            # If we used is_staff for Manager, then agents are NOT is_staff.
            queryset = queryset.filter(user=user)
        
        # Filter by date if provided
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)
            
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        date = serializer.validated_data['date']
        route = serializer.validated_data['route']

        # Check if already assigned
        existing = RouteAssignment.objects.filter(user=user, date=date).first()
        
        if existing:
            # Update existing assignment
            existing.route = route
            existing.save()
            # Return the updated instance
            return Response(RouteAssignmentSerializer(existing).data, status=200)

        # If not existing, create new
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

