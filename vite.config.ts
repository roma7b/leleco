
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente baseadas no modo (development/production)
  // O terceiro argumento '' permite carregar todas as variáveis do sistema (como as do Netlify)
  const env = loadEnv(mode, process.cwd(), '');

  // TENTA ENCONTRAR A CHAVE EM VÁRIAS VARIAÇÕES DE NOME COMUNS
  // Isso resolve o problema de nomes diferentes no Netlify vs Local
  const apiKey = env.API_KEY || env.VITE_API_KEY || env.VITE_GEMINI_API_KEY || env.REACT_APP_GEMINI_API_KEY || '';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Isso injeta o valor encontrado diretamente no código final
      'process.env.API_KEY': JSON.stringify(apiKey),
      
      // Mapeia outras variáveis necessárias
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    }
  };
});
