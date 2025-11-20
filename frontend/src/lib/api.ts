import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor de Request (Adiciona o Access Token) ---
api.interceptors.request.use((config) => {
  const storedState = localStorage.getItem('auth-storage');
  let token = null;

  if (storedState) {
    try {
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
}, (error) => {
  return Promise.reject(error);
});

// --- Interceptor de Response (Lógica de Refresh Token) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isTokenError = error.response?.status === 400 && error.response?.data?.code === 'token_not_valid';

    if (isTokenError && !originalRequest._isRetry) {
      originalRequest._isRetry = true;

      const storedState = localStorage.getItem('auth-storage');
      let refreshToken = null;

      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          refreshToken = parsedState.refresh_token;
        } catch (e) {
          console.error('Erro ao parsear auth-storage para refresh:', e);
        }
      }

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${API_URL}/auth/token/refresh/`,
            { refresh: refreshToken }
          );

          const newAccessToken = refreshResponse.data.access;

          if (typeof window !== 'undefined') {
            const currentStoredState = JSON.parse(localStorage.getItem('auth-storage') || '{}');

            const updatedState = {
              ...currentStoredState,
              state: {
                ...currentStoredState.state,
                accessToken: newAccessToken,
              },
            };
            localStorage.setItem('auth-storage', JSON.stringify(updatedState));
          }

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          console.log("✅ Token de acesso renovado e requisição repetida.");
          return api(originalRequest);

        } catch (refreshError) {
          console.error("❌ Falha na renovação do Refresh Token. Usuário precisa logar novamente.", refreshError);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);


export default api;

// --- Interfaces e APIs ---

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
  created_at: string;
  has_company: boolean;
}

export interface Empresa {
  id: number;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  telefone: string;
  endereco: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: number;
  nome: string;
  codigo_sku: string;
  tipo: string;
  tipo_nome?: string;
  unidade_medida: string;
  unidade_medida_nome?: string;
  preco_custo: string;
  is_active: boolean;
  peso_liquido?: number;
  peso_bruto?: number;
  referencia?: string;
  marca?: string;
}

export type NovoProduto = Omit<Produto, 'id' | 'is_active'>;

export interface ItemComposicao {
  id?: number;
  componente: number;
  quantidade: number;
}

export interface Composicao {
  id: number;
  produto_acabado: number;
  descricao: string;
  custo_adicional_fixo: string;
  itens: ItemComposicao[];
}

export interface TipoProdutoAPI {
  id: number;
  nome: string;
  tipo: string;
}

export interface UnidadeMedidaAPI {
  id: number;
  nome: string;
  sigla: string;
}

export type NovaComposicao = Omit<Composicao, 'id'>;

export const authAPI = {
  register: (data: any) => api.post('/auth/register/', data),
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  getProfile: () => api.get<User>('/auth/profile/'),
};

export const empresaAPI = {
  getMyCompany: () => api.get<Empresa>('/auth/empresas/me/'),
  create: (data: Omit<Empresa, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Empresa>('/auth/empresas/me/', data),
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

export const composicoesAPI = {
  list: () => api.get<Composicao[]>('/composicoes/'),
  create: (data: NovaComposicao) => api.post<Composicao>('/composicoes/', data),
  update: (id: number, data: NovaComposicao) =>
    api.put<Composicao>(`/composicoes/${id}/`, data),
  delete: (id: number) => api.delete(`/composicoes/${id}/`),
};

export const produtosAPI = {
  list: () => api.get<Produto[]>('/produtos/'),
  create: (data: NovoProduto) => api.post<Produto>('/produtos/', data),
  update: (id: number, data: Partial<NovoProduto>) =>
    api.put<Produto>(`/produtos/${id}/`, data),
  delete: (id: number) => api.delete(`/produtos/${id}/`),
};