import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { empresaAPI, authAPI } from '@/lib/api';
import { Building2, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import '/styles/globals.css';

export default function OnboardingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [formData, setFormData] = useState({
        razao_social: '',
        nome_fantasia: '',
        cnpj: '',
        telefone: '',
        endereco: '',
        email: '' // Added email as it might be required or useful
    });
    const [error, setError] = useState<string | null>(null);

    // Verify if user already has a company
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await authAPI.getProfile();
                if (response.data.has_company) {
                    router.push('/dashboard');
                } else {
                    // Pre-fill email if available
                    setFormData(prev => ({ ...prev, email: response.data.email }));
                }
            } catch (err) {
                console.error('Error checking status:', err);
                // If error (e.g. 401), redirect to login
                router.push('/login');
            } finally {
                setIsVerifying(false);
            }
        };
        checkStatus();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Simple masking
        if (name === 'cnpj') {
            formattedValue = value.replace(/\D/g, '')
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2')
                .substring(0, 18);
        } else if (name === 'telefone') {
            formattedValue = value.replace(/\D/g, '')
                .replace(/^(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2')
                .substring(0, 15);
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Clean masks before sending if API expects pure numbers
            // Assuming API handles strings, but usually better to send clean data if backend expects it.
            // For now sending as is, or clean if needed. Let's send as string.

            await empresaAPI.create({
                razao_social: formData.razao_social,
                nome_fantasia: formData.nome_fantasia,
                cnpj: formData.cnpj, // .replace(/\D/g, ''),
                telefone: formData.telefone, // .replace(/\D/g, ''),
                endereco: formData.endereco,
                email: formData.email
            });

            // Success! Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Error creating company:', err);
            setError(err.response?.data?.detail || 'Falha ao criar empresa. Verifique os dados e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Configurar Empresa | SaaS Pricing</title>
            </Head>
            <main className="min-h-screen w-full bg-[url('/login-bg-1.png')] bg-cover bg-center relative flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

                <div className="relative z-10 w-full max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                        {/* Left Side - Info */}
                        <div className="bg-blue-600 p-8 md:w-1/3 flex flex-col justify-between text-white">
                            <div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                                    <Building2 size={24} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold mb-4">Vamos começar!</h2>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Para utilizar o sistema, precisamos configurar o perfil da sua empresa.
                                </p>
                            </div>
                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-blue-100">
                                    <CheckCircle size={16} />
                                    <span>Cadastro rápido</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-blue-100">
                                    <CheckCircle size={16} />
                                    <span>Seguro e privado</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-blue-100">
                                    <CheckCircle size={16} />
                                    <span>Acesso imediato</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="p-8 md:w-2/3 bg-white">
                            <h1 className="text-xl font-bold text-gray-800 mb-6">Dados da Empresa</h1>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Fantasia *</label>
                                        <input
                                            type="text"
                                            name="nome_fantasia"
                                            value={formData.nome_fantasia}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Ex: Minha Loja Inc."
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Razão Social *</label>
                                        <input
                                            type="text"
                                            name="razao_social"
                                            value={formData.razao_social}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Ex: Minha Loja Ltda."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">CNPJ *</label>
                                        <input
                                            type="text"
                                            name="cnpj"
                                            value={formData.cnpj}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="00.000.000/0000-00"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone *</label>
                                        <input
                                            type="text"
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="(00) 00000-0000"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Endereço</label>
                                        <input
                                            type="text"
                                            name="endereco"
                                            value={formData.endereco}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Rua, Número, Bairro, Cidade - UF"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transform transition-all duration-200 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Criando Empresa...
                                            </>
                                        ) : (
                                            <>
                                                Criar Empresa e Acessar
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
