// Em frontend/src/components/ProductForm.tsx
import React, { useState } from 'react';
import { produtosAPI, NovoProduto } from '../lib/api'; // Importamos nossa API e tipos
// Certifique-se de que o nome do componente é ProductForm (se o arquivo for ProductForm.tsx)
// Se o arquivo for ProdutoForm.tsx, use 'ProdutoForm' aqui.
// Vou usar ProdutoForm para consistência com o que você enviou.

// --- Props que o componente vai receber ---
interface ProdutoFormProps {
    onSuccess: () => void;
}

// --- Estado inicial do formulário ---
const initialState: NovoProduto = {
    nome: '',
    codigo_sku: '',
    tipo: 'MP', // Default para Matéria-Prima
    unidade_medida: '',
    preco_custo: '0.00',
};

const ProdutoForm: React.FC<ProdutoFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState<NovoProduto>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Função para atualizar o estado ---
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --- Função para enviar o formulário ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // 1. Chama nossa função da API
            await produtosAPI.create(formData);

            // 2. Avisa o componente pai que deu certo
            onSuccess();

            // 3. Limpa o formulário
            setFormData(initialState);

        } catch (err: any) {
            console.error(err);
            // Lida com erros de validação do Django (DRF)
            if (err.response && err.response.data) {
                const apiError = err.response.data;
                const firstErrorKey = Object.keys(apiError)[0];
                setError(`${firstErrorKey}: ${apiError[firstErrorKey]}`);
            } else {
                setError('Falha ao criar o produto. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 p-4 bg-white rounded-lg shadow-md">
            
            <h3 className="col-span-2 text-xl font-semibold mb-2 text-gray-800">
                Cadastrar Novo Produto
            </h3>

            {/* Mensagem de Erro */}
            {error && (
                <p className="col-span-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    Erro: {error}
                </p>
            )}

            {/* Campo Nome */}
            <div className="flex flex-col">
                <label htmlFor="nome" className="mb-1 text-sm font-medium text-gray-700">
                    Nome do Item
                </label>
                <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Campo SKU */}
            <div className="flex flex-col">
                <label htmlFor="codigo_sku" className="mb-1 text-sm font-medium text-gray-700">
                    Código (SKU)
                </label>
                <input
                    type="text"
                    id="codigo_sku"
                    name="codigo_sku"
                    value={formData.codigo_sku}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Campo Tipo */}
            <div className="flex flex-col">
                <label htmlFor="tipo" className="mb-1 text-sm font-medium text-gray-700">
                    Tipo
                </label>
                <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="MP">Matéria-Prima</option>
                    <option value="PA">Produto Acabado</option>
                    <option value="SV">Serviço</option>
                    <option value="SB">Sub-produto</option>
                </select>
            </div>

            {/* Campo Unidade de Medida */}
            <div className="flex flex-col">
                <label htmlFor="unidade_medida" className="mb-1 text-sm font-medium text-gray-700">
                    Unidade (ex: kg, un, m)
                </label>
                <input
                    type="text"
                    id="unidade_medida"
                    name="unidade_medida"
                    value={formData.unidade_medida}
                    onChange={handleChange}
                    required
                    className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Campo Preço de Custo */}
            <div className="flex flex-col">
                <label htmlFor="preco_custo" className="mb-1 text-sm font-medium text-gray-700">
                    Preço de Custo (R$)
                </label>
                <input
                    type="number"
                    id="preco_custo"
                    name="preco_custo"
                    value={formData.preco_custo}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Botão de Envio (Ocupa as 2 colunas e alinha à direita) */}
            <div className="col-span-2 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`p-3 w-40 rounded font-bold text-white transition duration-150 ease-in-out 
                        ${isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                        }`}
                >
                    {isLoading ? 'Salvando...' : 'Salvar Produto'}
                </button>
            </div>
        </form>
    );
};

export default ProdutoForm;