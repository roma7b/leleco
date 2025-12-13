
import { createClient } from '@supabase/supabase-js';

// Tenta acessar variáveis de ambiente de forma segura
const env = (import.meta as any).env || {};

// Configuração do Supabase
// Prioriza variáveis de ambiente. Se não existirem, define valores vazios inicialmente.
let supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
let supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Verificação de Segurança para evitar Crash "supabaseUrl is required"
// O createClient obriga a ter uma URL válida. Se não tivermos chaves (ex: deploy novo sem env vars),
// injetamos valores placeholder para que o app carregue a interface (mesmo que o banco dê erro depois),
// permitindo que o usuário veja o erro no console ou na UI ao invés de tela branca.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ [SUPABASE] Chaves não detectadas. Usando modo placeholder para evitar crash da aplicação.');
  supabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
  supabaseAnonKey = supabaseAnonKey || 'placeholder-key';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
