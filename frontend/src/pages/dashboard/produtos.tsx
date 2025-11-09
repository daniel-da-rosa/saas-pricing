// Em frontend/src/pages/dashboard/produtos.tsx
import React, { useState, useEffect } from 'react';
import { produtosAPI, Produto } from '../../lib/api'; // Importa nossa API e tipo
import ProdutoForm from '../../components/ProductForm'; // Importa nosso formulário
import DashboardLayout from '../../components/DashBoardLayout';

// (Opcional: Importe seu componente de Layout do Dashboard)
// import DashboardLayout from '../../components/DashboardLayout';

const PaginaProdutos = () => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Função para carregar os produtos da API ---
    const carregarProdutos = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await produtosAPI.list();
            setProdutos(response.data); // <-- A correção é pegar .data

        } catch (err) {
            setError('Falha ao carregar produtos.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Carrega os dados quando a página é montada ---
    useEffect(() => {
        carregarProdutos();
    }, []); // O array vazio [] faz isso rodar só uma vez

    // --- Função chamada pelo Form quando um produto é salvo ---
    const handleSuccess = () => {
        // Simplesmente recarrega a lista para mostrar o novo item
        console.log('Produto salvo com sucesso, recarregando lista...');
        carregarProdutos();
    };

    // --- Função para deletar um produto ---
    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja deletar este produto?')) {
            try {
                await produtosAPI.delete(id);
                // Recarrega a lista após deletar
                carregarProdutos();
            } catch (err) {
                setError('Falha ao deletar produto. Verifique se ele não está em uso em uma composição.');
                console.error(err);
            }
        }
    };

    return (
        <DashboardLayout>
            <div>
                <h1>Gerenciamento de Produtos</h1>

                <hr />

                {/* Coluna 1: Formulário de Cadastro */}
                <div style={{ marginBottom: '20px' }}>
                    <ProdutoForm onSuccess={handleSuccess} />
                </div>

                <hr />

                {/* Coluna 2: Lista/Tabela de Produtos */}
                <div>
                    <h2>Produtos Cadastrados</h2>

                    {isLoading && <p>Carregando produtos...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    {!isLoading && !error && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f0f0f0' }}>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>SKU</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Nome</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Tipo</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Custo (R$)</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '10px' }}>
                                            Nenhum produto cadastrado.
                                        </td>
                                    </tr>
                                ) : (
                                    produtos.map((produto) => (
                                        <tr key={produto.id}>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{produto.codigo_sku}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{produto.nome}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{produto.tipo}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{parseFloat(produto.preco_custo).toFixed(2)}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                {/* TODO: Botão Editar */}
                                                <button onClick={() => handleDelete(produto.id)}>
                                                    Deletar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PaginaProdutos;