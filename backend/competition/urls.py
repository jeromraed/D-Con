from django.urls import path
from .views import LeaderboardView, ScheduleView

urlpatterns = [
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('schedule/', ScheduleView.as_view(), name='schedule'),
]