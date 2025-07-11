from rest_framework import serializers
from .models import Event, EventComment, EventRegistration, EventImage
from accounts.serializers import UserSerializer

class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class EventCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = EventComment
        fields = ['id', 'event', 'user', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class EventRegistrationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = EventRegistration
        fields = ['id', 'event', 'user', 'registration_date', 'attended', 'notes']
        read_only_fields = ['id', 'user', 'registration_date']

class EventSerializer(serializers.ModelSerializer):
    images = EventImageSerializer(many=True, read_only=True)
    comments = EventCommentSerializer(many=True, read_only=True)
    registrations = EventRegistrationSerializer(many=True, read_only=True)
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'event_type', 'start_datetime', 'end_datetime', 'location', 'created_at', 'updated_at', 'images', 'comments', 'registrations']
        read_only_fields = ['id', 'created_at', 'updated_at']
