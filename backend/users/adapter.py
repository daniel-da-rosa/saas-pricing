from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.shortcuts import redirect
from urllib.parse import urlencode
from rest_framework_simplejwt.tokens import RefreshToken


class AccountAdapter(DefaultAccountAdapter):
    """
    Adapter customizado para conta local (email/senha).
    """
    pass


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Adapter customizado para contas sociais (Google, etc.).
    Redireciona para o frontend com tokens JWT após login social.
    """
    
    def get_login_redirect_url(self, request):
        """
        Sobrescreve o método para redirecionar para o frontend com tokens JWT
        """
        user = request.user
        
        print(f"[ADAPTER] get_login_redirect_url chamado!")
        print(f"[ADAPTER] Usuário autenticado: {user.is_authenticated if user else False}")
        
        if user and user.is_authenticated:
            refresh = RefreshToken.for_user(user)
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            params = urlencode({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
            
            redirect_url = f"{frontend_url}/auth/callback?{params}"
            print(f"[ADAPTER] Redirecionando para: {redirect_url}")
            return redirect_url
        
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        error_url = f"{frontend_url}/login?error=authentication_failed"
        print(f"[ADAPTER] Usuário não autenticado, redirecionando para: {error_url}")
        return error_url
    
    def complete_login(self, request, sociallogin):
        """
        Método chamado quando o login social é completado
        """
        print(f"[ADAPTER] complete_login chamado!")
        return super().complete_login(request, sociallogin)