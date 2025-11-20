"use client";
import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import DashboardLayoutModerno from '../../components/DashboardLayoutModerno';
import { Search, Plus, Edit2, Trash2, Package } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"

interface TipoProduto {
    id: number;
    nome: string;
    tipo: string;
}

const PaginaTiposProduto = () => {
    const [tipos, setTipos] = useState<TipoProduto[]>([]);
    const [tiposFiltrados, setTiposFiltrados] = useState<TipoProduto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [tipoSelecionado, setTipoSelecionado] = useState<TipoProduto | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [formData, setFormData] = useState({
        nome: '',
        tipo: ''
    });

    const carregarTipos = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get<TipoProduto[]>('/tipos-produto/');
            setTipos(response.data || []);
            setTiposFiltrados(response.data || []);
        } catch (err) {
            console.error('Erro ao carregar:', err);
            setError('Falha ao carregar tipos de produto.');
            setTipos([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregarTipos();
    }, []);

    useEffect(() => {
        const filtered = tipos.filter(tipo =>
            tipo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tipo.tipo.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setTiposFiltrados(filtered);
        setCurrentPage(1);
    }, [searchTerm, tipos]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = tiposFiltrados.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(tiposFiltrados.length / itemsPerPage);

    const handleNovo = () => {
        setFormData({ nome: '', tipo: '' });
        setModalMode('create');
        setTipoSelecionado(null);
        setShowModal(true);
    };

    const handleEditar = (tipo: TipoProduto) => {
        setFormData({
            nome: tipo.nome,
            tipo: tipo.tipo
        });
        setModalMode('edit');
        setTipoSelecionado(tipo);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/tipos-produto/${id}/`);
            carregarTipos();
        } catch (err) {
            setError('Falha ao deletar tipo de produto.');
        }
    };

    const handleSubmit = async () => {
        try {
            if (modalMode === 'create') {
                await api.post('/tipos-produto/', formData);
            } else if (tipoSelecionado) {
                await api.put(`/tipos-produto/${tipoSelecionado.id}/`, formData);
            }

            setShowModal(false);
            carregarTipos();
        } catch (err: any) {
            let errorMessage = 'Falha ao salvar tipo de produto.';
            if (err.response && err.response.data) {
                console.error("Erro detalhado:", err.response.data);
                errorMessage = "Erro de validação do servidor.";
            }
            setError(errorMessage);
        }
    };

    return (
        <DashboardLayoutModerno
            title="Tipos de Produto"
            subtitle="Gerencie os tipos de produto utilizados no sistema"
        >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 flex gap-4 items-center flex-wrap">
                <div className="flex-1 min-w-[300px] relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                </div>

                <button
                    onClick={handleNovo}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Novo Tipo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="py-16 text-center">
                        <div className="text-5xl mb-3">⏳</div>
                        <p className="text-gray-500">Carregando tipos...</p>
                    </div>
                ) : error ? (
                    <div className="py-10 px-6 text-center">
                        <p className="text-red-600">⚠️ {error}</p>
                    </div>
                ) : tiposFiltrados.length === 0 ? (
                    <div className="py-16 text-center">
                        <Package size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">
                            {searchTerm ? 'Nenhum tipo encontrado' : 'Nenhum tipo cadastrado'}
                        </p>
                        <p className="text-sm text-gray-400">
                            {searchTerm ? 'Tente buscar com outros termos' : 'Clique em "Novo Tipo" para começar'}
                        </p>
                    </div>
                ) : (
                    <>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Nome
                                    </th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Código
                                    </th>
                                    <th className="text-center py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide w-[150px]">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((tipo) => (
                                    <tr
                                        key={tipo.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-6 text-sm font-medium text-gray-900">
                                            {tipo.nome}
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-md">
                                                {tipo.tipo}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleEditar(tipo)}
                                                    className="p-1.5 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 text-gray-600 transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            className="p-1.5 border border-gray-300 rounded-md hover:bg-red-50 hover:border-red-500 hover:text-red-600 text-gray-600 transition-all"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <div>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Essa ação não pode ser desfeita. O tipo será removido permanentemente.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>

                                                            <div style={{
                                                                padding: '12px',
                                                                background: 'rgba(239, 68, 68, 0.15)',
                                                                borderRadius: '8px',
                                                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                                                marginTop: '16px'
                                                            }}>
                                                                <p style={{
                                                                    color: '#ef4444',
                                                                    fontWeight: '600',
                                                                    marginBottom: '8px',
                                                                    fontSize: '14px'
                                                                }}>
                                                                    Tipo a ser excluído:
                                                                </p>
                                                                <p style={{
                                                                    color: '#d1d5db',
                                                                    margin: '4px 0',
                                                                    fontSize: '14px'
                                                                }}>
                                                                    <strong style={{ color: '#9ca3af' }}>Nome:</strong> {tipo.nome}
                                                                </p>
                                                                <p style={{
                                                                    color: '#d1d5db',
                                                                    margin: '4px 0',
                                                                    fontSize: '14px'
                                                                }}>
                                                                    <strong style={{ color: '#9ca3af' }}>Código:</strong> {tipo.tipo}
                                                                </p>
                                                            </div>

                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(tipo.id)}>
                                                                    Excluir
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </div>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="px-5 py-4 border-t border-gray-200 flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, tiposFiltrados.length)} de {tiposFiltrados.length}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="px-6 py-5 bg-slate-900 flex justify-start items-center rounded-t-2xl">
                            <h2 className="text-xl font-bold text-white">
                                {modalMode === 'create' ? 'Novo Tipo de Produto' : 'Editar Tipo de Produto'}
                            </h2>
                        </div>

                        <div className="px-6 py-6 bg-gray-100">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        placeholder="Ex: Matéria-Prima"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        placeholder="Ex: MP"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    {modalMode === 'create' ? 'Criar Tipo' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayoutModerno>
    );
};

export default PaginaTiposProduto;
