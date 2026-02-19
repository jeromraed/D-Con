# Backend Dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

RUN mkdir -p /app/data
RUN chmod 777 /app/data


# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Create a non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run migrations, seed data, create admin, then start gunicorn
CMD ["sh", "-c", "\
  python manage.py migrate && \
  python manage.py seed_schedule --clear && \
  python -c \"import django; django.setup(); from django.contrib.auth.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@dcon.org', 'admin123'); print('Admin user ready')\" && \
  gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
