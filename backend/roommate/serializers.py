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
        fields = ['id', 'user', 'title', 'description', 'location', 'rent', 'gender_preference', 'occupation_preference', 'contact_email', 'is_active', 'created_at', 'updated_at', 'images']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
