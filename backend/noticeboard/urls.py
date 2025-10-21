from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import admin_views

router = DefaultRouter()
router.register(r'events', views.EventViewSet, basename='event')
router.register(r'comments', views.EventCommentViewSet, basename='event-comment')
router.register(r'registrations', views.EventRegistrationViewSet, basename='event-registration')

admin_router = DefaultRouter()
admin_router.register(r'admin/events', admin_views.AdminEventViewSet, basename='admin-event')
admin_router.register(r'admin/comments', admin_views.AdminEventCommentViewSet, basename='admin-event-comment')
admin_router.register(r'admin/registrations', admin_views.AdminEventRegistrationViewSet, basename='admin-event-registration')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(admin_router.urls)),
]
