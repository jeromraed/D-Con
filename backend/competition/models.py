from django.db import models


class Church(models.Model):
    """A church/team that members belong to"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, help_text="Unique ID like 'st-mark' for URLs")
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

    @property
    def total_score(self):
        """Sum of all member scores in this church"""
        from django.db.models import Sum
        result = self.members.aggregate(total=Sum('score'))
        return result['total'] or 0
    
    @property
    def member_count(self):
        return self.members.count()


class Member(models.Model):
    """A team member belonging to a church with their own score"""
    name = models.CharField(max_length=100)
    church = models.ForeignKey(Church, related_name='members', on_delete=models.CASCADE)
    score = models.IntegerField(default=0, help_text="Member's individual score")
    
    class Meta:
        ordering = ['-score', 'name']  # Highest score first, then alphabetical
    
    def __str__(self):
        return f"{self.name} ({self.church.name})"


class ScoreTransaction(models.Model):
    """Log of score changes for audit trail"""
    member = models.ForeignKey(Member, related_name='transactions', on_delete=models.CASCADE, null=True, blank=True)
    church = models.ForeignKey(Church, related_name='scores', on_delete=models.CASCADE, null=True, blank=True)
    points = models.IntegerField(help_text="Can be negative (penalty) or positive")
    reason = models.CharField(max_length=255, help_text="Why were these points given?")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        target = self.member.name if self.member else self.church.name
        return f"{target}: {self.points} ({self.reason})"


class ScheduleEvent(models.Model):
    title = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=100, blank=True, default='', help_text="e.g. 'Main Hall' or 'Football Field'")
    description = models.TextField(blank=True)
    day = models.IntegerField(default=1, help_text="Day number (1 or 2)")
    is_done = models.BooleanField(default=False, help_text="Whether this event/task has been completed")

    class Meta:
        ordering = ['day', 'start_time']

    def __str__(self):
        return f"Day {self.day} | {self.start_time.strftime('%H:%M')} - {self.title}"


class SubEvent(models.Model):
    """A parallel session within a ScheduleEvent (e.g. multiple talks at once)"""
    schedule_event = models.ForeignKey(ScheduleEvent, related_name='sub_events', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    location = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')
    speaker_name = models.CharField(max_length=200, blank=True, default='')
    speaker_bio = models.TextField(blank=True, default='')
    speaker_contact = models.CharField(max_length=200, blank=True, default='')  # phone or email
    speaker_image = models.URLField(max_length=500, blank=True, default='')  # URL to speaker photo

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.title} ({self.schedule_event.title})"