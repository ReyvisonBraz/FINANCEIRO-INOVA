import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase] URL:', supabaseUrl ? '✅ Definida' : '❌ UNDEFINED');
console.log('[Supabase] ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ UNDEFINED');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] ❌ ERRO: Variáveis não definidas!');
  console.error('[Supabase] Configure no Vercel: Settings > Environment Variables');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (url, options) => {
        const start = Date.now();
        console.log(`[Supabase] 🌐 REQUEST: ${url}`, { options });
        return fetch(url, options)
          .then(response => {
            const duration = Date.now() - start;
            console.log(`[Supabase] ✅ RESPONSE: ${url} (${duration}ms)`, { 
              status: response.status, 
              statusText: response.statusText 
            });
            return response;
          })
          .catch(error => {
            const duration = Date.now() - start;
            console.error(`[Supabase] ❌ ERROR: ${url} (${duration}ms)`, error);
            throw error;
          });
      }
    }
  }
);

console.log('[Supabase] ✅ Cliente inicializado');
