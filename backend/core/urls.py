# core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from subscriptions.views import PlanViewSet, SubscriptionViewSet
from payments.views import PaymentViewSet
from users.views import SocialLoginRedirectView 
#from quotes.views import OrcamentoViewSet
from pricing.views import ProdutoViewSet, ComposicaoViewSet

# Router para ViewSets
router = DefaultRouter()
router.register(r'plans', PlanViewSet, basename='plan')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'produtos', ProdutoViewSet, basename='produto')
router.register(r'composicoes', ComposicaoViewSet, basename='composicao')

urlpatterns = [
    path('', lambda r: redirect('api/', permanent=False)),
    path('admin/', admin.site.urls),
    
    # API
    path('api/', include(router.urls)),
    path('api/auth/', include('users.urls')),
    
    # Documentação
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # ADICIONE ESTA LINHA - Intercepta o redirect do allauth
    path('accounts/profile/', SocialLoginRedirectView.as_view(), name='account_profile'),
]