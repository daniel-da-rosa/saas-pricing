// frontend/src/pages/dashboard/produtos.tsx
import React, { useState, useEffect } from 'react';
import { produtosAPI, Produto } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayoutModerno';
import { Package, Plus, Trash2, Edit, Search, AlertCircle } from 'lucide-react';

// Tipo base para o formulário (sem o ID, pois ele é adicionado/usado apenas na edição/deleção)
interface ProdutoFormData {
    nome: string;
    codigo_sku: string;
    tipo: 'MP' | 'PA' | 'SV' | 'SB' | string; // Permitindo string para flexibilidade
    unidade_medida: string;
    preco_custo: string; // Mantido como string para entrada de input
}

const initialFormData: ProdutoFormData = {
    nome: '',
    codigo_sku: '',
    tipo: 'MP',
    unidade_medida: '',
    preco_custo: '0.00'
};

const PaginaProdutos = () => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<ProdutoFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // NOVO: Estado para rastrear o produto em edição
    const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

    // Função para buscar os produtos na API
    const carregarProdutos = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await produtosAPI.list();
            setProdutos(response.data);
        } catch (err) {
            setError('Falha ao carregar produtos.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregarProdutos();
    }, []);

    // Função para resetar o formulário
    const resetForm = () => {
        setFormData(initialFormData);
        setEditingProduto(null);
        setFormError(null);
    };

    // Função combinada para Criar ou Atualizar
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            if (editingProduto) {
                // Modo EDIÇÃO
                await produtosAPI.update(editingProduto.id, formData as any);
            } else {
                // Modo CRIAÇÃO
                await produtosAPI.create(formData as any);
            }

            // Sucesso: reseta o formulário e recarrega a lista
            resetForm();
            carregarProdutos();

        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.data) {
                const apiError = err.response.data;
                const firstErrorKey = Object.keys(apiError)[0];
                setFormError(`${firstErrorKey}: ${apiError[firstErrorKey]}`);
            } else {
                setFormError(`Falha ao ${editingProduto ? 'atualizar' : 'criar'} o produto. Tente novamente.`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Função para carregar dados no formulário para edição
    const handleEdit = (produto: Produto) => {
        setEditingProduto(produto);
        setFormData({
            nome: produto.nome,
            codigo_sku: produto.codigo_sku,
            tipo: produto.tipo,
            unidade_medida: produto.unidade_medida,
            preco_custo: String(produto.preco_custo || '0.00') // Garante que seja string
        });
        window.scrollTo(0, 0); // Rola para o topo para mostrar o formulário
    };

    // Função de deleção
    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja deletar este produto?')) {
            try {
                await produtosAPI.delete(id);
                carregarProdutos();
            } catch (err) {
                setError('Falha ao deletar produto. Verifique se ele não está em uso.');
                console.error(err);
            }
        }
    };

    // LÓGICA CORRIGIDA para garantir que a lista completa seja exibida se o campo de busca estiver vazio.
    const produtosFiltrados = searchTerm.length === 0
        ? produtos
        : produtos.filter(produto =>
            produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            produto.codigo_sku.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const getTipoLabel = (tipo: string) => {
        const tipos: { [key: string]: string } = {
            'MP': 'Matéria-Prima',
            'PA': 'Produto Acabado',
            'SV': 'Serviço',
            'SB': 'Sub-produto'
        };
        return tipos[tipo] || tipo;
    };

    const getTipoBadge = (tipo: string) => {
        const styles: { [key: string]: string } = {
            'MP': 'bg-blue-100 text-blue-800',
            'PA': 'bg-green-100 text-green-800',
            'SV': 'bg-purple-100 text-purple-800',
            'SB': 'bg-orange-100 text-orange-800'
        };
        return styles[tipo] || 'bg-gray-100 text-gray-800';
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Produtos</h1>
                    <p className="text-gray-500 mt-2">Cadastre e gerencie seus produtos, insumos e matérias-primas</p>
                </div>

                {/* Formulário de Cadastro / Edição */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 border-b border-blue-200">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Plus className="text-blue-600" size={24} />
                            {/* Título dinâmico */}
                            {editingProduto ? `Editar Produto: ${editingProduto.nome}` : 'Cadastrar Novo Produto'}
                        </h2>
                    </div>

                    <div className="p-8">
                        {formError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                                <p className="text-sm text-red-700">{formError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-6">
                                {/* Nome do Item */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome do Item *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ex: Farinha de Trigo"
                                        required
                                    />
                                </div>

                                {/* Código (SKU) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código (SKU)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.codigo_sku}
                                        onChange={(e) => setFormData({ ...formData, codigo_sku: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ex: FT-001"
                                    />
                                </div>

                                {/* Tipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo *
                                    </label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                    >
                                        <option value="MP">Matéria-Prima</option>
                                        <option value="PA">Produto Acabado</option>
                                        <option value="SV">Serviço</option>
                                        <option value="SB">Sub-produto</option>
                                    </select>
                                </div>

                                {/* Unidade de Medida */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unidade (ex: kg, un, m) *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.unidade_medida}
                                        onChange={(e) => setFormData({ ...formData, unidade_medida: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ex: kg"
                                        required
                                    />
                                </div>

                                {/* Preço de Custo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preço de Custo (R$)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.preco_custo}
                                            onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 gap-3">
                                {editingProduto && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-8 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all shadow-sm"
                                    >
                                        Cancelar Edição
                                    </button>
                                )}
                                <button
                                    type="submit" // Mudado para type="submit" para usar o onSubmit do form
                                    disabled={isSubmitting}
                                    className={`px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-lg flex items-center gap-2 ${isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-600/30'
                                        }`}
                                >
                                    <Plus size={20} />
                                    {/* Texto dinâmico do botão */}
                                    {isSubmitting ? 'Salvando...' : editingProduto ? 'Salvar Edição' : 'Salvar Produto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Lista de Produtos (Tabela) */}

                {/* Removido o bloco de debug que impedia a renderização da tabela */}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Produtos Cadastrados</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto' : 'produtos'}
                            </p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-500">Carregando produtos...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-8">
                                <div className="flex items-center justify-center gap-3 text-red-600">
                                    <AlertCircle size={24} />
                                    <p>{error}</p>
                                </div>
                            </div>
                        ) : produtosFiltrados.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package className="text-gray-400" size={32} />
                                    </div>
                                    <p className="text-gray-500 mb-2">
                                        {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado ainda'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {searchTerm ? 'Tente buscar por outro termo' : 'Comece cadastrando seu primeiro produto acima'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SKU
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unidade
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Custo (R$)
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {produtosFiltrados.map((produto) => (
                                        <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {produto.codigo_sku || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {produto.nome}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoBadge(produto.tipo)}`}>
                                                    {getTipoLabel(produto.tipo)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {produto.unidade_medida}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                R$ {parseFloat(String(produto.preco_custo)).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(produto)} // Conectado à função de edição
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(produto.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Deletar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PaginaProdutos;