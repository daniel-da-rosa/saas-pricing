// Em frontend/src/pages/dashboard/composicoes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { composicoesAPI, Composicao, Produto, produtosAPI } from '../../lib/api';
import ComposicaoForm from '../../components/ComposicaoForm';
import DashboardLayout from '../../components/DashboardLayoutModerno';

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
            <div className="space-y-6">
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
                            {/* ... resto da tabela ... */}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PaginaComposicoes;