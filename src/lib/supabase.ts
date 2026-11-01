import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL as string) || 'https://painelsupabase.odontosouzavr.com.br';
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || '';

if (!import.meta.env?.VITE_SUPABASE_URL || !import.meta.env?.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Aviso: Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no ambiente.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'anon-key-placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
