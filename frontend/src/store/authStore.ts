import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//Define a aparencia do usuário
interface User{
    pk: number;
    email: string;
    username: string;
}

interface AuthState {
    accessToken: string | null;
    user : User | null;
    isLoading : boolean;
    login: (credendials :{email: string, password: string}) => Promise<void>;
    logout : ()=> void;
}

//Funão de ajuda para simular uma demora na rede.
const sleep = (ms: number)=> new Promise((resolve) => setTimeout(resolve,ms));

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            user: null,
            isLoading: false,
            //função de mock - teste
            login: async (Credentials)=>{
                set({ isLoading: true});

                //mostra no console o que retorna
                console.log('Tendando conectar com:',Credentials);

                //simular a demora na api
                await sleep(1000);

                //verifica se a senha é correta - aqui é fake por hora
                if (Credentials.password ==='1234'){
                    console.log('Login fake bem sucedido');
                    set({
                        accessToken: 'fake-jwt-token-123456',
                        user:{
                            pk: 1,
                            email: Credentials.email,
                            username : "usuario fake",
                        },
                        isLoading: false,
                    });
                }else {
                    console.log('Senha fake incorreta');
                    set({ isLoading: false});
                }
            },

            //logout
            logout: ()=>{
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