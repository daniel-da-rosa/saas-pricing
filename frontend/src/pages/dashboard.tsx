// frontend/src/pages/dashboard.tsx
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'; // <-- IMPORTE O useState

export default function DashboardPage() {
    const { user, accessToken, logout } = useAuthStore(); // <-- Pegue o 'logout'
    const router = useRouter();

    // --- A CORREÇÃO (Hook de Hidratação) ---
    // 1. Criamos um estado para saber se o componente "montou"
    const [isHydrated, setIsHydrated] = useState(false);

    // 2. Quando o componente montar, mudamos o estado
    useEffect(() => {
        setIsHydrated(true);
    }, []);
    // --- FIM DA CORREÇÃO ---


    // Efeito de "Proteção de Rota" (Auth Guard)
    useEffect(() => {
        // 3. SÓ checamos o token DEPOIS que o componente montou
        //    (dando tempo para o Zustand ler o localStorage)
        if (isHydrated && !accessToken) {
            router.push('/login');
        }
    }, [isHydrated, accessToken, router]); // <-- Adicionamos 'isHydrated'


    // 4. Mostramos "Carregando..." até que
    //    o componente esteja montado E o token exista.
    if (!isHydrated || !accessToken) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                Carregando...
            </div>
        );
    }

    // Se estiver logado e hidratado, mostre o dashboard
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            <div className="bg-slate-800/70 backdrop-blur-md p-10 rounded-2xl shadow-lg max-w-lg text-center">
                <h1 className="text-3xl font-bold mb-4">
                    {/* O user?.email garante que só mostramos o email se ele existir */}
                    👋 Bem-vindo{user?.email ? `, ${user.email}` : ''}!
                </h1>
                <p className="text-gray-300 mb-6">
                    Você fez login com sucesso (de verdade agora!).
                </p>

                <div className="flex gap-4 justify-center">
                    {/* Botão de Logout */}
                    <button
                        onClick={logout} // <-- Chame a função 'logout' do store
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
                    >
                        Sair (Logout)
                    </button>

                    <button
                        onClick={() => router.push('/dashboard/produtos')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition"
                    >
                        Página Inicial
                    </button>
                </div>
            </div>
        </main>
    );
}