#!/usr/bin/env bash

echo "=== D-Con Backend Starting ==="
echo "PORT: ${PORT:-8000}"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'NO - THIS WILL FAIL')"

# Run migrations
echo "Running migrations..."
python manage.py migrate || echo "WARNING: Migrations failed"

# Seed schedule (non-fatal if it fails)
echo "Seeding schedule..."
python manage.py seed_schedule --clear || echo "WARNING: Seed failed, continuing..."

# Create admin user (non-fatal if it fails)
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
" || echo "WARNING: Admin creation failed, continuing..."

echo "Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000}
