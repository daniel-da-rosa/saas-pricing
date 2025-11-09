// Em frontend/src/components/ComposicaoForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    composicoesAPI, produtosAPI, Produto,
    Composicao, NovaComposicao, ItemComposicao
} from '../lib/api';
import { produce } from 'immer'; // Use Immer para manipular arrays de estado de forma imutável

// --- Instale o Immer para facilitar o gerenciamento de arrays:
// npm install immer

interface ComposicaoFormProps {
    onSuccess: () => void;
}

// --- Estado Inicial (Nova Receita) ---
const initialComposicaoState: NovaComposicao = {
    produto_acabado: 0, // ID do Produto Acabado que está sendo definido
    descricao: '',
    custo_adicional_fixo: '0.00',
    itens: [], // A lista dinâmica de ItemComposicao
};

const ComposicaoForm: React.FC<ComposicaoFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState<NovaComposicao>(initialComposicaoState);
    const [produtosDisponiveis, setProdutosDisponiveis] = useState<Produto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Busca de Produtos (Para os Dropdowns) ---
    const fetchProdutos = useCallback(async () => {
        try {
            // Busca todos os produtos para que possam ser usados como componentes
            const response = await produtosAPI.list();
            setProdutosDisponiveis(response.data);
        } catch (err) {
            console.error("Erro ao carregar produtos para a composição:", err);
        }
    }, []);

    useEffect(() => {
        fetchProdutos();
    }, [fetchProdutos]);

    // --- Manipuladores do Formulário Principal ---
    const handleComposicaoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --- Manipuladores do Array de Itens (Ingredientes) ---

    const handleItemChange = (index: number, name: keyof ItemComposicao, value: any) => {
        // Usa Immer para garantir a imutabilidade ao atualizar o array
        const nextState = produce(formData, draft => {
            // Converte 'componente' para número, se for a FK
            if (name === 'componente') {
                draft.itens[index][name] = parseInt(value);
            } else if (name === 'quantidade') {
                // Armazena quantidade como número para facilitar a manipulação
                draft.itens[index][name] = parseFloat(value) || 0;
            } else {
                // Outros campos
                draft.itens[index][name] = value;
            }
        });
        setFormData(nextState);
    };

    const handleAddItem = () => {
        const newItem: ItemComposicao = {
            componente: 0, // ID 0 ou o primeiro item da lista
            quantidade: 1,
        };
        setFormData((prev) => ({
            ...prev,
            itens: [...prev.itens, newItem],
        }));
    };

    const handleRemoveItem = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            itens: prev.itens.filter((_, i) => i !== index),
        }));
    };

    // --- Envio da Receita ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Limpeza e conversão final antes de enviar:
            const dataToSend: NovaComposicao = {
                ...formData,
                // Garante que a FK 'produto_acabado' seja um número inteiro
                produto_acabado: parseInt(formData.produto_acabado as any),
                // Converte custo fixo para string com 2 casas decimais (como o DecimalField espera)
                custo_adicional_fixo: parseFloat(formData.custo_adicional_fixo).toFixed(2),
                // Remove itens com componente inválido
                itens: formData.itens.filter(item => item.componente > 0)
                    .map(item => ({ ...item, quantidade: item.quantidade.toFixed(4) as any })),
            };

            await composicoesAPI.create(dataToSend);

            onSuccess();
            setFormData(initialComposicaoState); // Limpa o formulário

        } catch (err: any) {
            console.error("Erro ao salvar composição:", err.response?.data || err);
            if (err.response && err.response.data) {
                const apiError = err.response.data;
                setError(`Erro na API: ${JSON.stringify(apiError)}`);
            } else {
                setError('Falha ao salvar composição. Verifique a conexão.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Filtra os produtos para o dropdown de Produto Acabado
    const produtosAcabados = produtosDisponiveis.filter(p => p.tipo === 'PA' || p.tipo === 'SB');
    // Produtos que podem ser componentes (MP, SV, SB)
    const produtosComponentes = produtosDisponiveis.filter(p => p.tipo !== 'PA');


    // --- Renderização ---
    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-3">
                Cadastrar Nova Composição (Receita)
            </h3>

            {/* Mensagens */}
            {error && (
                <p className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                </p>
            )}

            {/* --- SEÇÃO: PRODUTO PRINCIPAL --- */}
            <div className="grid grid-cols-2 gap-4">
                {/* Produto Acabado */}
                <div className="flex flex-col">
                    <label htmlFor="produto_acabado" className="mb-1 text-sm font-medium text-gray-700">
                        Produto a ser fabricado (Acabado/Sub-produto)
                    </label>
                    <select
                        id="produto_acabado"
                        name="produto_acabado"
                        value={formData.produto_acabado}
                        onChange={handleComposicaoChange}
                        required
                        className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value={0} disabled>Selecione um produto...</option>
                        {produtosAcabados.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nome} ({p.codigo_sku})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Custo Fixo Adicional */}
                <div className="flex flex-col">
                    <label htmlFor="custo_adicional_fixo" className="mb-1 text-sm font-medium text-gray-700">
                        Custo Fixo Adicional (R$)
                    </label>
                    <input
                        type="number"
                        id="custo_adicional_fixo"
                        name="custo_adicional_fixo"
                        value={formData.custo_adicional_fixo}
                        onChange={handleComposicaoChange}
                        step="0.01"
                        min="0"
                        className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* --- SEÇÃO: ITENS DA COMPOSIÇÃO (Receita Dinâmica) --- */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700">Ingredientes / Componentes da Receita</h4>

                {formData.itens.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 border rounded-md">

                        {/* Componente (Dropdown) */}
                        <div className="col-span-6 flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Componente ({item.componente})</label>
                            <select
                                value={item.componente || 0}
                                onChange={(e) => handleItemChange(index, 'componente', e.target.value)}
                                required
                                className="p-2 border border-gray-300 rounded text-sm bg-white"
                            >
                                <option value={0} disabled>Selecione...</option>
                                {produtosComponentes.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome} ({p.unidade_medida}) - R$ {p.preco_custo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quantidade */}
                        <div className="col-span-4 flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Quantidade</label>
                            <input
                                type="number"
                                value={item.quantidade}
                                onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                                required
                                step="0.0001"
                                min="0"
                                className="p-2 border border-gray-300 rounded text-sm"
                            />
                        </div>

                        {/* Botão Remover */}
                        <div className="col-span-2 text-right">
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="p-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                ))}

                {/* Botão Adicionar Item */}
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full p-3 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition"
                >
                    + Adicionar Ingrediente/Componente
                </button>
            </div>


            {/* --- BOTÃO SALVAR --- */}
            <div className="pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full p-3 rounded font-bold text-white transition duration-150 ease-in-out 
                        ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isLoading ? 'Salvando Receita...' : 'Salvar Composição'}
                </button>
            </div>
        </form>
    );
};

export default ComposicaoForm;