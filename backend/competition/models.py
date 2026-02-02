from django.db import models

class Church(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, help_text="Unique ID like 'st-mark' for URLs")
    description = models.TextField(blank=True)
    # We don't store 'total_score' here. We calculate it dynamically!
    
    def __str__(self):
        return self.name

    @property
    def total_score(self):
        # Sum up all points from the transactions
        transactions = self.scores.all()
        return sum([t.points for t in transactions])

class ScoreTransaction(models.Model):
    church = models.ForeignKey(Church, related_name='scores', on_delete=models.CASCADE)
    points = models.IntegerField(help_text="Can be negative (penalty) or positive")
    reason = models.CharField(max_length=255, help_text="Why were these points given?")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.church.name}: {self.points} ({self.reason})"

class ScheduleEvent(models.Model):
    title = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=100, help_text="e.g. 'Main Hall' or 'Football Field'")
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['start_time'] # Always show earliest first

    def __str__(self):
        return f"{self.start_time.strftime('%H:%M')} - {self.title}"