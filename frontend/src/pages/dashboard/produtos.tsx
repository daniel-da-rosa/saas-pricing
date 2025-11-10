"use client";
import React, { useState, useEffect } from 'react';
import { produtosAPI, Produto } from '../../lib/api';
import DashboardLayoutModerno from '../../components/DashboardLayoutModerno';
import { Search, Plus, Edit2, Trash2, X, Package } from 'lucide-react';

//importação do dialog 
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


const PaginaProdutos = () => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form state
    const [formData, setFormData] = useState({
        nome: '',
        codigo_sku: '',
        tipo: 'PA',
        preco_custo: '',
        unidade_medida: '',
    });

    const carregarProdutos = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await produtosAPI.list();
            setProdutos(response.data || []);
            setProdutosFiltrados(response.data || []);
        } catch (err) {
            console.error('Erro ao carregar:', err);
            setError('Falha ao carregar produtos.');
            setProdutos([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregarProdutos();
    }, []);

    // Filtro de busca
    useEffect(() => {
        const filtered = produtos.filter(produto =>
            produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            produto.codigo_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            produto.tipo.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setProdutosFiltrados(filtered);
        setCurrentPage(1);
    }, [searchTerm, produtos]);

    // Paginação
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = produtosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(produtosFiltrados.length / itemsPerPage);

    const handleNovo = () => {
        setFormData({ nome: '', codigo_sku: '', tipo: 'PA', preco_custo: '', unidade_medida: '' });
        setModalMode('create');
        setProdutoSelecionado(null);
        setShowModal(true);
    };

    const handleEditar = (produto: Produto) => {
        setFormData({
            nome: produto.nome,
            codigo_sku: produto.codigo_sku,
            tipo: produto.tipo,
            preco_custo: produto.preco_custo,
            unidade_medida: produto.unidade_medida
        });
        setModalMode('edit');
        setProdutoSelecionado(produto);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {

        try {
            await produtosAPI.delete(id);
            carregarProdutos();
        } catch (err) {
            setError('Falha ao deletar produto.');
        }

    };

    // No arquivo produtos.tsx
    // ...

    const handleSubmit = async () => {
        try {
            // 1. Clonar o formData e preparar para envio
            // Usamos Partial<NovoProduto> para flexibilidade, mas Omit<Produto, 'id' | 'is_active'> é o ideal para o create.
            // Para o update, data: Partial<NovoProduto> está correto na lib.
            let dataToSend: any = { ...formData };

            // 2. CORREÇÃO ESSENCIAL: Tratar o Preço de Custo
            // Garante que o valor é enviado com ponto decimal, se existir.
            if (dataToSend.preco_custo) {
                // Converte para string (se já não for) e substitui todas as vírgulas por pontos.
                let custoNormalizado = dataToSend.preco_custo.toString().replace(/,/g, '.');

                // Converte para número (float) para garantir o formato correto.
                // O DRF aceita floats, mas precisa do ponto.
                dataToSend.preco_custo = parseFloat(custoNormalizado);

                // Trata o caso de NaN (se o usuário digitou apenas lixo)
                if (isNaN(dataToSend.preco_custo)) {
                    // Você pode adicionar um tratamento visual de erro aqui se quiser
                    setError("Por favor, insira um preço de custo válido (apenas números).");
                    return; // Interrompe o envio
                }
            } else {
                // Se o campo for obrigatório no Django, é melhor enviar '0' ou lançar um erro.
                // Vou assumir que 0 é aceitável, ou que a validação de required já ocorreu na UI.
                dataToSend.preco_custo = 0;
            }

            // 3. Chamada da API
            if (modalMode === 'create') {
                await produtosAPI.create(dataToSend);
            } else if (produtoSelecionado) {
                // No PUT (edição), a API precisa do ID e dos dados corrigidos
                await produtosAPI.update(produtoSelecionado.id, dataToSend);
            }

            // 4. Sucesso
            setShowModal(false);
            carregarProdutos();
        } catch (err: any) {
            // Tratamento de Erro mais específico para o usuário
            let errorMessage = 'Falha ao salvar produto. Verifique se todos os campos estão preenchidos corretamente.';

            // Se o Axios retornou um erro 400 (Bad Request), o Django deve ter enviado detalhes
            if (err.response && err.response.data) {
                console.error("Erro detalhado do Django:", err.response.data);
                errorMessage = "Erro de validação do servidor. Verifique o console para detalhes.";

                // Exemplo: se houver um erro específico no campo 'codigo_sku'
                if (err.response.data.codigo_sku) {
                    errorMessage = `Erro no SKU: ${err.response.data.codigo_sku[0]}`;
                }
            }

            setError(errorMessage);
        }
    };



    return (
        <DashboardLayoutModerno
            title="Produtos e Insumos"
            subtitle="Gerencie o cadastro de matérias-primas, embalagens e insumos"
        >
            {/* Barra de ações */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 flex gap-4 items-center flex-wrap">
                {/* Busca */}
                <div className="flex-1 min-w-[300px] relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Buscar por nome, SKU ou tipo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                </div>

                {/* Botão Novo */}
                <button
                    onClick={handleNovo}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Novo Produto
                </button>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="py-16 text-center">
                        <div className="text-5xl mb-3">⏳</div>
                        <p className="text-gray-500">Carregando produtos...</p>
                    </div>
                ) : error ? (
                    <div className="py-10 px-6 text-center">
                        <p className="text-red-600">⚠️ {error}</p>
                    </div>
                ) : produtosFiltrados.length === 0 ? (
                    <div className="py-16 text-center">
                        <Package size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">
                            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                        </p>
                        <p className="text-sm text-gray-400">
                            {searchTerm ? 'Tente buscar com outros termos' : 'Clique em "Novo Produto" para começar'}
                        </p>
                    </div>
                ) : (
                    <>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-1.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        SKU
                                    </th>
                                    <th className="text-left py-1.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Nome do Produto
                                    </th>
                                    <th className="text-left py-1.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Tipo
                                    </th>
                                    <th className="text-right py-1.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Custo Unitário
                                    </th>
                                    <th className="text-center py-1.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide w-[10px]">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((produto) => (
                                    <tr
                                        key={produto.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-0.5 px-3">
                                            <code className="text-xs font-mono text-gray-700  px-2 py-1 rounded">
                                                {produto.codigo_sku}
                                            </code>
                                        </td>
                                        <td className="py-0.5 px-4 text-xs font-medium text-gray-900">
                                            {produto.nome}
                                        </td>
                                        <td className="py-0.5 px-4">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${produto.tipo === 'Matéria-Prima'
                                                ? 'bg-blue-100 text-blue-700'
                                                : produto.tipo === 'MP'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {produto.tipo}
                                            </span>
                                        </td>
                                        <td className="py-0.5 px-4 text-right text-sm font-semibold text-gray-900">
                                            R$ {parseFloat(produto.preco_custo).toFixed(2)}
                                        </td>
                                        <td className="py-0.5 px-4">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleEditar(produto)}
                                                    className="p-1.5 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 text-gray-600 transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                {/* ALERT DIALOG DE EXCLUSÃO */}
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
                                                                    Essa ação não pode ser desfeita. O produto será removido permanentemente do sistema.
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
                                                                    Produto a ser excluído:
                                                                </p>
                                                                <p style={{
                                                                    color: '#d1d5db',
                                                                    margin: '4px 0',
                                                                    fontSize: '14px'
                                                                }}>
                                                                    <strong style={{ color: '#9ca3af' }}>SKU:</strong> {produto.codigo_sku}
                                                                </p>
                                                                <p style={{
                                                                    color: '#d1d5db',
                                                                    margin: '4px 0',
                                                                    fontSize: '14px'
                                                                }}>
                                                                    <strong style={{ color: '#9ca3af' }}>Nome:</strong> {produto.nome}
                                                                </p>
                                                            </div>

                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(produto.id)}>
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

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="px-5 py-4 border-t border-gray-200 flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, produtosFiltrados.length)} de {produtosFiltrados.length}
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

            {/* Modal de Formulário */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                // onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
                    //onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-5 bg-slate-900 flex justify-start items-center rounded-t-2xl">
                            <h2 className="text-xl font-bold text-white">
                                {modalMode === 'create' ? 'Novo Produto' : 'Editar Produto'}
                            </h2>

                        </div>



                        {/* Formulário */}
                        <div className="px-6 py-6 bg-gray-100">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome do Produto *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        placeholder="Ex: Chapa de Aço Galvanizada"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código SKU *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.codigo_sku}
                                        onChange={(e) => setFormData({ ...formData, codigo_sku: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        placeholder="Ex: SKU001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo *
                                    </label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                                    >
                                        <option value="MP">Matéria-Prima</option>
                                        <option value="PA">Produto Acabado</option>
                                        <option value="">Outros</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preço de Custo (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.preco_custo}
                                        onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        placeholder="0,00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unidade de Medida *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.unidade_medida}
                                        onChange={(e) => setFormData({ ...formData, unidade_medida: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        placeholder="Ex: un, kg, m"
                                    />
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="mt-8 flex gap-3 justify-end">
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
                                    {modalMode === 'create' ? 'Criar Produto' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayoutModerno>
    );
};

export default PaginaProdutos;