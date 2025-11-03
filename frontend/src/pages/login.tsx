// pages/LoginPage.tsx

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/router';
import '/styles/globals.css';

// URL para o endpoint do Django que inicia o login com Google

const GOOGLE_LOGIN_URL = 'http://localhost:8000/api/auth/google/login/';

export default function LoginPage() {
  // --- Estados e Store ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, accessToken, user } = useAuthStore();
  const router = useRouter();

  // --- Função handleSubmit: CORRIGIDA/ADICIONADA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      // Chama a ação de login da sua ZUSTAND store
      await login(email, password);
      // O useEffect abaixo cuidará do redirecionamento
    } catch (error) {
      console.error('Falha no login:', error);
      // Aqui você pode adicionar lógica para mostrar uma mensagem de erro ao usuário
      alert('Login ou senha inválidos.');
    }
  };

  // --- useEffect para Redirecionamento ---
  useEffect(() => {
    if (accessToken) {
      // Redireciona para a página principal ou dashboard após o login
      router.push('/dashboard'); 
    }
  }, [accessToken, router]);


  // --- Função para iniciar o Login com Google ---
  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <main className="flex items-center justify-center min-h-screen w-full bg-login-background bg-cover bg-center">
      <div className="max-w-md w-full p-6 rounded-lg shadow-xl bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Login</h1>
        
        {/* Formulário com a função handleSubmit */}
        <form onSubmit={handleSubmit}>
          {/* ... Seus campos de Email e Senha (omiti para brevidade) ... */}
          <div className="mb-4">
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <input 
              type="password" 
              placeholder="Senha" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 rounded text-white cursor-pointer hover:bg-blue-700 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>

        {/* --- Divisor e Botão do Google --- */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-gray-700 rounded text-white cursor-pointer hover:bg-gray-600 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
          >
          <img src="google-icon.svg" alt="Google" className="w-5 h-5 mr-2" /> 
          Entrar com Google
        </button>
      </div>
    </main>
  );
}