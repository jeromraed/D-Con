from rest_framework import generics
from .models import Church, ScheduleEvent
from .serializers import ChurchSerializer, ScheduleSerializer
from django.db.models import Sum, F

class LeaderboardView(generics.ListAPIView):
    serializer_class = ChurchSerializer

    def get_queryset(self):
        # OPTIMIZATION: We use 'annotate' to calculate sums in the SQL query 
        # instead of Python loops. This is much faster.
        # We also handle the case where a church has 0 transactions (Coalesce logic implied or handled by sorting).
        return Church.objects.annotate(
            calculated_score=Sum('scores__points')
        ).order_by('-calculated_score') # Sort by highest score first

class ScheduleView(generics.ListAPIView):
    queryset = ScheduleEvent.objects.all()
    serializer_class = ScheduleSerializer