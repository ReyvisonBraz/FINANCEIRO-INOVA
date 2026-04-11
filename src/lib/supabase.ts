import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase] Inicializando cliente...');
console.log('[Supabase] URL:', supabaseUrl ? '✅ Definida' : '❌ UNDEFINED');
console.log('[Supabase] ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ UNDEFINED');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] ❌ ERRO: Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas!');
  console.error('[Supabase] Isso explicará os erros "Erro ao carregar" no browser.');
  console.error('[Supabase] Para corrigir, configure as Environment Variables na Vercel:');
  console.error('[Supabase]   Settings > Environment Variables');
  console.error('[Supabase]   Adicione:');
  console.error('[Supabase]   - VITE_SUPABASE_URL = sua_url_do_supabase');
  console.error('[Supabase]   - VITE_SUPABASE_ANON_KEY = sua_chave_anon');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

console.log('[Supabase] Cliente criado com sucesso');
