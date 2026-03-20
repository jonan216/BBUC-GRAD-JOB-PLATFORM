const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

const defaultDb = {
  admins: [],
  employers: [],
  graduates: [],
  jobs: [],
  applications: []
};

function getDb() {
  if (!fs.existsSync(dbPath)) {
    saveDb(defaultDb);
    return defaultDb;
  }
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading DB, returning default:', e.message);
    return defaultDb;
  }
}

function saveDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function initDb() {
  if (!fs.existsSync(dbPath)) {
    saveDb(defaultDb);
    console.log('Database initialized as JSON');
  }
}

module.exports = { getDb, saveDb, initDb };
