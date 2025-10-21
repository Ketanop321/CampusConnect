from django.contrib import admin
from .models import Event, EventImage, EventRegistration, EventComment


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'event_type', 'start_datetime', 'end_datetime',
        'organizer', 'is_online', 'is_free', 'registration_required', 'is_approved'
    )
    list_filter = (
        'event_type', 'is_online', 'is_free', 'registration_required', 'is_approved'
    )
    search_fields = ('title', 'description', 'location', 'organizer__email', 'organizer__name')
    ordering = ('-start_datetime',)


@admin.register(EventImage)
class EventImageAdmin(admin.ModelAdmin):
    list_display = ('event', 'is_primary', 'uploaded_at')
    list_filter = ('is_primary',)
    search_fields = ('event__title',)


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'registration_date', 'attended')
    list_filter = ('attended', 'registration_date')
    search_fields = ('event__title', 'user__email', 'user__name')


@admin.register(EventComment)
class EventCommentAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('event__title', 'user__email', 'user__name', 'content')
