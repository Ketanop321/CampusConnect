from rest_framework import serializers
from .models import Event, EventImage, EventComment, EventRegistration
from accounts.models import User

class AdminEventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']
        read_only_fields = ['uploaded_at']

class AdminEventCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = EventComment
        fields = ['id', 'content', 'user', 'user_name', 'user_email', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'user']

class AdminEventRegistrationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = EventRegistration
        fields = ['id', 'user', 'user_name', 'user_email', 'registration_date', 'attended', 'notes']
        read_only_fields = ['registration_date']

class AdminEventSerializer(serializers.ModelSerializer):
    images = AdminEventImageSerializer(many=True, required=False)
    comments = AdminEventCommentSerializer(many=True, read_only=True)
    registrations = AdminEventRegistrationSerializer(many=True, read_only=True)
    organizer_name = serializers.CharField(source='organizer.name', read_only=True)
    organizer_email = serializers.EmailField(source='organizer.email', read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_ongoing = serializers.BooleanField(read_only=True)
    registration_count = serializers.IntegerField(source='registrations.count', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'start_datetime', 'end_datetime',
            'location', 'location_url', 'organizer', 'organizer_name', 'organizer_email',
            'is_online', 'meeting_link', 'max_participants', 'is_free', 'price',
            'registration_required', 'registration_deadline', 'is_approved',
            'created_at', 'updated_at', 'images', 'comments', 'registrations',
            'is_upcoming', 'is_ongoing', 'registration_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'organizer']

    def validate(self, data):
        """
        Check that start_datetime is before end_datetime
        """
        if 'start_datetime' in data and 'end_datetime' in data:
            if data['start_datetime'] > data['end_datetime']:
                raise serializers.ValidationError("End datetime must occur after start datetime")
        
        if 'registration_deadline' in data and 'start_datetime' in data:
            if data['registration_deadline'] > data['start_datetime']:
                raise serializers.ValidationError("Registration deadline must be before the event starts")
        
        return data
