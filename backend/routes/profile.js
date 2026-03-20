const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  const db = getDb();
  let user = null;

  if (req.user.role === 'graduate') {
    user = db.graduates.find(g => g.graduate_id === req.user.id);
    if (user && !user.skills) user.skills = ['Communication', 'Teamwork', 'Problem Solving']; // Defaults if missing
  } else if (req.user.role === 'employer') {
    user = db.employers.find(e => e.employer_id === req.user.id);
  } else if (req.user.role === 'admin') {
    user = db.admins.find(a => a.admin_id === req.user.id || a.email === req.user.email);
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Obscure password
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// Configure multer for CV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory exists relative to the backend folder
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, and PowerPoint files are allowed!'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/cv', authenticate, upload.single('cv'), (req, res) => {
  if (req.user.role !== 'graduate') {
    return res.status(403).json({ error: 'Only graduates can upload CVs' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const db = getDb();
  const index = db.graduates.findIndex(g => g.graduate_id === req.user.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Graduate profile not found' });
  }

  // Save the relative path
  db.graduates[index].cv_url = `/uploads/${req.file.filename}`;
  saveDb(db);

  res.json({ 
    message: 'CV uploaded successfully', 
    cv_url: db.graduates[index].cv_url 
  });
});

module.exports = router;
