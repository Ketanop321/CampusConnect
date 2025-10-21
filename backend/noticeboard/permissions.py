from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to admin users.
        return request.user and request.user.is_staff


class IsAdminOrganizerOrReadOnly(permissions.BasePermission):
    """
    Allow SAFE_METHODS to everyone.
    Allow write actions only if user is staff AND is the organizer of the object
    (or superuser). Intended for Event objects with an 'organizer' FK.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user and request.user.is_superuser:
            return True
        # Only the staff organizer of the object can modify
        organizer = getattr(obj, 'organizer', None)
        return bool(request.user and request.user.is_staff and organizer and organizer == request.user)
