from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ChurchLeaderboardView, MemberLeaderboardView, ChurchDetailView, 
    ChurchListView, MemberListView, ScheduleView, 
    MemberManageView, AddMemberScoreView, ScheduleManageView
)
from .auth_views import LoginView, UserProfileView, LogoutView, RegisterView, ChangePasswordView, UserListView, ToggleAdminView

urlpatterns = [
    # Public endpoints - Leaderboards
    path('leaderboard/', ChurchLeaderboardView.as_view(), name='church_leaderboard'),
    path('leaderboard/members/', MemberLeaderboardView.as_view(), name='member_leaderboard'),
    
    # Public endpoints - Data
    path('churches/', ChurchListView.as_view(), name='churches'),
    path('churches/<int:pk>/', ChurchDetailView.as_view(), name='church_detail'),
    path('members/', MemberListView.as_view(), name='members'),
    path('schedule/', ScheduleView.as_view(), name='schedule'),
    
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/users/', UserListView.as_view(), name='user_list'),
    path('auth/users/<int:pk>/toggle-admin/', ToggleAdminView.as_view(), name='toggle_admin'),
    
    # Admin-only endpoints
    path('members/manage/', MemberManageView.as_view(), name='add_member'),
    path('members/manage/<int:pk>/', MemberManageView.as_view(), name='manage_member'),
    path('scores/', AddMemberScoreView.as_view(), name='add_score'),
    path('schedule/manage/', ScheduleManageView.as_view(), name='add_event'),
    path('schedule/manage/<int:pk>/', ScheduleManageView.as_view(), name='manage_event'),
]