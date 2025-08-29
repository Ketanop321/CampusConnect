from rest_framework import serializers
from .models import RoommatePost, RoommateImage
from accounts.serializers import UserSerializer

class RoommateImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoommateImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'is_primary']

class RoommatePostSerializer(serializers.ModelSerializer):
    """
    Serializer for RoommatePost model.
    Handles roommate post data including image uploads.
    """
    user = UserSerializer(read_only=True)
    images = RoommateImageSerializer(many=True, read_only=True)
    
    # For handling image upload during post creation/update
    image = serializers.ImageField(write_only=True, required=False)
    
    # Add primary image URL field
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = RoommatePost
        fields = [
            'id', 'user', 'title', 'description', 'location', 'rent', 'available_from',
            'lease_duration', 'room_type', 'preferred_gender', 'current_occupants',
            'total_occupants', 'has_furniture', 'has_parking', 'has_laundry',
            'has_kitchen', 'has_wifi', 'is_pets_allowed', 'is_smoking_allowed',
            'occupation', 'university', 'contact_number', 'contact_email',
            'is_active', 'created_at', 'updated_at', 'images', 'image', 'primary_image'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
        extra_kwargs = {
            'university': {'required': False, 'allow_blank': True, 'allow_null': True},
            'contact_number': {'required': False, 'allow_blank': True},
        }
    
    def get_primary_image(self, obj):
        """Get the URL of the primary image if it exists."""
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image and primary_image.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None
    
    def create(self, validated_data):
        # Handle image upload if provided
        image_file = validated_data.pop('image', None)
        
        # Set the contact_email to the user's email if not provided
        if 'contact_email' not in validated_data or not validated_data['contact_email']:
            validated_data['contact_email'] = self.context['request'].user.email
            
        # Create the post
        post = super().create(validated_data)
        
        # Add image if provided
        if image_file:
            RoommateImage.objects.create(post=post, image=image_file)
            
        return post
        
    def update(self, instance, validated_data):
        # Handle image upload if provided
        image_file = validated_data.pop('image', None)
        
        # Update the post
        post = super().update(instance, validated_data)
        
        # Add new image if provided
        if image_file:
            # Mark existing primary image as not primary
            post.images.filter(is_primary=True).update(is_primary=False)
            # Create new primary image
            RoommateImage.objects.create(post=post, image=image_file, is_primary=True)
            
        return post
