const supabase = require('./supabase');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testConnection() {
  console.log('--- Diagnostics ---');
  console.log('CWD:', process.cwd());
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('Anon Key (first 10 chars):', process.env.SUPABASE_ANON_KEY?.substring(0, 10));
  console.log('-------------------');

  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('admins').select('*').limit(1);
    if (error) {
      console.error('❌ Supabase error:', error);
    } else {
      console.log('✅ Supabase connection successful!', data);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
