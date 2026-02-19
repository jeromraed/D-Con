from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_admin_user(apps, schema_editor):
    """Create a default admin user for development/testing"""
    User = apps.get_model('auth', 'User')
    
    # Check if admin already exists
    if not User.objects.filter(username='admin').exists():
        User.objects.create(
            username='admin',
            email='admin@dcon.local',
            password=make_password('admin123'),
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )


def remove_admin_user(apps, schema_editor):
    """Remove the default admin user on migration reversal"""
    User = apps.get_model('auth', 'User')
    User.objects.filter(username='admin').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('competition', '0002_scheduleevent'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, remove_admin_user),
    ]
