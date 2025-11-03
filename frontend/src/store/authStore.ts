import api from '@/lib/api';
// import { use } from 'react'; // Este import não é necessário, removi
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
    login: (credentials: { email: string, password: string }) => Promise<void>; // Corrigido 'credendials'
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            user: null,
            isLoading: false,


            // --- FUNÇÃO DE LOGIN CORRIGIDA ---
            login: async (credentials) => { // Corrigido 'Credentials' para 'credentials'
                set({ isLoading: true });

                try {
                    // 1. CHAMA A API REAL
                    const response = await api.post('/auth/login/', credentials);

                    // 2. PEGA AS CHAVES CORRETAS (baseado no seu log!)
                    const { tokens, user } = response.data; // <-- MUDANÇA AQUI

                    // 3. SALVA OS DADOS REAIS NO STORE
                    set({
                        accessToken: tokens.access, // <-- MUDANÇA CRÍTICA AQUI
                        user: user,
                        isLoading: false,
                    });

                    console.log('Login REAL bem-sucedido!', response.data);

                } catch (error: any) {
                    // 4. LIDA COM ERROS REAIS
                    console.error('Erro no login REAL:', error.response?.data || error.message);
                    set({ isLoading: false });
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