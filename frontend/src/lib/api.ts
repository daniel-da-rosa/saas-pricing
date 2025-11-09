import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em requisições
api.interceptors.request.use((config) => {
  // 🚨 CORREÇÃO PRINCIPAL: Lê o token do objeto JSON persistido pelo Zustand
  const storedState = localStorage.getItem('auth-storage');
  let token: string | null = null;

  if (storedState) {
    try {
      // O token está aninhado em 'state.accessToken' dentro do JSON de 'auth-storage'
      const parsedState = JSON.parse(storedState);
      token = parsedState.state.accessToken;
    } catch (error) {
      console.error('Erro ao ler auth-storage:', error);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token em caso de 401
// Interceptor para adicionar token em requisições
api.interceptors.request.use(
  (config) => {
    // Verifica se estamos no browser
    if (typeof window !== 'undefined') {
      try {
        const storedState = localStorage.getItem('auth-storage');

        if (storedState) {
          const parsedState = JSON.parse(storedState);
          const token = parsedState?.state?.accessToken;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Token adicionado ao axios');
          } else {
            console.warn('⚠️ Token não encontrado em auth-storage');
          }
        } else {
          console.warn('⚠️ auth-storage não encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao processar token:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

export interface Produto {
  id: number;
  nome: string;
  codigo_sku: string;
  tipo: 'MP' | 'PA' | 'SV' | 'SB'; // Matéria-Prima, Produto Acabado, etc.
  unidade_medida: string;
  preco_custo: string; // Vem como string, precisa converter para número
  is_active: boolean;
}

// Tipo para criar um novo produto (não precisa de ID ou empresa)
export type NovoProduto = Omit<Produto, 'id' | 'is_active'>;

// Funções de API
export const authAPI = {
  register: (data: any) => api.post('/auth/register/', data),
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  getProfile: () => api.get('/auth/profile/'),
};

export const plansAPI = {
  list: () => api.get('/plans/'),
  get: (slug: string) => api.get(`/plans/${slug}/`),
};

export const subscriptionsAPI = {
  list: () => api.get('/subscriptions/'),
  create: (plan_id: number) => api.post('/subscriptions/', { plan_id }),
  cancel: (id: number) => api.post(`/subscriptions/${id}/cancel/`),
  getActive: () => api.get('/subscriptions/active/'),
};

export const paymentsAPI = {
  list: () => api.get('/payments/'),
};

export interface ItemComposicao {
  id?: number;
  componente: number; // ID do Produto (FK para Produto, ex: Farinha)
  quantidade: number;
}

export interface Composicao {
  id: number;
  produto_acabado: number; // ID do Produto Acabado (PA) que esta receita define
  descricao: string;
  custo_adicional_fixo: string;
  itens: ItemComposicao[]; // A lista de ingredientes
}

export type NovaComposicao = Omit<Composicao, 'id'>;

// ... (Adicionar no final do arquivo, com as outras APIs) ...
export const composicoesAPI = {
  list: () => api.get<Composicao[]>('/composicoes/'),

  create: (data: NovaComposicao) => api.post<Composicao>('/composicoes/', data),

  update: (id: number, data: NovaComposicao) =>
    api.put<Composicao>(`/composicoes/${id}/`, data),

  delete: (id: number) => api.delete(`/composicoes/${id}/`),
};

export const produtosAPI = {
  /**
   * Busca a lista de todos os produtos da empresa logada
   * (GET /api/produtos/)
   */
  list: () => api.get<Produto[]>('/produtos/'),

  /**
   * Cria um novo produto no backend
   * (POST /api/produtos/)
   */
  create: (data: NovoProduto) => api.post<Produto>('/produtos/', data),

  /**
   * Atualiza um produto existente no backend
   * (PUT /api/produtos/{id}/)
   */
  update: (id: number, data: Partial<NovoProduto>) =>
    api.put<Produto>(`/produtos/${id}/`, data),

  /**
   * Deleta um produto do backend
   * (DELETE /api/produtos/{id}/)
   */
  delete: (id: number) => api.delete(`/produtos/${id}/`),
};