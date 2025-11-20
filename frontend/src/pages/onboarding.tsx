"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { Building2 } from 'lucide-react';

const OnboardingPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nome_fantasia: '',
        razao_social: '',
        cnpj: '',
        telefone: '',
        endereco: '',
        email: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/empresas/me/', formData);
            // Redirect to dashboard after successful registration
            router.push('/dashboard/produtos');
        } catch (err: any) {
            console.error('Erro ao cadastrar empresa:', err);
            setError(err.response?.data?.detail || 'Erro ao cadastrar empresa. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

            <div className="relative w-full max-w-2xl">
                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                            <Building2 size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Bem-vindo ao Sistema!
                        </h1>
                        <p className="text-white/90 text-sm">
                            Para começar, precisamos de algumas informações sobre sua empresa
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                                <p className="text-red-200 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nome Fantasia */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white mb-2">
                                    Nome Fantasia *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nome_fantasia}
                                    onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                                    placeholder="Ex: Minha Empresa Ltda"
                                />
                            </div>

                            {/* Razão Social */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white mb-2">
                                    Razão Social
                                </label>
                                <input
                                    type="text"
                                    value={formData.razao_social}
                                    onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                                    placeholder="Ex: Minha Empresa Comércio Ltda"
                                />
                            </div>

                            {/* CNPJ */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    CNPJ
                                </label>
                                <input
                                    type="text"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>

                            {/* Telefone */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Telefone
                                </label>
                                <input
                                    type="text"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            {/* Endereço */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white mb-2">
                                    Endereço
                                </label>
                                <input
                                    type="text"
                                    value={formData.endereco}
                                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                                    placeholder="Rua, Número, Bairro, Cidade - UF"
                                />
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white mb-2">
                                    Email da Empresa
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                                    placeholder="contato@minhaempresa.com"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Cadastrando...' : 'Cadastrar Empresa'}
                        </button>

                        <p className="text-white/60 text-xs text-center">
                            * Campos obrigatórios
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
