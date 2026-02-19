from rest_framework import serializers
from .models import Church, ScheduleEvent, ScoreTransaction, Member, SubEvent


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for team members"""
    church_name = serializers.CharField(source='church.name', read_only=True)
    
    class Meta:
        model = Member
        fields = ['id', 'name', 'church', 'church_name', 'score']


class ChurchSerializer(serializers.ModelSerializer):
    """Serializer for churches/teams with aggregated score"""
    leaderboard_score = serializers.IntegerField(read_only=True)
    members_total = serializers.IntegerField(read_only=True)

    class Meta:
        model = Church
        fields = ['id', 'name', 'slug', 'description', 'leaderboard_score', 'members_total']


class ChurchDetailSerializer(serializers.ModelSerializer):
    total_score = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    members = MemberSerializer(many=True, read_only=True)

    class Meta:
        model = Church
        fields = ['id', 'name', 'slug', 'description', 'total_score', 'member_count', 'members']

    def get_total_score(self, obj):
        return obj.total_score

    def get_member_count(self, obj):
        return obj.member_count


class SubEventSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = SubEvent
        fields = ['id', 'title', 'location', 'description', 'speaker_name', 'speaker_bio', 'speaker_contact', 'speaker_image']


class ScheduleSerializer(serializers.ModelSerializer):
    sub_events = SubEventSerializer(many=True, required=False)

    class Meta:
        model = ScheduleEvent
        fields = ['id', 'title', 'start_time', 'end_time', 'location', 'description', 'day', 'is_done', 'sub_events']

    def create(self, validated_data):
        sub_events_data = validated_data.pop('sub_events', [])
        event = ScheduleEvent.objects.create(**validated_data)
        for sub in sub_events_data:
            sub.pop('id', None)
            SubEvent.objects.create(schedule_event=event, **sub)
        return event

    def update(self, instance, validated_data):
        sub_events_data = validated_data.pop('sub_events', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if sub_events_data is not None:
            # Replace all sub-events with the new list
            instance.sub_events.all().delete()
            for sub in sub_events_data:
                sub.pop('id', None)
                SubEvent.objects.create(schedule_event=instance, **sub)

        return instance


class ScoreTransactionSerializer(serializers.ModelSerializer):
    """Serializer for score transactions (now tied to members)"""
    member_name = serializers.CharField(source='member.name', read_only=True)
    church_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ScoreTransaction
        fields = ['id', 'member', 'member_name', 'church_name', 'points', 'reason', 'timestamp']
        read_only_fields = ['timestamp']
    
    def get_church_name(self, obj):
        if obj.member:
            return obj.member.church.name
        return obj.church.name if obj.church else None