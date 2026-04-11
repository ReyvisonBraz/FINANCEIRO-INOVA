// This file checks if environment variables are properly embedded in the built code
import { createClient } from '@supabase/supabase-js';

console.log('=== Verificando variáveis de ambiente ===\n');

// Simulate what the browser sees
const url = (import.meta as any).env?.VITE_SUPABASE_URL;
const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

console.log('VITE_SUPABASE_URL:', url || '❌ UNDEFINED');
console.log('VITE_SUPABASE_ANON_KEY:', key ? `${key.substring(0, 20)}...` : '❌ UNDEFINED');

if (!url || !key) {
  console.log('\n❌ ERRO: Variáveis de ambiente não estão sendo injetadas!');
  console.log('Isso explica por que o Supabase não funciona no browser.');
  console.log('\nVerifique:');
  console.log('1. .env file existe na raiz do projeto');
  console.log('2. VITE_SUPABASE_URL está definido');
  console.log('3. VITE_SUPABASE_ANON_KEY está definido');
  console.log('4. Vercel Environment Variables estão configuradas');
  process.exit(1);
}

console.log('\n✅ Variáveis de ambiente OK');

// Now test connection
const supabase = createClient(url, key);

async function test() {
  console.log('\n=== Testando conexão com Supabase ===\n');
  
  const { data, error } = await supabase.from('profiles').select('*');
  
  if (error) {
    console.log('❌ Erro ao conectar:', error.message);
  } else {
    console.log('✅ Conexão OK - perfis encontrados:', data?.length || 0);
  }
}

test().catch(console.error);
