const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

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
    // Search in all three tables
    let { data: user, error: adminError } = await supabase.from('admins').select('*').eq('email', email).single();
    let type = 'admin';

    if (!user) {
      const { data: employer, error: empError } = await supabase.from('employers').select('*').eq('email', email).single();
      user = employer;
      type = 'employer';
    }
    
    if (!user) {
      const { data: graduate, error: gradError } = await supabase.from('graduates').select('*').eq('email', email).single();
      user = graduate;
      type = 'graduate';
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Bcrypt comparison
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
    // Uniqueness check across all tables
    const { data: adminCheck } = await supabase.from('admins').select('email').eq('email', email);
    const { data: employerCheck } = await supabase.from('employers').select('email').eq('email', email);
    const { data: graduateCheck } = await supabase.from('graduates').select('email').eq('email', email);

    if (adminCheck?.length || employerCheck?.length || graduateCheck?.length) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (type === 'graduate') {
      const { error } = await supabase.from('graduates').insert([{
        graduate_id: Date.now(),
        student_number, full_name: name, email, phone, course, password: hashedPassword, status: 'pending'
      }]);
      if (error) throw error;
    } else if (type === 'employer') {
      const { error } = await supabase.from('employers').insert([{
        employer_id: Date.now(),
        company_name, industry, email, phone, location, password: hashedPassword, status: 'pending'
      }]);
      if (error) throw error;
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    res.status(201).json({ message: 'Registration successful. Waiting for admin approval.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Could not register user.' });
  }
});

module.exports = router;
