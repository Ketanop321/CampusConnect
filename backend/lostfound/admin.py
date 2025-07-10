from django.contrib import admin
from .models import LostFoundItem

@admin.register(LostFoundItem)
class LostFoundItemAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'status', 'location', 'reporter', 'date_reported', 'is_resolved')
    list_filter = ('status', 'is_resolved', 'category', 'date_reported')
    search_fields = ('item_name', 'description', 'reporter__email', 'reporter__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'date_reported'
    fieldsets = (
        ('Item Information', {
            'fields': ('item_name', 'description', 'status', 'is_resolved')
        }),
        ('Location & Dates', {
            'fields': ('location', 'date_reported', 'date_occurred')
        }),
        ('Contact & Details', {
            'fields': ('reporter', 'claimed_by', 'contact_info', 'image')
        }),
        ('Additional Information', {
            'fields': ('category', 'color', 'brand'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(reporter=request.user)
