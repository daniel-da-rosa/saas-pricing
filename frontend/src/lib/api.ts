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
      // Pega o token de acesso
      token = parsedState.state.accessToken;
    } catch (error) {
      console.error('Erro ao ler auth-storage:', error);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // console.log('✅ Token adicionado ao axios'); // Removido log redundante
  } else {
    // console.warn('⚠️ Token não encontrado em auth-storage'); // Removido log redundante
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// REMOVIDO: O segundo interceptor de request duplicado.
// O token é adicionado uma vez no primeiro bloco.


// --- Interceptor de Response (Lógica de Refresh Token) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isTokenError = error.response.status === 400 && error.response.data.code === 'token_not_valid';

    // 1. Condição para tentar o Refresh Token: 
    //    É um erro de token INVÁLIDO (400).
    if (isTokenError && !originalRequest._isRetry) {

      originalRequest._isRetry = true;

      const storedState = localStorage.getItem('auth-storage');
      let refreshToken = null;

      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);

          // 1. CORREÇÃO DE LEITURA: LÊ O TOKEN DA RAIZ DO OBJETO
          refreshToken = parsedState.refresh_token; // ✅ Lendo 'refresh_token' da raiz

        } catch (e) {
          console.error('Erro ao parsear auth-storage para refresh:', e);
        }
      }

      if (refreshToken) {
        try {
          // 2. CORREÇÃO DE PAYLOAD: O payload DEVE USAR A CHAVE CORRETA ESPERADA PELO DJANGO (geralmente 'refresh')
          const refreshResponse = await axios.post(
            `${API_URL}/auth/token/refresh/`,
            { refresh: refreshToken } // ✅ ENVIANDO O TOKEN LIDO NA CHAVE 'refresh'
          );

          const newAccessToken = refreshResponse.data.access;

          // 3. Atualiza o Local Storage (Zustand) com o novo Access Token
          if (typeof window !== 'undefined') {
            const currentStoredState = JSON.parse(localStorage.getItem('auth-storage') || '{}');

            const updatedState = {
              ...currentStoredState,
              state: {
                ...currentStoredState.state,
                accessToken: newAccessToken, // Sobrescreve apenas o access token
              },
            };
            localStorage.setItem('auth-storage', JSON.stringify(updatedState));
          }

          // 4. Configura o novo token na requisição original e a repete
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          console.log("✅ Token de acesso renovado e requisição repetida.");
          return api(originalRequest);

        } catch (refreshError) {
          // Se o refresh token falhar (ex: expirou também), redireciona/desloga.
          console.error("❌ Falha na renovação do Refresh Token. Usuário precisa logar novamente.", refreshError);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage'); // Limpa o token expirado/inválido
            window.location.href = '/login'; // Redireciona o usuário para a página de login
          }
          return Promise.reject(refreshError);
        }
      }
    }

    // Para todos os outros erros ou falhas de renovação
    return Promise.reject(error);
  }
);


export default api;

// --- Interfaces e APIs (Mantidas inalteradas) ---

export interface Produto {
  id: number;
  nome: string;
  codigo_sku: string;
  tipo: 'MP' | 'PA' | 'SV' | 'SB';
  unidade_medida: string;
  preco_custo: string;
  is_active: boolean;
}

export type NovoProduto = Omit<Produto, 'id' | 'is_active'>;

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

export type NovaComposicao = Omit<Composicao, 'id'>;

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
   */
  list: () => api.get<Produto[]>('/produtos/'),

  /**
   * Cria um novo produto no backend
   */
  create: (data: NovoProduto) => api.post<Produto>('/produtos/', data),

  /**
   * Atualiza um produto existente no backend
   */
  update: (id: number, data: Partial<NovoProduto>) =>
    api.put<Produto>(`/produtos/${id}/`, data),

  /**
   * Deleta um produto do backend
   */
  delete: (id: number) => api.delete(`/produtos/${id}/`),
};