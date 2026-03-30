const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    let table = '';
    let idField = '';
    
    if (req.user.role === 'graduate') {
      table = 'graduates';
      idField = 'graduate_id';
    } else if (req.user.role === 'employer') {
      table = 'employers';
      idField = 'employer_id';
    } else if (req.user.role === 'admin') {
      table = 'admins';
      idField = 'admin_id';
    }

    const { data: user, error } = await supabase
      .from(table)
      .select('*')
      .eq(idField, req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.role === 'graduate' && !user.skills) {
      user.skills = ['Communication', 'Teamwork', 'Problem Solving'];
    }

    // Obscure password
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Configure multer for CV uploads (using memory storage)
const storage = multer.memoryStorage();

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

router.post('/cv', authenticate, upload.single('cv'), async (req, res) => {
  if (req.user.role !== 'graduate') {
    return res.status(403).json({ error: 'Only graduates can upload CVs' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const file = req.file;
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `cv-${req.user.id}-${Date.now()}${fileExt}`;

    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase Storage Error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file to storage' });
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cvs')
      .getPublicUrl(fileName);

    // 3. Update graduate profile in database
    const { error: updateError } = await supabase
      .from('graduates')
      .update({ cv_url: publicUrl })
      .eq('graduate_id', req.user.id);

    if (updateError) throw updateError;

    res.json({ 
      message: 'CV uploaded successfully', 
      cv_url: publicUrl 
    });
  } catch (error) {
    console.error('CV Upload Error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;
