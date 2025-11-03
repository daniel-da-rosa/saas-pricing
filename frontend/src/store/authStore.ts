import api from '@/lib/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//Define a aparencia do usuário
interface User {
    pk: number;
    email: string;
    username: string;
}

interface AuthState {
    accessToken: string | null;
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>; // <-- MUDANÇA AQUI
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            user: null,
            isLoading: false,

            // --- FUNÇÃO DE LOGIN CORRIGIDA ---
            login: async (email, password) => { // <-- MUDANÇA AQUI
                set({ isLoading: true });

                try {
                    // 1. CHAMA A API REAL
                    const response = await api.post('/auth/login/', { 
                        email, 
                        password 
                    });

                    // 2. PEGA AS CHAVES CORRETAS
                    const { tokens, user } = response.data;

                    // 3. SALVA OS DADOS REAIS NO STORE
                    set({
                        accessToken: tokens.access,
                        user: user,
                        isLoading: false,
                    });

                    console.log('Login REAL bem-sucedido!', response.data);

                } catch (error: any) {
                    // 4. LIDA COM ERROS REAIS E LANÇA O ERRO
                    console.error('Erro no login REAL:', error.response?.data || error.message);
                    set({ isLoading: false });
                    
                    // IMPORTANTE: Lance o erro para o componente capturar
                    throw new Error(error.response?.data?.message || 'Falha no login');
                }
            },

            //logout
            logout: () => {
                set({
                    accessToken: null,
                    user: null,
                    isLoading: false,
                });
                console.log('Logout realizado com sucesso!')
            }
        }),
        {
            name: 'auth-storage', //nome da storage local
        }
    )
)