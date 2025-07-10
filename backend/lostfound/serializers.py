from rest_framework import serializers
from .models import LostFoundItem
from accounts.serializers import UserSerializer

class LostFoundItemSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    claimed_by = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = LostFoundItem
        fields = [
            'id', 'item_name', 'description', 'status', 'status_display',
            'location', 'date_reported', 'date_occurred', 'reporter',
            'claimed_by', 'is_resolved', 'image', 'contact_info',
            'category', 'color', 'brand', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'created_at', 'updated_at']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'location': {'required': False, 'allow_blank': True},
            'date_occurred': {'required': False},
            'image': {'required': False, 'allow_blank': True},
            'contact_info': {'required': False, 'allow_blank': True},
            'category': {'required': False, 'allow_blank': True},
            'color': {'required': False, 'allow_blank': True},
            'brand': {'required': False, 'allow_blank': True},
        }
    
    def create(self, validated_data):
        # Set the reporter to the current user
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)

class LostFoundItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LostFoundItem
        fields = [
            'item_name', 'description', 'status', 'location',
            'date_occurred', 'is_resolved', 'image', 'contact_info',
            'category', 'color', 'brand'
        ]
        extra_kwargs = {
            'item_name': {'required': False},
            'description': {'required': False, 'allow_blank': True},
            'status': {'required': False},
            'location': {'required': False, 'allow_blank': True},
            'date_occurred': {'required': False},
            'image': {'required': False, 'allow_blank': True},
            'contact_info': {'required': False, 'allow_blank': True},
            'category': {'required': False, 'allow_blank': True},
            'color': {'required': False, 'allow_blank': True},
            'brand': {'required': False, 'allow_blank': True},
        }
