from django.core.management.base import BaseCommand
from tracking.models import Route, Store, Notification, RegularizationRequest, Attendance, LocationUpdate, RouteAssignment, StoreVisit
from django.contrib.auth.models import User
import random
from datetime import date, timedelta
import django.utils.timezone

class Command(BaseCommand):
    help = 'Populates the database with dummy routes, stores, and other data.'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating dummy data...')
        
        # Ensure a user exists for attributions
        user, created = User.objects.get_or_create(username='admin', defaults={'email': 'admin@example.com', 'is_staff': True, 'is_superuser': True})
        if created:
            user.set_password('admin123')
            user.save()
            self.stdout.write('Created superuser: admin')
        else:
            if not user.is_staff:
                user.is_staff = True
                user.save()
                self.stdout.write('Updated admin to be staff.')
        
        # Define 3 Routes
        routes_data = [
            {"name": "Downtown Route", "description": "Main city center and commercial district"},
            {"name": "Suburban Route", "description": "Residential areas and outskirts"},
            {"name": "Industrial Route", "description": "factories and warehouse zones"},
        ]

        # Base location (Approx Delhi) to generate stores around
        base_lat = 28.6139
        base_lon = 77.2090

        all_routes = []
        for r_data in routes_data:
            route, created = Route.objects.get_or_create(name=r_data["name"], defaults={"description": r_data["description"]})
            all_routes.append(route)
            if created:
                self.stdout.write(f'Created route: {route.name}')
            else:
                self.stdout.write(f'Route already exists: {route.name}')

            # Create 10 stores per route
            for i in range(1, 11):
                # Random location offset
                lat_offset = random.uniform(-0.05, 0.05)
                lon_offset = random.uniform(-0.05, 0.05)
                
                capacity = random.choice(['small', 'medium', 'large'])
                
                store_name = f"{route.name.split()[0]} Store #{i}"
                
                Store.objects.get_or_create(
                    name=store_name,
                    defaults={
                        "route": route,
                        "manager_name": f"Manager {i}",
                        "phone_number": f"98765432{i:02d}",
                        "address": f"Address Line {i}, {route.name}",
                        "latitude": base_lat + lat_offset,
                        "longitude": base_lon + lon_offset,
                        "capacity_size": capacity,
                        "is_approved": True 
                    }
                )

        # Create Notifications
        if not Notification.objects.exists():
            Notification.objects.create(sender=user, title="Welcome to BlueLady", message="Welcome to the new field force app!")
            Notification.objects.create(sender=user, title="Policy Update", message="Please punch in before 9:30 AM.")
            self.stdout.write('Created dummy notifications.')

        # Create Regularization Requests
        if not RegularizationRequest.objects.exists():
            RegularizationRequest.objects.create(
                user=user, 
                date=date.today() - timedelta(days=1), 
                reason="Forgot phone at home",
                status='pending'
            )
            RegularizationRequest.objects.create(
                user=user, 
                date=date.today() - timedelta(days=2), 
                reason="Battery died",
                status='approved'
            )
            self.stdout.write('Created dummy regularization requests.')

        # Create Dummy Agents
        for i in range(1, 4):
            agent_username = f'agent{i}'
            agent, created = User.objects.get_or_create(username=agent_username)
            if created:
                agent.set_password('password123')
                agent.first_name = f'Agent'
                agent.last_name = f'{i}'
                agent.email = f'agent{i}@example.com'
                agent.save()
                self.stdout.write(f'Created agent: {agent_username}')
            
            # Create Route Assignments
            if not RouteAssignment.objects.filter(user=agent).exists():
                route = random.choice(all_routes)
                RouteAssignment.objects.create(
                    user=agent,
                    route=route,
                    date=date.today()
                )
                self.stdout.write(f'Assigned {route.name} to {agent_username} for today.')

            # Create Store Visits
            if not StoreVisit.objects.filter(user=agent).exists():
                stores = Store.objects.filter(route=RouteAssignment.objects.get(user=agent, date=date.today()).route)
                if stores.exists():
                    visited_store = stores.first()
                    StoreVisit.objects.create(
                        user=agent,
                        store=visited_store,
                        latitude=visited_store.latitude,
                        longitude=visited_store.longitude,
                        photo='store_visit_photos/dummy_store.jpg',
                        is_approved=random.choice([True, False])
                    )
                    self.stdout.write(f'Created dummy visit for {agent_username} at {visited_store.name}')

            # Create Attendance for Agents
            if not Attendance.objects.filter(user=agent).exists():
                # Present Today
                Attendance.objects.create(
                    user=agent,
                    latitude=base_lat + random.uniform(-0.01, 0.01),
                    longitude=base_lon + random.uniform(-0.01, 0.01),
                    photo='attendance_photos/dummy.jpg',
                    timestamp=django.utils.timezone.now()
                )
                # Present Yesterday
                Attendance.objects.create(
                    user=agent,
                    latitude=base_lat,
                    longitude=base_lon,
                    photo='attendance_photos/dummy.jpg',
                    timestamp=django.utils.timezone.now() - timedelta(days=1)
                )
        
        self.stdout.write(self.style.SUCCESS('Successfully populated dummy data.'))
