from rest_framework import serializers
from .models import BookPost, BookImage, BookRequest
from accounts.serializers import UserSerializer

class BookImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class BookPostSerializer(serializers.ModelSerializer):
    posted_by = UserSerializer(read_only=True)
    images = BookImageSerializer(many=True, read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    
    class Meta:
        model = BookPost
        fields = [
            'id', 'title', 'author', 'isbn', 'description', 'condition', 'condition_display',
            'price', 'transaction_type', 'transaction_type_display', 'department', 'course_code',
            'posted_by', 'contact_email', 'contact_phone', 'is_available', 'created_at',
            'updated_at', 'images'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'posted_by']
        extra_kwargs = {
            'isbn': {'required': False, 'allow_blank': True, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True},
            'contact_phone': {'required': False, 'allow_blank': True, 'allow_null': True},
        }
    
    def create(self, validated_data):
        # Set the contact_email to the user's email if not provided
        if 'contact_email' not in validated_data or not validated_data['contact_email']:
            validated_data['contact_email'] = self.context['request'].user.email
        return super().create(validated_data)

class BookRequestSerializer(serializers.ModelSerializer):
    requested_by = UserSerializer(read_only=True)
    book = serializers.PrimaryKeyRelatedField(queryset=BookPost.objects.all())
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = BookRequest
        fields = [
            'id', 'book', 'requested_by', 'message', 'status', 'status_display',
            'registration_date', 'attended', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'requested_by', 'status', 'registration_date', 'attended',
            'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        # Check if the book is available
        if not data['book'].is_available:
            raise serializers.ValidationError("This book is no longer available.")
        
        # Check if the user is not the book owner
        if self.context['request'].user == data['book'].posted_by:
            raise serializers.ValidationError("You cannot request your own book.")
        
        # Check if the user has already made a request for this book
        if BookRequest.objects.filter(
            book=data['book'],
            requested_by=self.context['request'].user
        ).exists():
            raise serializers.ValidationError("You have already requested this book.")
        
        return data
    
    def create(self, validated_data):
        validated_data['requested_by'] = self.context['request'].user
        return super().create(validated_data)
