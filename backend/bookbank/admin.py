from django.contrib import admin
from .models import BookPost, BookImage, BookRequest

@admin.register(BookPost)
class BookPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'department', 'transaction_type', 'is_available', 'created_at')
    list_filter = ('department', 'transaction_type', 'is_available', 'condition')
    search_fields = ('title', 'author', 'isbn', 'description')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Book Information', {
            'fields': ('title', 'author', 'isbn', 'description', 'condition')
        }),
        ('Transaction Details', {
            'fields': ('transaction_type', 'price', 'department', 'course_code')
        }),
        ('Contact Information', {
            'fields': ('posted_by', 'contact_email', 'contact_phone')
        }),
        ('Status', {
            'fields': ('is_available', 'created_at', 'updated_at')
        }),
    )

@admin.register(BookImage)
class BookImageAdmin(admin.ModelAdmin):
    list_display = ('book', 'is_primary', 'uploaded_at')
    list_filter = ('is_primary',)
    search_fields = ('book__title',)
    date_hierarchy = 'uploaded_at'

@admin.register(BookRequest)
class BookRequestAdmin(admin.ModelAdmin):
    list_display = ('book', 'requested_by', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('book__title', 'requested_by__email', 'message')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('status',)
