from rest_framework import serializers
from .models import RoommatePost, RoommateImage
from accounts.serializers import UserSerializer

class RoommateImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoommateImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class RoommatePostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    images = RoommateImageSerializer(many=True, read_only=True)
    class Meta:
        model = RoommatePost
        fields = [
            'id', 'user', 'title', 'description', 'location', 'rent', 'available_from',
            'lease_duration', 'room_type', 'preferred_gender', 'current_occupants',
            'total_occupants', 'has_furniture', 'has_parking', 'has_laundry',
            'has_kitchen', 'has_wifi', 'is_pets_allowed', 'is_smoking_allowed',
            'occupation', 'university', 'contact_number', 'contact_email',
            'is_active', 'created_at', 'updated_at', 'images'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
