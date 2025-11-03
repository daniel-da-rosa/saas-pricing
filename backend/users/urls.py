from django.urls import path, include 
from .views import RegisterView, LoginView, UserProfileView
from allauth.socialaccount import providers
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),

    # Login social
    path('google/', include('allauth.urls')),
]
