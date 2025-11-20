"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Package, DollarSign, Users, LogOut, X, Ruler, Tag } from 'lucide-react';
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
        // If error, redirect to login
        router.push('/login');
      } finally {
        setIsCheckingCompany(false);
      }
    };

    checkCompany();
  }, [router]);

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
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100/50">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300 flex flex-col`}>

        {/* Logo e Botão de Alternância */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700">

          <div
            className={`flex items-center gap-3 ${!sidebarOpen ? 'cursor-pointer' : ''}`}
            onClick={() => !sidebarOpen && setSidebarOpen(true)}
          >
            {sidebarOpen ? (
              <img
                src="/valora_sf_m.png"
                alt="Logo Valora"
                className="h-10 w-auto"
              />
            ) : (
              <img
                src="/valora_sf_slim.png"
                alt="Ícone Valora"
                className="h-8 w-8"
              />
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  if (item.path) {
                    router.push(item.path);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeMenu === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-slate-700">
          <div className={`${sidebarOpen ? 'flex items-center gap-3 mb-3' : 'justify-center flex'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-gray-400">admin@saas.local</p>
              </div>
            )}
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">

        {/* Header */}
        <header className="bg-slate-900 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {subtitle && <p className="text-sm text-slate-300 mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}