from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import BookPost, BookImage, BookRequest
from .serializers import BookPostSerializer, BookImageSerializer, BookRequestSerializer
from accounts.permissions import IsOwnerOrReadOnly

class BookImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing book images.
    Allows adding and removing images from books.
    """
    serializer_class = BookImageSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        # Only return images for books owned by the current user
        return BookImage.objects.filter(book__posted_by=self.request.user)
    
    def perform_create(self, serializer):
        book = get_object_or_404(BookPost, id=self.request.data.get('book'))
        if book.posted_by != self.request.user:
            raise permissions.PermissionDenied("You don't have permission to add images to this book.")
        serializer.save()

    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """Set an image as the primary image for the book."""
        image = self.get_object()
        if image.book.posted_by != request.user:
            return Response(
                {"detail": "You don't have permission to modify this book's images."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Set all images for this book as not primary
        BookImage.objects.filter(book=image.book).update(is_primary=False)
        # Set this image as primary
        image.is_primary = True
        image.save()
        
        return Response({'status': 'primary image set'})


class BookPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing book posts.
    Handles CRUD operations for books, including image uploads.
    """
    queryset = BookPost.objects.all()
    serializer_class = BookPostSerializer
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
        serializer.save(posted_by=self.request.user)

    @action(detail=True, methods=['post'])
    def request_book(self, request, pk=None):
        book = self.get_object()
        if book.posted_by == request.user:
            return Response(
                {"detail": "You cannot request your own book."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        existing_request = BookRequest.objects.filter(
            book=book, 
            requested_by=request.user
        ).exists()
        
        if existing_request:
            return Response(
                {"detail": "You have already requested this book."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = BookRequestSerializer(data={
            'book': book.id,
            'requested_by': request.user.id,
            'message': request.data.get('message', '')
        })
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookRequestViewSet(viewsets.ModelViewSet):
    serializer_class = BookRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        # Users can see requests they made or received
        return BookRequest.objects.filter(
            requested_by=self.request.user
        ) | BookRequest.objects.filter(
            book__posted_by=self.request.user
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        book_request = self.get_object()
        if book_request.book.posted_by != request.user:
            return Response(
                {"detail": "You don't have permission to approve this request."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        book_request.status = 'accepted'
        book_request.save()
        return Response({'status': 'request approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        book_request = self.get_object()
        if book_request.book.posted_by != request.user:
            return Response(
                {"detail": "You don't have permission to reject this request."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        book_request.status = 'rejected'
        book_request.save()
        return Response({'status': 'request rejected'})
