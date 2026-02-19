from django.contrib import admin
from .models import Church, ScoreTransaction, ScheduleEvent, Member, SubEvent


class MemberInline(admin.TabularInline):
    model = Member
    extra = 1
    fields = ('name', 'score')


class SubEventInline(admin.TabularInline):
    model = SubEvent
    extra = 1
    fields = ('title', 'location')


@admin.register(Church)
class ChurchAdmin(admin.ModelAdmin):
    list_display = ('name', 'member_count', 'total_score')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [MemberInline]
    
    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'church', 'score')
    list_filter = ('church',)
    search_fields = ('name',)


@admin.register(ScoreTransaction)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ('get_target', 'points', 'reason', 'timestamp')
    list_filter = ('member__church', 'timestamp')
    
    def get_target(self, obj):
        return obj.member.name if obj.member else (obj.church.name if obj.church else 'N/A')
    get_target.short_description = 'Target'


@admin.register(ScheduleEvent)
class ScheduleEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'day', 'start_time', 'location', 'is_done')
    list_filter = ('day', 'is_done')
    inlines = [SubEventInline]