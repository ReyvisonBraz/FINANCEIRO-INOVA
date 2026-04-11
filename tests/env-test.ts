// Test to verify if environment variables are loaded correctly
const VITE_SUPABASE_URL = 'https://lnttsthsefrqlhzssqzs.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudHRzdGhzZWZycWxoenNzcXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODA0MTgsImV4cCI6MjA5MTM1NjQxOH0.sfxIQIFOgulJ7sTPqtC6u0A7WB1MP9dOLpSeVVYyhvU';

console.log('Environment check:');
console.log('VITE_SUPABASE_URL:', VITE_SUPABASE_URL ? '✅ Defined' : '❌ Undefined');
console.log('VITE_SUPABASE_ANON_KEY:', VITE_SUPABASE_ANON_KEY ? '✅ Defined' : '❌ Undefined');

// Now test with createClient
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log('\nTesting Supabase client...');
  
  // Test 1: Get session (should be null initially)
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('Session:', sessionData?.session ? 'Logged in' : 'Not logged in');

  // Test 2: Query profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profilesError) {
    console.log('❌ Profiles error:', profilesError.message);
  } else {
    console.log('✅ Profiles query OK, count:', profiles?.length);
  }

  // Test 3: Query audit_logs
  const { data: logs, error: logsError } = await supabase
    .from('audit_logs')
    .select('*, profiles(name)')
    .order('timestamp', { ascending: false })
    .limit(5);
  
  if (logsError) {
    console.log('❌ Audit logs error:', logsError.message);
    console.log('   Code:', logsError.code);
    console.log('   Details:', JSON.stringify(logsError));
  } else {
    console.log('✅ Audit logs query OK, count:', logs?.length);
  }

  console.log('\n=== All tests completed ===');
}

test().catch(console.error);
