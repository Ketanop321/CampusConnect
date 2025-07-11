from rest_framework import viewsets, permissions
from .models import RoommatePost
from .serializers import RoommatePostSerializer
from accounts.permissions import IsOwnerOrReadOnly

class RoommatePostViewSet(viewsets.ModelViewSet):
    queryset = RoommatePost.objects.all()
    serializer_class = RoommatePostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
