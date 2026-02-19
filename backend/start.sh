#!/usr/bin/env bash
set -e

echo "Running migrations..."
python manage.py migrate

echo "Seeding schedule..."
python manage.py seed_schedule --clear

echo "Creating admin user..."
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@dcon.org', 'admin123')
    print('Admin user created')
else:
    print('Admin user already exists')
"

echo "Starting server..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000}
