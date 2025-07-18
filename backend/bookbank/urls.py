from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'books', views.BookPostViewSet, basename='book')
router.register(r'book-requests', views.BookRequestViewSet, basename='book-request')
router.register(r'book-images', views.BookImageViewSet, basename='book-image')

# Additional URL patterns for book images
book_image_urls = [
    path('<int:book_id>/images/', views.BookImageViewSet.as_view({'get': 'list', 'post': 'create'}), name='book-image-list'),
    path('images/<int:pk>/', views.BookImageViewSet.as_view({'delete': 'destroy'}), name='book-image-detail'),
    path('images/<int:pk>/set-primary/', views.BookImageViewSet.as_view({'post': 'set_primary'}), name='book-image-set-primary'),
]

urlpatterns = [
    path('', include(router.urls)),
    path('books/', include(book_image_urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)