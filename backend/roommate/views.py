from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .models import RoommatePost
from .serializers import RoommatePostSerializer
from accounts.permissions import IsOwnerOrReadOnly

class RoommatePostViewSet(viewsets.ModelViewSet):
    queryset = RoommatePost.objects.all()
    serializer_class = RoommatePostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
