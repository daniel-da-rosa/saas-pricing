// Em frontend/src/pages/dashboard/composicoes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { composicoesAPI, Composicao, Produto, produtosAPI } from '../../lib/api';
import ComposicaoForm from '../../components/ComposicaoForm';
import DashboardLayout from '../../components/DashBoardLayout';

// Componente para mapear o ID do produto ao seu nome
const useProdutoMap = () => {
    const [produtoMap, setProdutoMap] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        const fetchAllProdutos = async () => {
            try {
                // Buscamos todos os produtos para que possamos mostrar o nome
                const response = await produtosAPI.list();
                const map = new Map<number, string>();
                response.data.forEach(p => map.set(p.id, p.nome));
                setProdutoMap(map);
            } catch (err) {
                console.error("Erro ao buscar nomes de produtos:", err);
            }
        };
        fetchAllProdutos();
    }, []);

    return produtoMap;
};


const PaginaComposicoes = () => {
    const [composicoes, setComposicoes] = useState<Composicao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const produtoMap = useProdutoMap(); // Hook para mapear IDs para nomes

    // --- Função para carregar as composições da API ---
    const carregarComposicoes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await composicoesAPI.list();
            setComposicoes(response.data);
        } catch (err) {
            setError('Falha ao carregar as composições.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarComposicoes();
    }, [carregarComposicoes]);

    // --- Função chamada pelo Form quando uma receita é salva ---
    const handleSuccess = () => {
        carregarComposicoes(); // Recarrega a lista
    };

    // --- Função para deletar uma receita ---
    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja deletar esta composição?')) {
            try {
                await composicoesAPI.delete(id);
                carregarComposicoes();
            } catch (err) {
                setError('Falha ao deletar composição.');
                console.error(err);
            }
        }
    };


    return (
        <DashboardLayout>   
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Composições (Receitas)</h1>

                {/* Seção do Formulário */}
                <div className="shadow-lg rounded-xl">
                    <ComposicaoForm onSuccess={handleSuccess} />
                </div>

                <hr className="border-gray-300" />

                {/* Seção da Lista/Tabela */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Receitas Cadastradas</h2>

                    {isLoading && <p className="text-blue-600">Carregando receitas...</p>}
                    {error && <p className="text-red-600 bg-red-50 p-3 rounded">{error}</p>}

                    {!isLoading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto Acabado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens na Receita</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Fixo</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {composicoes.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 italic">
                                                Nenhuma composição cadastrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        composicoes.map((composicao) => (
                                            <tr key={composicao.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{composicao.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {produtoMap.get(composicao.produto_acabado) || `ID: ${composicao.produto_acabado}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {composicao.itens.length} {composicao.itens.length === 1 ? 'item' : 'itens'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">R$ {parseFloat(composicao.custo_adicional_fixo).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {/* TODO: Botão Editar */}
                                                    <button
                                                        onClick={() => handleDelete(composicao.id)}
                                                        className="text-red-600 hover:text-red-900 ml-4 p-1 rounded hover:bg-red-50 transition"
                                                    >
                                                        Deletar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout> 
    );
};

export default PaginaComposicoes;