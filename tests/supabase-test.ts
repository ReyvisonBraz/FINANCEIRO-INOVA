import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnttsthsefrqlhzssqzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudHRzdGhzZWZycWxoenNzcXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODA0MTgsImV4cCI6MjA5MTM1NjQxOH0.sfxIQIFOgulJ7sTPqtC6u0A7WB1MP9dOLpSeVVYyhvU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('=== Testando conexão com Supabase ===\n');

  console.log('1. Testando tabela categories...');
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) {
    console.log('   ❌ ERRO:', catError.message);
  } else {
    console.log(`   ✅ OK - ${categories?.length || 0} categorias encontradas`);
    console.log('   Dados:', categories?.slice(0, 3));
  }

  console.log('\n2. Testando tabela customers...');
  const { data: customers, error: custError } = await supabase.from('customers').select('*');
  if (custError) {
    console.log('   ❌ ERRO:', custError.message);
  } else {
    console.log(`   ✅ OK - ${customers?.length || 0} clientes encontrados`);
  }

  console.log('\n3. Testando tabela transactions...');
  const { data: transactions, error: txError } = await supabase.from('transactions').select('*');
  if (txError) {
    console.log('   ❌ ERRO:', txError.message);
  } else {
    console.log(`   ✅ OK - ${transactions?.length || 0} transações encontradas`);
  }

  console.log('\n4. Testando tabela profiles...');
  const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
  if (profError) {
    console.log('   ❌ ERRO:', profError.message);
  } else {
    console.log(`   ✅ OK - ${profiles?.length || 0} perfis encontrados`);
    if (profiles && profiles.length > 0) {
      console.log('   Primeiro perfil:', JSON.stringify(profiles[0], null, 2));
    }
  }

  console.log('\n5. Testando tabela service_orders...');
  const { data: os, error: osError } = await supabase.from('service_orders').select('*');
  if (osError) {
    console.log('   ❌ ERRO:', osError.message);
  } else {
    console.log(`   ✅ OK - ${os?.length || 0} ordens de serviço encontradas`);
    if (os && os.length > 0) {
      console.log('   Primeira OS:', JSON.stringify(os[0], null, 2));
    }
  }

  console.log('\n6. Testando tabela settings...');
  const { data: settings, error: setError } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (setError) {
    console.log('   ❌ ERRO:', setError.message);
  } else {
    console.log('   ✅ OK - Settings encontrado');
    console.log('   Dados:', settings);
  }

  console.log('\n=== Teste concluído ===');
}

testConnection().catch(console.error);
