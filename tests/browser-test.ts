import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnttsthsefrqlhzssqzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudHRzdGhzZWZycWxoenNzcXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODA0MTgsImV4cCI6MjA5MTM1NjQxOH0.sfxIQIFOgulJ7sTPqtC6u0A7WB1MP9dOLpSeVVYyhvU';

const supabaseAnon = createClient(supabaseUrl, supabaseKey);

async function testBrowserScenario() {
  console.log('=== Simulando cenário do Browser ===\n');

  console.log('1. Testando SELECT em customers (sem autenticação)...');
  const { data: customers, error: custError } = await supabaseAnon
    .from('customers')
    .select('*')
    .order('first_name', { ascending: true })
    .range(0, 19);
  
  if (custError) {
    console.log('   ❌ ERRO:', custError.message);
    console.log('   Detalhes:', JSON.stringify(custError, null, 2));
  } else {
    console.log(`   ✅ OK - ${customers?.length || 0} clientes`);
    if (customers && customers.length > 0) {
      console.log('   Primeiro cliente:', JSON.stringify(customers[0], null, 2));
    }
  }

  console.log('\n2. Testando SELECT em profiles (sem autenticação)...');
  const { data: profiles, error: profError } = await supabaseAnon
    .from('profiles')
    .select('*')
    .order('name', { ascending: true });
  
  if (profError) {
    console.log('   ❌ ERRO:', profError.message);
    console.log('   Detalhes:', JSON.stringify(profError, null, 2));
  } else {
    console.log(`   ✅ OK - ${profiles?.length || 0} perfis`);
    if (profiles && profiles.length > 0) {
      console.log('   Primeiro perfil:', JSON.stringify(profiles[0], null, 2));
    }
  }

  console.log('\n3. Testando SELECT em audit_logs (sem autenticação)...');
  const { data: auditLogs, error: auditError } = await supabaseAnon
    .from('audit_logs')
    .select('*, userName:profiles(name)')
    .order('timestamp', { ascending: false })
    .limit(100);
  
  if (auditError) {
    console.log('   ❌ ERRO:', auditError.message);
    console.log('   Código do erro:', auditError.code);
    console.log('   Detalhes:', JSON.stringify(auditError, null, 2));
  } else {
    console.log(`   ✅ OK - ${auditLogs?.length || 0} logs`);
  }

  console.log('\n4. Testando RLS - Verificando políticas...');
  
  console.log('\n5. Testando transação com JOIN em service_orders...');
  const { data: os, error: osError } = await supabaseAnon
    .from('service_orders')
    .select('*, customer:first_name, last_name, phone')
    .order('created_at', { ascending: false })
    .range(0, 19);
  
  if (osError) {
    console.log('   ❌ ERRO:', osError.message);
  } else {
    console.log(`   ✅ OK - ${os?.length || 0} OS`);
    if (os && os.length > 0) {
      console.log('   Primeira OS:', JSON.stringify(os[0], null, 2));
    }
  }

  console.log('\n=== Verificando se as colunas existem ===');
  
  console.log('\n6. Verificando estrutura da tabela profiles...');
  const { data: profileSample, error: profileSampleError } = await supabaseAnon
    .from('profiles')
    .select('*')
    .limit(1);
  
  if (profileSampleError) {
    console.log('   ❌ ERRO:', profileSampleError.message);
  } else if (profileSample && profileSample.length > 0) {
    console.log('   Colunas disponíveis:', Object.keys(profileSample[0]).join(', '));
  }

  console.log('\n7. Verificando estrutura da tabela audit_logs...');
  const { data: auditSample, error: auditSampleError } = await supabaseAnon
    .from('audit_logs')
    .select('*')
    .limit(1);
  
  if (auditSampleError) {
    console.log('   ❌ ERRO:', auditSampleError.message);
  } else if (auditSample && auditSample.length > 0) {
    console.log('   Colunas disponíveis:', Object.keys(auditSample[0]).join(', '));
  } else {
    console.log('   Tabela vazia - isso pode causar problemas em telas que mostram logs');
  }

  console.log('\n8. Verificando estrutura da tabela customers...');
  const { data: customerSample, error: customerSampleError } = await supabaseAnon
    .from('customers')
    .select('*')
    .limit(1);
  
  if (customerSampleError) {
    console.log('   ❌ ERRO:', customerSampleError.message);
  } else if (customerSample && customerSample.length > 0) {
    console.log('   Colunas disponíveis:', Object.keys(customerSample[0]).join(', '));
  }

  console.log('\n=== Conclusão ===');
  console.log('Se você vê "ERRO" acima, o problema é de RLS ou estrutura das tabelas.');
  console.log('Você precisa verificar no Supabase Dashboard > Table Editor > [tabela] > Policies');
}

testBrowserScenario().catch(console.error);
