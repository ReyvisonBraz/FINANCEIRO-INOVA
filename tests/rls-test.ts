import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnttsthsefrqlhzssqzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudHRzdGhzZWZycWxoenNzcXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODA0MTgsImV4cCI6MjA5MTM1NjQxOH0.sfxIQIFOgulJ7sTPqtC6u0A7WB1MP9dOLpSeVVYyhvU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
  console.log('=== Testando RLS no Browser ===\n');

  // Simular o que acontece no browser - primeiro verificar a sessão
  console.log('1. Verificando sessão atual...');
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('   Sessão:', sessionData?.session ? 'Logado' : 'Não logado');
  
  if (sessionData?.session) {
    console.log('   User ID:', sessionData.session.user.id);
  }

  console.log('\n2. Testando select em profiles (com anon key)...');
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('*');
  console.log('   Resultado:', profError ? `ERRO: ${profError.message}` : `OK - ${profiles?.length || 0} perfis`);

  console.log('\n3. Testando select em customers (com anon key)...');
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .select('*')
    .limit(10);
  console.log('   Resultado:', custError ? `ERRO: ${custError.message}` : `OK - ${customers?.length || 0} clientes`);

  console.log('\n4. Testando select em service_orders (com anon key)...');
  const { data: os, error: osError } = await supabase
    .from('service_orders')
    .select('*')
    .limit(10);
  console.log('   Resultado:', osError ? `ERRO: ${osError.message}` : `OK - ${os?.length || 0} OS`);

  console.log('\n5. Testando select em categories (com anon key)...');
  const { data: cats, error: catsError } = await supabase
    .from('categories')
    .select('*');
  console.log('   Resultado:', catsError ? `ERRO: ${catsError.message}` : `OK - ${cats?.length || 0} categorias`);

  console.log('\n6. Testando select em settings (com anon key)...');
  const { data: settings, error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
  console.log('   Resultado:', settingsError ? `ERRO: ${settingsError.message}` : `OK`);

  console.log('\n7. Inserindo um log de teste na auditoria...');
  const { data: insertData, error: insertError } = await supabase
    .from('audit_logs')
    .insert({
      user_id: sessionData?.session?.user?.id || 'test-user-id',
      action: 'Teste de Inserção',
      entity: 'test',
      details: 'Este é um teste de inserção'
    })
    .select()
    .single();
  
  if (insertError) {
    console.log('   ❌ ERRO ao inserir:', insertError.message);
    console.log('   Código:', insertError.code);
  } else {
    console.log('   ✅ Inserido com sucesso:', insertData);
  }

  console.log('\n8. Verificando se o log foi inserido...');
  const { data: logs, error: logsError } = await supabase
    .from('audit_logs')
    .select('*');
  console.log('   Resultado:', logsError ? `ERRO: ${logsError.message}` : `OK - ${logs?.length || 0} logs`);

  console.log('\n=== Conclusão ===');
  console.log('Se você vê ERROs acima, o problema é de RLS.');
  console.log('Verifique as políticas em: Supabase > Database > Replication > RLS');
}

testRLS().catch(console.error);
