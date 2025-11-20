from django.urls import path, include 
from .views import RegisterView, LoginView, UserProfileView, MyEmpresaView
from allauth.socialaccount import providers
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('empresas/me/', MyEmpresaView.as_view(), name='my-empresa'),

    # Login social
    path('google/', include('allauth.urls')),
]
