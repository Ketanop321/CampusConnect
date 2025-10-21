from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from .models import Event, EventComment, EventRegistration
from .serializers import EventSerializer, EventCommentSerializer, EventRegistrationSerializer
from accounts.permissions import IsOwnerOrReadOnly
from .permissions import IsAdminOrganizerOrReadOnly

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    # Read is open to everyone. Writes are limited to staff organizers (or superuser)
    permission_classes = [IsAdminOrganizerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        queryset = Event.objects.all()

        # Filter by approval status - show approved events by default
        # Staff users can see all events
        # Regular users (non-staff) and anonymous users can only see APPROVED events created by STAFF
        user = self.request.user
        if not (user.is_authenticated and user.is_staff):
            queryset = queryset.filter(is_approved=True, organizer__is_staff=True)
        
        # Handle query parameters
        is_upcoming = self.request.query_params.get('is_upcoming')
        is_past = self.request.query_params.get('is_past')
        event_type = self.request.query_params.get('event_type')
        is_online = self.request.query_params.get('is_online')
        search = self.request.query_params.get('search')
        
        if is_upcoming == 'true':
            queryset = queryset.filter(start_datetime__gt=timezone.now())
        elif is_past == 'true':
            queryset = queryset.filter(start_datetime__lt=timezone.now())
            
        if event_type:
            queryset = queryset.filter(event_type=event_type)
            
        if is_online is not None:
            queryset = queryset.filter(is_online=is_online.lower() == 'true')
            
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        # Only staff users can create events (enforced by permission). Auto-approve staff-created events by default.
        is_approved = bool(self.request.user and self.request.user.is_staff)
        event = serializer.save(organizer=self.request.user, is_approved=is_approved)
        return event

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        """Register the current user for the event (idempotent)."""
        event = self.get_object()
        # Check registration requirements and capacity
        if event.registration_required:
            if event.registration_deadline and event.registration_deadline < timezone.now():
                return Response({"detail": "Registration deadline has passed."}, status=400)
            if event.max_participants and event.registrations.count() >= event.max_participants:
                return Response({"detail": "Event is full."}, status=400)
        # Create or get existing registration
        reg, created = EventRegistration.objects.get_or_create(event=event, user=request.user)
        serializer = EventRegistrationSerializer(reg, context={'request': request})
        return Response(serializer.data, status=201 if created else 200)

    @action(detail=True, methods=['get', 'post'], url_path='comments', permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def comments(self, request, pk=None):
        """List or add comments for this event."""
        event = self.get_object()
        if request.method.lower() == 'get':
            qs = event.comments.all().order_by('created_at')
            serializer = EventCommentSerializer(qs, many=True, context={'request': request})
            return Response(serializer.data)

        # POST: create a new comment
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=401)
        serializer = EventCommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(event=event, user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class EventCommentViewSet(viewsets.ModelViewSet):
    queryset = EventComment.objects.all()
    serializer_class = EventCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.all()
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
