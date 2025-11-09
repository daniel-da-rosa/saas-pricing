// Em frontend/src/components/DashboardLayout.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Produtos/Insumos', href: '/dashboard/produtos' },
    { name: 'Receitas/Composições', href: '/dashboard/composicoes' },
    { name: 'Orçamentos', href: '/dashboard/orcamentos' },
    { name: 'Clientes', href: '/dashboard/clientes' },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const router = useRouter();

    const handleLogout = () => {
        // Limpa os tokens e o estado persistido do Zustand
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">

            {/* 1. MENU LATERAL (Sidebar) */}
            <aside className="w-64 bg-gray-800 text-white flex-shrink-0 relative shadow-xl">
                <div className="p-4 text-2xl font-extrabold text-blue-400 border-b border-gray-700">
                    Precificação
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.href} legacyBehavior>
                            <a className={`
                flex items-center p-3 rounded-lg transition duration-150
                ${router.pathname === item.href
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }
              `}>
                                {item.name}
                            </a>
                        </Link>
                    ))}
                </nav>

                {/* Botão de Logout Fixo no Rodapé do Menu */}
                <div className="absolute bottom-0 w-full p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition duration-150"
                    >
                        Sair (Logout)
                    </button>
                </div>
            </aside>

            {/* 2. CONTEÚDO PRINCIPAL E CABEÇALHO */}
            <div className="flex flex-col flex-1 overflow-auto">

                {/* Cabeçalho (Header) */}
                <header className="sticky top-0 z-10 flex items-center justify-end p-4 bg-white shadow-md">
                    <div>
                        <span className="text-gray-600 font-medium">admin@saas.local</span>
                    </div>
                </header>

                {/* Área de Conteúdo */}
                <main className="flex-1 bg-gray-100">
                    <div className="p-6">
                        {children} {/* Conteúdo da página */}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;