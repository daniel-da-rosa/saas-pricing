// Em frontend/src/pages/dashboard/produtos.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { produtosAPI, Produto } from '../../lib/api';
import ProdutoForm from '../../components/ProductForm';
import DashboardLayout from '../../components/DashboardLayoutModerno';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';

const PaginaProdutos = () => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const handleSuccess = () => {
        console.log('Produto salvo com sucesso, recarregando lista...');
        carregarProdutos();
    };

    const handleDelete = async (id: number) => {
        try {
            await produtosAPI.delete(id);
            carregarProdutos();
        } catch (err) {
            setError('Falha ao deletar produto. Verifique se ele não está em uso em uma composição.');
            console.error(err);
        }
    };

    return (
        <DashboardLayout>
            <div>
                <h1>Gerenciamento de Produtos</h1>

                <hr />

                <div style={{ marginBottom: '20px' }}>
                    <ProdutoForm onSuccess={handleSuccess} />
                </div>

                <hr />

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
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                color: '#dc2626',
                                                                padding: '4px 8px'
                                                            }}
                                                        >
                                                            <Trash2 size={18} />
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
                                                                background: 'red',
                                                                borderRadius: '8px',
                                                                marginTop: '16px',
                                                                color: 'white'
                                                            }}>
                                                                <p>TESTE VISIVEL</p>
                                                                <p>SKU: {produto.codigo_sku}</p>
                                                                <p>Nome: {produto.nome}</p>
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