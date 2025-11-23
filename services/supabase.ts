
import { createClient } from '@supabase/supabase-js';

// Tenta acessar variáveis de ambiente de forma segura
const env = (import.meta as any).env || {};

// Configuração do Supabase
// Prioriza variáveis de ambiente, mas usa as credenciais fornecidas como fallback para funcionar imediatamente
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://zldvsdpgznhjlrwqigeo.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZHZzZHBnem5oamxyd3FpZ2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MDM4MTQsImV4cCI6MjA3OTE3OTgxNH0.4XQN9tIP5zjGlrLPc3FajT429u_VJeX4xdzOBoF3q6k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
