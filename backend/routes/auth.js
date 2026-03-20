const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, saveDb } = require('../database');

const { body, validationResult } = require('express-validator');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
], async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = getDb();
    
    let user = db.admins.find(u => u.email === email);
    let type = 'admin';

    if (!user) {
      user = db.employers.find(u => u.email === email);
      type = 'employer';
    }
    
    if (!user) {
      user = db.graduates.find(u => u.email === email);
      type = 'graduate';
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Support both hashed and legacy plaintext passwords during transition
    let isMatch = false;
    if (user.password && user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if ((type === 'employer' || type === 'graduate') && user.status !== 'approved') {
      return res.status(403).json({ error: 'Account is pending verification or rejected. Please wait for an admin to approve you.' });
    }

    const token = jwt.sign({ id: user[`${type}_id`], role: type, email }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user[`${type}_id`],
        name: user.name || user.full_name || user.company_name,
        email: user.email,
        role: type
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/register/:type', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').optional().notEmpty().trim(),
  body('phone').optional().notEmpty().trim(),
  validate
], async (req, res) => {
  const { type } = req.params;
  const { email, password, name, phone, course, student_number, company_name, industry, location } = req.body;
  
  try {
    const db = getDb();
    
    // Simple uniqueness check
    if (db.graduates.some(u => u.email === email) || db.employers.some(u => u.email === email) || db.admins.some(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (type === 'graduate') {
      db.graduates.push({
        graduate_id: Date.now(),
        student_number, full_name: name, email, phone, course, password: hashedPassword, status: 'pending', created_at: new Date().toISOString()
      });
    } else if (type === 'employer') {
      db.employers.push({
        employer_id: Date.now(),
        company_name, industry, email, phone, location, password: hashedPassword, status: 'pending'
      });
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    saveDb(db);
    res.status(201).json({ message: 'Registration successful. Waiting for admin approval.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Could not register user.' });
  }
});

module.exports = router;
