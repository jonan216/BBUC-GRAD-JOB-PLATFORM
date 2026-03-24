const supabase = require('./supabase');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const email = 'akampurirajonan06@gmail.com';
  const password = 'Jonan@1973';
  const name = 'System Administrator';
  const role = 'admin';

  console.log('--- Seeding Admin ---');
  console.log('Checking for existing admin:', email);

  try {
    const { data: existingAdmin, error: fetchError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching admin:', fetchError.message);
      return;
    }
    
    if (!existingAdmin) {
      console.log('Admin not found, creating new admin account...');
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = {
        admin_id: Date.now(),
        name,
        email,
        password: hashedPassword,
        role
      };
      
      const { error: insertError } = await supabase.from('admins').insert([newAdmin]);
      if (insertError) {
        console.error('❌ Error inserting admin:', insertError.message);
        return;
      }
      
      console.log(`✅ Default admin account seeded successfully: ${email}`);
    } else {
      console.log(`ℹ️ Admin account already exists: ${email}`);
    }
  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error);
  }
}

if (require.main === module) {
  seedAdmin().catch(console.error);
}

module.exports = seedAdmin;
