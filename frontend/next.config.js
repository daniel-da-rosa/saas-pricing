// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // (Mantenha seu proxy da API que fizemos antes)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
    ]
  },

  // --- ADICIONE ESTE BLOCO ---
  // Força o Next.js a usar "polling" no Docker/WSL
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000, // Verifica por mudanças a cada 1 segundo (1000ms)
      aggregateTimeout: 300, // Agrupa múltiplas mudanças
    };
    return config;
  },
  // --- FIM DO BLOCO ---
}

module.exports = nextConfig