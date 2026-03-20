require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const seedAdmin = require('./seed');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const jobsRoutes = require('./routes/jobs');
const profileRoutes = require('./routes/profile');
const applicationsRoutes = require('./routes/applications');
const { initDb } = require('./database');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory using an absolute path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/applications', applicationsRoutes);

// Global Error Handler - prevent HTML responses for API errors
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Handle multer specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Max size is 10MB.' });
  }

  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🔄 Initializing database and seeding admin...');
    await initDb();
    await seedAdmin();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 BBUC Backend running on http://0.0.0.0:${PORT}`);
      console.log(`✨ API ready for requests`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
