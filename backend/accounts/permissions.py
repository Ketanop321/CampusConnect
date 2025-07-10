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
        return obj == request.user or request.user.is_staff

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
