from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import redirect
from django.conf import settings
from urllib.parse import urlencode
from .serializers import UserSerializer, UserRegistrationSerializer
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import redirect
from django.views import View  # ADICIONE ESTA LINHA
from django.conf import settings
from urllib.parse import urlencode
from .serializers import UserSerializer, UserRegistrationSerializer

# ... resto do código ...

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Gerar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Email e senha são obrigatórios'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar usuário por email
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                raise User.DoesNotExist
        except User.DoesNotExist:
            return Response({
                'error': 'Credenciais inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Gerar tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class SocialLoginRedirectView(View):
    """
    View que intercepta o redirect do allauth e gera os tokens JWT
    """
    def get(self, request):
        user = request.user
        
        print(f"[REDIRECT VIEW] Usuário: {user}")
        print(f"[REDIRECT VIEW] Autenticado: {user.is_authenticated if user else False}")
        
        if user and user.is_authenticated:
            # Gera tokens JWT
            refresh = RefreshToken.for_user(user)
            
            # Monta URL com tokens
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            params = urlencode({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
            
            redirect_url = f"{frontend_url}/auth/callback?{params}"
            print(f"[REDIRECT VIEW] Redirecionando para: {redirect_url}")
            return redirect(redirect_url)
        
        # Se não autenticado, volta pro login
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}/login?error=authentication_failed")
# NOVA VIEW PARA CALLBACK DO GOOGLE
class GoogleLoginCallbackView(APIView):
    """
    View customizada para processar o callback do Google e gerar JWT
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        # Pega o usuário autenticado pela sessão do allauth
        user = request.user
        
        if not user.is_authenticated:
            # Se não está autenticado, redireciona para login
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            return redirect(f'{frontend_url}/login?error=authentication_failed')
        
        # Gera os tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Constrói a URL de redirect com os tokens
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        params = urlencode({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
        
        redirect_url = f"{frontend_url}/auth/callback?{params}"
        
        return redirect(redirect_url)