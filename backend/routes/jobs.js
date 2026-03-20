const express = require('express');
const { getDb, saveDb } = require('../database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all approved jobs (Graduates)
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  // Usually, jobs should be approved by admin. We return approved ones.
  const activeJobs = db.jobs.filter(j => j.status === 'approved' || j.status === 'active');
  res.json(activeJobs);
});

// Get jobs created by employer
router.get('/me', authenticate, requireRole('employer'), (req, res) => {
  const db = getDb();
  const employerJobs = db.jobs.filter(j => j.employer_id === req.user.id);
  res.json(employerJobs);
});

// Post a new job (Employer)
router.post('/', authenticate, requireRole('employer'), (req, res) => {
  const db = getDb();
  const { title, description, location, salary, requirements } = req.body;
  
  const employer = db.employers.find(e => e.employer_id === req.user.id);

  const newJob = {
    id: Date.now().toString(),
    employer_id: req.user.id,
    company_name: employer ? employer.company_name : 'Unknown',
    title,
    description,
    location,
    salary,
    requirements: requirements ? requirements.split(',').map(r => r.trim()).filter(Boolean) : [],
    status: 'pending', // Requires admin approval
    created_at: new Date().toISOString()
  };

  db.jobs.push(newJob);
  saveDb(db);

  res.status(201).json(newJob);
});

module.exports = router;
