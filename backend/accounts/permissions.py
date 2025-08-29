from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        # Check for different ownership attributes based on the model
        # or if the user is staff/admin
        if request.user.is_staff:
            return True
            
        # Check for 'reporter' attribute (for lost and found items)
        if hasattr(obj, 'reporter') and obj.reporter == request.user:
            return True
            
        # Check for 'posted_by' attribute (for book posts)
        if hasattr(obj, 'posted_by') and obj.posted_by == request.user:
            return True
            
        # Check for 'user' attribute (for user profiles)
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
            
        # Check for 'organizer' attribute (for events)
        if hasattr(obj, 'organizer') and obj.organizer == request.user:
            return True
            
        # If the object is the user themselves
        if obj == request.user:
            return True
            
        return False

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to edit it.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to admin users.
        return request.user and request.user.is_staff

class IsSelfOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow users to edit their own profile.
    Admins can edit any profile.
    """
    def has_object_permission(self, request, view, obj):
        # Allow read permissions to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Allow write permissions if the user is the owner or an admin
        return obj == request.user or request.user.is_staff
