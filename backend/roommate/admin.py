from django.contrib import admin
from .models import RoommatePost, RoommateImage


@admin.register(RoommatePost)
class RoommatePostAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'location', 'rent', 'available_from', 'room_type', 'preferred_gender', 'is_active', 'created_at'
    )
    list_filter = ('is_active', 'available_from', 'room_type', 'preferred_gender')
    search_fields = ('title', 'description', 'location', 'user__email', 'user__name')
    ordering = ('-created_at',)


@admin.register(RoommateImage)
class RoommateImageAdmin(admin.ModelAdmin):
    list_display = ('post', 'is_primary', 'uploaded_at')
    list_filter = ('is_primary',)
    search_fields = ('post__title',)
