from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from .models import UserProfile

User = get_user_model()

class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'mobile', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('name', 'mobile', 'address')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'mobile', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'name', 'mobile')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'student_id', 'created_at')
    list_filter = ('department', 'created_at')
    search_fields = ('user__name', 'user__email', 'student_id')
    raw_id_fields = ('user',)
    date_hierarchy = 'created_at'
    fieldsets = (
        (None, {
            'fields': ('user', 'profile_picture', 'bio')
        }),
        ('Academic Information', {
            'fields': ('department', 'student_id')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

# Register the User model with our custom admin if not already registered
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass
admin.site.register(User, UserAdmin)
