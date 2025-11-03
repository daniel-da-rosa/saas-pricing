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
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token em caso de 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Implementar refresh token aqui depois
          // const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken });
          // localStorage.setItem('access_token', data.access);
          // return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

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
