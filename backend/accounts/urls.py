from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='update_profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete_account'),
    path('check-auth/', views.CheckAuthView.as_view(), name='check_auth'),
]
