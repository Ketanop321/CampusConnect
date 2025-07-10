from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'books', views.BookPostViewSet, basename='book')
router.register(r'book-requests', views.BookRequestViewSet, basename='book-request')

urlpatterns = [
    path('', include(router.urls)),
]
