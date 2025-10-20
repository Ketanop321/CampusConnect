from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, F
from django.utils import timezone

from .models import Event, EventImage, EventComment, EventRegistration
from .admin_serializers import (
    AdminEventSerializer, 
    AdminEventCommentSerializer,
    AdminEventRegistrationSerializer
)
from accounts.permissions import IsAdminOrReadOnly

class AdminEventViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset for managing events with additional admin features.
    """
    serializer_class = AdminEventSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'event_type', 'is_online', 'is_free', 'registration_required', 'is_approved'
    ]
    search_fields = ['title', 'description', 'location', 'organizer__name', 'organizer__email']
    ordering_fields = ['start_datetime', 'end_datetime', 'created_at', 'updated_at']
    ordering = ['-start_datetime']

    def get_queryset(self):
        queryset = Event.objects.all().prefetch_related(
            'images', 'comments', 'registrations'
        ).annotate(
            registration_count=Count('registrations')
        )

        # Filter by approval status
        is_approved = self.request.query_params.get('is_approved')
        if is_approved is not None:
            queryset = queryset.filter(is_approved=is_approved.lower() == 'true')

        # Filter by date ranges
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(start_datetime__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_datetime__date__lte=end_date)

        return queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an event."""
        event = self.get_object()
        event.is_approved = True
        event.save(update_fields=['is_approved'])
        return Response({'status': 'event approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject an event."""
        event = self.get_object()
        event.is_approved = False
        event.save(update_fields=['is_approved'])
        return Response({'status': 'event rejected'})

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for an event."""
        event = self.get_object()
        return Response({
            'total_registrations': event.registrations.count(),
            'attended_registrations': event.registrations.filter(attended=True).count(),
            'attendance_rate': (
                event.registrations.filter(attended=True).count() / 
                event.registrations.count() * 100 if event.registrations.exists() else 0
            ),
            'comments_count': event.comments.count(),
            'images_count': event.images.count(),
        })


class AdminEventCommentViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset for managing event comments.
    """
    serializer_class = AdminEventCommentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content', 'user__name', 'user__email']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return EventComment.objects.all().select_related('user', 'event')


class AdminEventRegistrationViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset for managing event registrations.
    """
    serializer_class = AdminEventRegistrationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['attended', 'event']
    search_fields = ['user__name', 'user__email', 'notes']
    ordering_fields = ['registration_date', 'user__name']
    ordering = ['-registration_date']

    def get_queryset(self):
        return EventRegistration.objects.all().select_related('user', 'event')

    @action(detail=True, methods=['post'])
    def mark_attended(self, request, pk=None):
        """Mark a registration as attended."""
        registration = self.get_object()
        registration.attended = True
        registration.save(update_fields=['attended'])
        return Response({'status': 'marked as attended'})
