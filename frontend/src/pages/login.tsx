// pages/login.tsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { authAPI } from '@/lib/api';
import '/styles/globals.css';

const GOOGLE_LOGIN_URL = 'http://localhost:8000/api/auth/google/login/';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, accessToken } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    try {
      await login(email, password);

      // Check if user has company
      const profileResponse = await authAPI.getProfile();
      if (!profileResponse.data.has_company) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard/produtos');
      }
    } catch (error) {
      console.error('Falha no login:', error);
      alert('Login ou senha inválidos.');
    }
  };

  useEffect(() => {
    if (accessToken) {
      // Check company on mount if already logged in
      authAPI.getProfile().then(response => {
        if (!response.data.has_company) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard/produtos');
        }
      }).catch(() => {
        // Ignore errors, user will login normally
      });
    }
  }, [accessToken, router]);

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <>
      <Head>
        <title>Login | SaaS Pricing</title>
      </Head>
      <main className="flex items-center justify-center min-h-screen w-full bg-[url('/login-bg-1.png')] bg-cover bg-center relative">
        {/* Overlay escuro para melhorar contraste */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

        <div className="relative z-10 w-full max-w-md p-8 mx-4">
          {/* Card Glassmorphism */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
              <p className="text-gray-200 text-sm">Acesse sua conta para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink mx-4 text-gray-300 text-sm">ou continue com</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white text-gray-900 font-medium rounded-lg shadow hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Google
            </button>

            <div className="mt-8 text-center">
              <p className="text-gray-300 text-sm">
                Não tem uma conta?{' '}
                <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}