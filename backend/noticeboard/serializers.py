from rest_framework import serializers
from .models import Event, EventComment, EventRegistration, EventImage
from accounts.serializers import UserSerializer

class EventImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = EventImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
    
    def get_image(self, obj):
        """Get the absolute URL of the image."""
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            else:
                # Fallback: construct absolute URL manually
                base_url = 'http://localhost:8000'  # You might want to make this configurable
                return f"{base_url}{obj.image.url}"
        return None

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
    """
    Serializer for Event model.
    Handles event data including image uploads.
    """
    organizer = UserSerializer(read_only=True)
    images = EventImageSerializer(many=True, read_only=True)
    comments = EventCommentSerializer(many=True, read_only=True)
    registrations = EventRegistrationSerializer(many=True, read_only=True)
    registrations_count = serializers.SerializerMethodField()
    
    # For handling image upload during event creation/update
    image = serializers.ImageField(write_only=True, required=False)
    
    # Add primary image URL field
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'start_datetime', 'end_datetime',
            'location', 'location_url', 'organizer', 'is_online', 'meeting_link',
            'max_participants', 'is_free', 'price', 'registration_required',
            'registration_deadline', 'is_approved', 'created_at', 'updated_at',
            'images', 'comments', 'registrations', 'registrations_count',
            'image', 'primary_image'
        ]
        read_only_fields = ['id', 'organizer', 'created_at', 'updated_at', 'is_approved']
        extra_kwargs = {
            'location_url': {'required': False, 'allow_blank': True, 'allow_null': True},
            'meeting_link': {'required': False, 'allow_blank': True, 'allow_null': True},
            'max_participants': {'required': False, 'allow_null': True},
            'registration_deadline': {'required': False, 'allow_null': True},
        }
    
    def get_registrations_count(self, obj):
        """Get the count of registrations for this event."""
        return obj.registrations.count()
    
    def get_primary_image(self, obj):
        """Get the URL of the primary image if it exists."""
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image and primary_image.image:
            request = self.context.get('request')
            if request is not None:
                full_url = request.build_absolute_uri(primary_image.image.url)
                print(f"Primary image URL for event {obj.id}: {full_url}")
                return full_url
            else:
                # Fallback: construct absolute URL manually
                base_url = 'http://localhost:8000'  # You might want to make this configurable
                full_url = f"{base_url}{primary_image.image.url}"
                print(f"Primary image URL (manual construction) for event {obj.id}: {full_url}")
                return full_url
        print(f"No primary image found for event {obj.id}")
        return None
    
    def create(self, validated_data):
        # Handle image upload if provided
        image_file = validated_data.pop('image', None)
        
        # Create the event
        event = super().create(validated_data)
        
        # Add image if provided
        if image_file:
            from .models import EventImage
            EventImage.objects.create(event=event, image=image_file, is_primary=True)
            
        return event
        
    def update(self, instance, validated_data):
        # Handle image upload if provided
        image_file = validated_data.pop('image', None)
        
        # Update the event
        event = super().update(instance, validated_data)
        
        # Add new image if provided
        if image_file:
            from .models import EventImage
            # Mark existing primary image as not primary
            event.images.filter(is_primary=True).update(is_primary=False)
            # Create new primary image
            EventImage.objects.create(event=event, image=image_file, is_primary=True)
            
        return event
