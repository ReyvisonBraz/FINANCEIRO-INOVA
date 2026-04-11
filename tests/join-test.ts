import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnttsthsefrqlhzssqzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudHRzdGhzZWZycWxoenNzcXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODA0MTgsImV4cCI6MjA5MTM1NjQxOH0.sfxIQIFOgulJ7sTPqtC6u0A7WB1MP9dOLpSeVVYyhvU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJoins() {
  console.log('=== Testando JOINs do Supabase ===\n');

  console.log('1. Testando audit_logs com JOIN em profiles...');
  const { data: auditWithJoin, error: auditError } = await supabase
    .from('audit_logs')
    .select('*, profiles(name)')
    .order('timestamp', { ascending: false })
    .limit(5);
  
  if (auditError) {
    console.log('   ❌ ERRO:', auditError.message);
    console.log('   Código:', auditError.code);
  } else {
    console.log(`   ✅ OK - ${auditWithJoin?.length || 0} registros`);
    console.log('   Dados:', JSON.stringify(auditWithJoin, null, 2));
  }

  console.log('\n2. Testando service_orders com JOIN em customers...');
  const { data: osWithJoin, error: osError } = await supabase
    .from('service_orders')
    .select('*, customers(first_name, last_name, phone)')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (osError) {
    console.log('   ❌ ERRO:', osError.message);
    console.log('   Código:', osError.code);
  } else {
    console.log(`   ✅ OK - ${osWithJoin?.length || 0} registros`);
    if (osWithJoin && osWithJoin.length > 0) {
      console.log('   Dados:', JSON.stringify(osWithJoin[0], null, 2));
    }
  }

  console.log('\n3. Testando customers com search ilike...');
  const { data: customersSearch, error: custSearchError } = await supabase
    .from('customers')
    .select('*')
    .or(`first_name.ilike.%rey%,last_name.ilike.%rey%`)
    .limit(5);
  
  if (custSearchError) {
    console.log('   ❌ ERRO:', custSearchError.message);
  } else {
    console.log(`   ✅ OK - ${customersSearch?.length || 0} clientes`);
  }

  console.log('\n4. Testando service_orders com search...');
  const { data: osSearch, error: osSearchError } = await supabase
    .from('service_orders')
    .select('*')
    .or(`id.ilike.%4%`)
    .limit(5);
  
  if (osSearchError) {
    console.log('   ❌ ERRO:', osSearchError.message);
  } else {
    console.log(`   ✅ OK - ${osSearch?.length || 0} OS`);
  }

  console.log('\n=== Conclusão ===');
}

testJoins().catch(console.error);
