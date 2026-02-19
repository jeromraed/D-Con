from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from .models import Church, ScheduleEvent, ScoreTransaction, Member
from .serializers import (
    ChurchSerializer, ChurchDetailSerializer, ScheduleSerializer, 
    ScoreTransactionSerializer, MemberSerializer
)
from django.db.models import Sum, Count
from django.db.models.functions import Coalesce


class ChurchLeaderboardView(generics.ListAPIView):
    """Leaderboard of churches ranked by total member scores"""
    serializer_class = ChurchSerializer

    def get_queryset(self):
        return Church.objects.annotate(
            leaderboard_score=Coalesce(Sum('members__score'), 0),
            members_total=Count('members')
        ).order_by('-leaderboard_score')


class MemberLeaderboardView(generics.ListAPIView):
    """Individual member leaderboard"""
    serializer_class = MemberSerializer
    
    def get_queryset(self):
        return Member.objects.select_related('church').order_by('-score', 'name')


class ChurchDetailView(generics.RetrieveAPIView):
    """Get church details with its members"""
    serializer_class = ChurchDetailSerializer
    queryset = Church.objects.all()


class ChurchListView(generics.ListAPIView):
    """List all churches (for dropdowns)"""
    serializer_class = ChurchSerializer
    queryset = Church.objects.annotate(
        leaderboard_score=Coalesce(Sum('members__score'), 0),
        members_total=Count('members')

    )


class MemberListView(generics.ListAPIView):
    """List all members (for dropdowns)"""
    serializer_class = MemberSerializer
    queryset = Member.objects.select_related('church').all()


class ScheduleView(generics.ListAPIView):
    queryset = ScheduleEvent.objects.all()
    serializer_class = ScheduleSerializer


# ===== Admin-only endpoints =====

class MemberManageView(APIView):
    """Admin: Create, update, delete members"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        """Create a new member"""
        serializer = MemberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk=None):
        """Update member (including score)"""
        try:
            member = Member.objects.get(pk=pk)
        except Member.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = MemberSerializer(member, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk=None):
        """Delete a member"""
        try:
            member = Member.objects.get(pk=pk)
            member.delete()
            return Response({'message': 'Member deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Member.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)


class AddMemberScoreView(APIView):
    """Admin: Add points to a member and log the transaction"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        member_id = request.data.get('member')
        points = request.data.get('points')
        reason = request.data.get('reason', '')
        
        if not member_id or points is None:
            return Response({'error': 'member and points are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            member = Member.objects.get(pk=member_id)
        except Member.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Update member score
        member.score += int(points)
        member.save()
        
        # Log transaction
        transaction = ScoreTransaction.objects.create(
            member=member,
            points=int(points),
            reason=reason
        )
        
        return Response({
            'member': MemberSerializer(member).data,
            'transaction': ScoreTransactionSerializer(transaction).data
        }, status=status.HTTP_201_CREATED)


class ScheduleManageView(generics.GenericAPIView):
    """Admin-only endpoint to create/update/delete schedule events"""
    queryset = ScheduleEvent.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        """Create a new event"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk=None):
        """Update an existing event"""
        try:
            event = self.get_queryset().get(pk=pk)
        except ScheduleEvent.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(event, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk=None):
        """Partially update an event (e.g. toggle is_done)"""
        try:
            event = self.get_queryset().get(pk=pk)
        except ScheduleEvent.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk=None):
        """Delete an event"""
        try:
            event = self.get_queryset().get(pk=pk)
            event.delete()
            return Response({'message': 'Event deleted'}, status=status.HTTP_204_NO_CONTENT)
        except ScheduleEvent.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)