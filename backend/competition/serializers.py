from rest_framework import serializers
from .models import Church, ScheduleEvent

class ChurchSerializer(serializers.ModelSerializer):
    # We explicitly include the computed property 'total_score'
    total_score = serializers.IntegerField(read_only=True)

    class Meta:
        model = Church
        fields = ['id', 'name', 'slug', 'description', 'total_score']


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleEvent
        fields = '__all__'