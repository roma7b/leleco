
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente baseadas no modo (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  // Prioriza a variável definida no Netlify (API_KEY) ou variações locais
  const apiKey = env.API_KEY || env.VITE_API_KEY || env.VITE_GEMINI_API_KEY || env.REACT_APP_GEMINI_API_KEY || '';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Injeta as variáveis de forma segura no processo de build
      // Usa || '' para garantir que nunca seja undefined, o que quebraria o JSON.stringify
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
    }
  };
});
