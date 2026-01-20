from django.core.management.base import BaseCommand
from tracking.models import Route, Store
import random

class Command(BaseCommand):
    help = 'Populates the database with dummy routes and stores.'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating dummy data...')
        
        # Define 3 Routes
        routes_data = [
            {"name": "Downtown Route", "description": "Main city center and commercial district"},
            {"name": "Suburban Route", "description": "Residential areas and outskirts"},
            {"name": "Industrial Route", "description": "factories and warehouse zones"},
        ]

        # Base location (Approx Delhi) to generate stores around
        base_lat = 28.6139
        base_lon = 77.2090

        for r_data in routes_data:
            route, created = Route.objects.get_or_create(name=r_data["name"], defaults={"description": r_data["description"]})
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
                        "is_approved": True # Dummy data relies on being approved
                    }
                )
        
        self.stdout.write(self.style.SUCCESS('Successfully populated dummy data.'))
