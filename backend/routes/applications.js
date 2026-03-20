const express = require('express');
const { getDb, saveDb } = require('../database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Graduate applies for a job
router.post('/', authenticate, requireRole('graduate'), (req, res) => {
  const db = getDb();
  const { jobId } = req.body;

  const job = db.jobs.find(j => j.id === jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  // Prevent duplicate applications
  const existing = db.applications.find(a => a.job_id === jobId && a.graduate_id === req.user.id);
  if (existing) return res.status(400).json({ error: 'You have already applied for this job' });

  const graduate = db.graduates.find(g => g.graduate_id === req.user.id);

  const application = {
    id: Date.now().toString(),
    job_id: jobId,
    graduate_id: req.user.id,
    employer_id: job.employer_id, // denormalized for easy querying by employer
    graduate_name: graduate ? graduate.full_name : 'Unknown',
    job_title: job.title,
    company_name: job.company_name,
    status: 'applied', // applied, shortlisted, rejected
    applied_at: new Date().toISOString()
  };

  db.applications.push(application);
  saveDb(db);

  res.status(201).json(application);
});

// Get graduate's applications
router.get('/me', authenticate, requireRole('graduate'), (req, res) => {
  const db = getDb();
  const apps = db.applications.filter(a => a.graduate_id === req.user.id);
  // Attach job info
  const enrichedApps = apps.map(app => {
    const job = db.jobs.find(j => j.id === app.job_id);
    return { ...app, job };
  });
  res.json(enrichedApps);
});

// Employer gets applications for all their posted jobs
router.get('/employer', authenticate, requireRole('employer'), (req, res) => {
  const db = getDb();
  const apps = db.applications.filter(a => a.employer_id === req.user.id);
  
  // Enrich with graduate CV if available
  const enrichedApps = apps.map(app => {
    const graduate = db.graduates.find(g => g.graduate_id === app.graduate_id);
    return {
      ...app,
      cv_url: graduate ? graduate.cv_url : null
    };
  });
  
  res.json(enrichedApps);
});

// Update application status (Employer or Admin)
router.patch('/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  if (!['applied', 'shortlisted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = getDb();
  const appIndex = db.applications.findIndex(a => a.id === req.params.id);
  
  if (appIndex === -1) return res.status(404).json({ error: 'Application not found' });
  
  const application = db.applications[appIndex];
  
  // Only the employer who posted the job or admin can change status
  if (req.user.role !== 'admin' && application.employer_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.applications[appIndex].status = status;
  saveDb(db);

  res.json(db.applications[appIndex]);
});

module.exports = router;
