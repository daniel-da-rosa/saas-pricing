"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Package, DollarSign, Users, LogOut, X, Ruler, Tag, Menu, ChevronRight, Bell, Search, Settings } from 'lucide-react';
import { authAPI } from '@/lib/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayoutModerno({
  children,
  title = "Dashboard",
  subtitle = ""
}: DashboardLayoutProps) {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('produtos');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCheckingCompany, setIsCheckingCompany] = useState(true);

  // Check if user has company on mount
  useEffect(() => {
    const checkCompany = async () => {
      try {
        const response = await authAPI.getProfile();
        if (!response.data.has_company) {
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Erro ao verificar empresa:', error);
        router.push('/login');
      } finally {
        setIsCheckingCompany(false);
      }
    };

    checkCompany();
  }, [router]);

  // Update active menu based on current path
  useEffect(() => {
    const path = router.pathname;
    const found = menuItems.find(item => item.path === path);
    if (found) {
      setActiveMenu(found.id);
    }
  }, [router.pathname]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Package, path: '/dashboard' },
    { id: 'produtos', label: 'Produtos/Insumos', icon: Package, path: '/dashboard/produtos' },
    { id: 'unidades', label: 'Unidades de Medida', icon: Ruler, path: '/dashboard/unidades' },
    { id: 'tipos', label: 'Tipos de Produto', icon: Tag, path: '/dashboard/tipos-produto' },
    { id: 'receitas', label: 'Receitas/Composições', icon: DollarSign, path: '/dashboard/receitas' },
    { id: 'orcamentos', label: 'Orçamentos', icon: DollarSign, path: '/dashboard/orcamentos' },
    { id: 'clientes', label: 'Clientes', icon: Users, path: '/dashboard/clientes' }
  ];

  if (isCheckingCompany) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-20'} 
        bg-[#0f172a] text-white transition-all duration-300 ease-in-out 
        flex flex-col shadow-2xl z-20 relative`}
      >
        {/* Background Pattern (Optional) */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50 backdrop-blur-sm">
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${!sidebarOpen && 'justify-center w-full'}`}
            onClick={() => !sidebarOpen && setSidebarOpen(true)}
          >
            {sidebarOpen ? (
              <img src="/valora_sf_m.png" alt="Logo Valora" className="h-8 w-auto object-contain" />
            ) : (
              <img src="/valora_sf_slim.png" alt="Ícone Valora" className="h-8 w-8 object-contain" />
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  if (item.path) router.push(item.path);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                  ${!sidebarOpen && 'justify-center'}
                `}
              >
                <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`} />

                {sidebarOpen && (
                  <span className="font-medium text-sm tracking-wide">{item.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-slate-800">
              A
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Admin User</p>
                <p className="text-xs text-slate-400 truncate">admin@saas.local</p>
              </div>
            )}
            {sidebarOpen && (
              <button className="text-slate-400 hover:text-white transition-colors">
                <Settings size={18} />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('auth-storage');
              router.push('/login');
            }}
            className={`
              mt-4 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg 
              text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200
              ${!sidebarOpen && 'justify-center'}
            `}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm font-medium">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all w-64 outline-none text-slate-600 placeholder:text-slate-400"
              />
            </div>
            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 scroll-smooth relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.4] pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="max-w-7xl mx-auto animate-fade-in-up relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}