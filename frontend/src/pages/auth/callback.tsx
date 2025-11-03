import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallback() {
  const router = useRouter();
  const { access, refresh } = router.query;

  useEffect(() => {
    const processCallback = async () => {
      if (!access || !refresh) {
        console.log('Tokens não encontrados na URL');
        return;
      }

      console.log('Tokens recebidos:', { access, refresh });

      try {
        // Buscar dados do usuário usando o token
        const response = await fetch('http://localhost:8000/api/auth/profile/', {
          headers: {
            'Authorization': `Bearer ${access}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar dados do usuário');
        }

        const userData = await response.json();
        console.log('Dados do usuário:', userData);

        // Atualizar o Zustand store manualmente
        useAuthStore.setState({
          accessToken: access as string,
          user: userData,
          isLoading: false,
        });

        console.log('Store atualizado, redirecionando para dashboard...');
        
        // Redirecionar para o dashboard
        router.push('/dashboard');
        
      } catch (error) {
        console.error('Erro ao processar callback:', error);
        router.push('/login?error=callback_failed');
      }
    };

    processCallback();
  }, [access, refresh, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-xl">Processando login com Google...</p>
      </div>
    </div>
  );
}