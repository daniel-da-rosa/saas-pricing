// Em frontend/src/components/DashboardLayout.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">

            {/* 1. MENU LATERAL (Sidebar) */}
            <div className="p-4 flex items-center border-b border-gray-700"> 
    {/* Usando o componente Image do Next.js */}
    <Image 
        src="/logo_valora.png" // Caminho relativo à pasta `public`
        alt="Logo Valora MenteMestra"
        width={120} // Largura desejada para o logo
        height={30} // Altura desejada para o logo (ajuste conforme necessário)
        className="h-auto" // Para manter a proporção da altura
    />
    {/* Se quiser um complemento de texto ao lado da imagem, pode adicionar aqui: */}
    {/* <span className="text-xl font-extrabold text-gray-300 ml-2">M.M.</span> */}
</div>
            <aside className="w-64 bg-gray-800 text-white flex-shrink-0 relative shadow-xl">
              
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.href} legacyBehavior>
                            <a className={`
                                flex items-center p-3 rounded-lg transition duration-150
                                ${router.pathname === item.href
                                    ? 'bg-blue-600 text-white font-semibold' // Cor de destaque para o item ativo
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Cores padrão e hover
                                }
                            `}>
                                {item.name}
                            </a>
                        </Link>
                    ))}
                </nav>

                {/* Botão de Logout Fixo no Rodapé do Menu */}
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-700"> {/* Adicionei borda superior */}
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