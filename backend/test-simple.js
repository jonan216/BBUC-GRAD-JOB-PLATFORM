const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Sending request...');
supabase.from('admins').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) console.error('❌ Error:', error);
    else console.log('✅ Success:', data);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Catch:', err);
    process.exit(1);
  });

setTimeout(() => {
  console.log('⏳ Timeout reached (30s)');
  process.exit(1);
}, 30000);
