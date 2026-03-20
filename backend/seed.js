const { getDb, saveDb, initDb } = require('./database');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  initDb();
  const db = getDb();
  
  const email = 'akampurirajonan06@gmail.com';
  const password = 'Jonan@1973';
  const name = 'System Administrator';
  const role = 'admin';

  const existingAdmin = db.admins.find(a => a.email === email);
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = {
      admin_id: Date.now(),
      name,
      email,
      password: hashedPassword,
      role
    };
    db.admins.push(newAdmin);
    saveDb(db);
    console.log(`✅ Default admin account seeded and hashed: ${email}`);
  } else {
    console.log(`ℹ️ Admin account already exists: ${email}`);
  }
}

if (require.main === module) {
  seedAdmin().catch(console.error);
}

module.exports = seedAdmin;
