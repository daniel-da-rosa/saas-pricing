import React, { useState } from 'react';
import { Package, DollarSign, Users, LogOut, Menu, X, Plus, Search } from 'lucide-react';

export default function ValoraDashboard() {
  const [activeMenu, setActiveMenu] = useState('produtos');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    tipo: 'Matéria-Prima',
    unidade: '',
    preco: ''
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Package },
    { id: 'produtos', label: 'Produtos/Insumos', icon: Package },
    { id: 'receitas', label: 'Receitas/Composições', icon: DollarSign },
    { id: 'orcamentos', label: 'Orçamentos', icon: DollarSign },
    { id: 'clientes', label: 'Clientes', icon: Users }
  ];

  const handleSubmit = () => {
    console.log('Salvar produto:', formData);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          {sidebarOpen && (
            <div className="flex items-center gap-3">

              <div className="flex items-center gap-x-2">
                {/* ... outros elementos, se houver, como um ícone */}
                <img
                  src="/valora_sf_m.png" // Caminho relativo à pasta 'public'
                  alt="Logo Valora"
                  className="h-10 w-auto" // Ajuste as classes de estilo Tailwind CSS conforme necessário
                />
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
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
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Produtos</h1>
              <p className="text-sm text-gray-500 mt-1">Cadastre e gerencie seus produtos e insumos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Form Section */}
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 border-b border-blue-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="text-blue-600" size={24} />
                Cadastrar Novo Produto
              </h2>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Nome do Item */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Item
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ex: Farinha de Trigo"
                  />
                </div>

                {/* Código SKU */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código (SKU)
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ex: FT-001"
                  />
                </div>

                {/* Tipo */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="Matéria-Prima">Matéria-Prima</option>
                    <option value="Produto Acabado">Produto Acabado</option>
                    <option value="Embalagem">Embalagem</option>
                    <option value="Insumo">Insumo</option>
                  </select>
                </div>

                {/* Unidade */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidade (ex: kg, un, m)
                  </label>
                  <input
                    type="text"
                    value={formData.unidade}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ex: kg"
                  />
                </div>

                {/* Preço de Custo */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço de Custo (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-600/30"
                >
                  Salvar Produto
                </button>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Produtos Cadastrados</h2>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 mb-2">Nenhum produto cadastrado ainda</p>
                  <p className="text-sm text-gray-400">Comece cadastrando seu primeiro produto acima</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
