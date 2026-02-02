from django.contrib import admin
from .models import Church, ScoreTransaction, ScheduleEvent

@admin.register(Church)
class ChurchAdmin(admin.ModelAdmin):
    list_display = ('name', 'total_score') # Show live score in admin list
    prepopulated_fields = {'slug': ('name',)} # Auto-fill slug from name

@admin.register(ScoreTransaction)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ('church', 'points', 'reason', 'timestamp')
    list_filter = ('church', 'timestamp') # Add sidebar filters

@admin.register(ScheduleEvent)
class ScheduleEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_time', 'location')