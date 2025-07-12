from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import LostFoundItem
from .serializers import LostFoundItemSerializer, LostFoundItemUpdateSerializer
from accounts.permissions import IsOwnerOrReadOnly

class LostFoundItemViewSet(viewsets.ModelViewSet):
    queryset = LostFoundItem.objects.all().order_by('-date_reported')
    serializer_class = LostFoundItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'is_resolved', 'category']
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return LostFoundItemUpdateSerializer
        return LostFoundItemSerializer

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_found(self, request, pk=None):
        item = self.get_object()
        if item.status == 'found':
            return Response(
                {'detail': 'Item is already marked as found.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        item.status = 'found'
        item.is_resolved = True
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        item = self.get_object()
        if item.claimed_by:
            return Response(
                {'detail': 'This item has already been claimed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        item.claimed_by = request.user
        item.is_resolved = True
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def unclaim(self, request, pk=None):
        item = self.get_object()
        if not item.claimed_by:
            return Response(
                {'detail': 'This item is not claimed by anyone.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if item.claimed_by != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to unclaim this item.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        item.claimed_by = None
        item.is_resolved = False
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)
