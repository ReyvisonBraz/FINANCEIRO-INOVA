import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnttsthsefrqlhzssqzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudHRzdGhzZWZycWxoenNzcXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODA0MTgsImV4cCI6MjA5MTM1NjQxOH0.sfxIQIFOgulJ7sTPqtC6u0A7WB1MP9dOLpSeVVYyhvU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateBrowser() {
  console.log('=== Simulando fluxo completo do Browser ===\n');

  console.log('1. Restaurando sessão (getSession)...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('   ❌ Erro ao restaurar sessão:', sessionError.message);
  } else if (session?.user) {
    console.log('   ✅ Sessão restaurada - User ID:', session.user.id);
  } else {
    console.log('   ℹ️ Nenhuma sessão encontrada (usuário não logado)');
  }

  console.log('\n2. Simulando login (signInWithPassword)...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'littlefigther50@gmail.com',
    password: '040998Rr#'
  });

  if (authError) {
    console.log('   ❌ Erro no login:', authError.message);
    return;
  }

  console.log('   ✅ Login realizado!');
  console.log('   User ID:', authData.user.id);
  console.log('   Email:', authData.user.email);

  console.log('\n3. Buscando profile do usuário...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.log('   ❌ Erro ao buscar profile:', profileError.message);
    console.log('   Código:', profileError.code);
  } else {
    console.log('   ✅ Profile encontrado:', profile.name);
  }

  console.log('\n4. Simulando fetchUsers (buscar todos os perfis)...');
  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true });

  if (profilesError) {
    console.log('   ❌ Erro ao buscar profiles:', profilesError.message);
    console.log('   Código:', profilesError.code);
  } else {
    console.log('   ✅ Profiles encontrados:', allProfiles?.length || 0);
  }

  console.log('\n5. Simulando fetchAuditLogs...');
  const { data: auditLogs, error: auditError } = await supabase
    .from('audit_logs')
    .select('*, profiles(name)')
    .order('timestamp', { ascending: false })
    .limit(100);

  if (auditError) {
    console.log('   ❌ Erro ao buscar audit logs:', auditError.message);
    console.log('   Código:', auditError.code);
    console.log('   Detalhes:', JSON.stringify(auditError));
  } else {
    console.log('   ✅ Audit logs encontrados:', auditLogs?.length || 0);
  }

  console.log('\n6. Simulando fetchCustomers...');
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .select('*')
    .order('first_name', { ascending: true })
    .range(0, 19);

  if (custError) {
    console.log('   ❌ Erro ao buscar customers:', custError.message);
  } else {
    console.log('   ✅ Customers encontrados:', customers?.length || 0);
  }

  console.log('\n=== Conclusão ===');
  console.log('Se todos os testes passaram, o problema está no código React, não no Supabase.');
  console.log('Se houve ERRO, o problema está na conexão ou RLS do Supabase.');
}

simulateBrowser().catch(console.error);
