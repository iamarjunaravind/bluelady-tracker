import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'employee_tracker.settings')
django.setup()
from django.contrib.auth.models import User
if not User.objects.filter(username='manager').exists():
    User.objects.create_superuser('manager', 'manager@example.com', 'password123')
    print("Superuser 'manager' created with password 'password123'.")
else:
    print("Superuser 'manager' already exists.")
