import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente baseadas no modo (development/production)
  // O terceiro argumento '' permite carregar todas as variáveis, não apenas as com prefixo VITE_
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Isso faz com que 'process.env.API_KEY' funcione no navegador
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Mapeia outras variáveis necessárias
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    }
  };
});