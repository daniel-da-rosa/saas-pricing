"use client";
import React, { useState } from 'react';
import { Package, DollarSign, Users, LogOut, Menu, X, Search } from 'lucide-react';

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
  const [activeMenu, setActiveMenu] = useState('produtos');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Package },
    { id: 'produtos', label: 'Produtos/Insumos', icon: Package },
    { id: 'receitas', label: 'Receitas/Composições', icon: DollarSign },
    { id: 'orcamentos', label: 'Orçamentos', icon: DollarSign },
    { id: 'clientes', label: 'Clientes', icon: Users }
  ];

  return (
    // Fundo base sutilmente mais escuro para contraste
    <div className="flex h-screen bg-slate-100/50">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300 flex flex-col`}>

        {/* Logo e Botão de Alternância */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700">

          {/* LÓGICA DO LOGO E CLIQUE: Permite abrir clicando no logo quando fechado */}
          <div
            className={`flex items-center gap-3 ${!sidebarOpen ? 'cursor-pointer' : ''}`}
            onClick={() => !sidebarOpen && setSidebarOpen(true)} // Abre se estiver fechado
          >
            {sidebarOpen ? (
              // Logo COMPLETO (sidebar aberta)
              <img
                src="/valora_sf_m.png"
                alt="Logo Valora"
                className="h-10 w-auto"
              />
            ) : (
              // Ícone SLIM (sidebar fechada)
              <img
                src="/valora_sf_slim.png"
                alt="Ícone Valora"
                className="h-8 w-8"
              />
            )}
          </div>

          {/* BOTão DE FECHAR: SÓ MOSTRA QUANDO ABERTO */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)} // Função explícita para fechar
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
                onClick={() => setActiveMenu(item.id)}
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

        {/* Header - Fundo escuro igual à sidebar */}
        <header className="bg-slate-900 px-8 py-4"> {/* 1. Fundo slate-900 */}
          <div className="flex items-center justify-between">
            <div>
              {/* Título em Branco */}
              <h1 className="text-2xl font-bold text-white">{title}</h1> {/* 2. Título em Branco */}
              {/* Subtítulo em Cinza Quase Branco */}
              {subtitle && <p className="text-sm text-slate-300 mt-1">{subtitle}</p>} {/* 3. Subtítulo em slate-300 */}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - AQUI VÃO OS CHILDREN */}
        {/* O fundo do children (produtos.tsx) deve ser branco para se destacar do bg-slate-100 */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}