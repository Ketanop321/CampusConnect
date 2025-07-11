from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.EventViewSet, basename='event')
router.register(r'comments', views.EventCommentViewSet, basename='event-comment')
router.register(r'registrations', views.EventRegistrationViewSet, basename='event-registration')

urlpatterns = [
    path('', include(router.urls)),
]
