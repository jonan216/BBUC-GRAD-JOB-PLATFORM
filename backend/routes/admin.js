const express = require('express');
const { getDb, saveDb } = require('../database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users and jobs for admin overview
router.get('/overview', authenticate, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const graduates = db.graduates.map(g => ({
      id: g.graduate_id, name: g.full_name, email: g.email, phone: g.phone, extra: g.course, details: g.student_number, status: g.status, type: 'graduate'
    }));
    const employers = db.employers.map(e => ({
      id: e.employer_id, name: e.company_name, email: e.email, phone: e.phone, extra: e.industry, details: e.location, status: e.status, type: 'employer'
    }));
    
    // Add jobs to overview
    const jobs = db.jobs.map(j => ({
      id: j.id, title: j.title, company: j.company_name, status: j.status, created_at: j.created_at
    }));
    
    res.json({
      graduates,
      employers,
      jobs,
      all_users: [...graduates, ...employers]
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Legacy route for compatibility if needed
router.get('/users', authenticate, requireRole('admin'), (req, res) => {
  const db = getDb();
  const graduates = db.graduates.map(g => ({
    id: g.graduate_id, name: g.full_name, email: g.email, phone: g.phone, extra: g.course, status: g.status, type: 'graduate'
  }));
  const employers = db.employers.map(e => ({
    id: e.employer_id, name: e.company_name, email: e.email, phone: e.phone, extra: e.industry, status: e.status, type: 'employer'
  }));
  res.json({ graduates, employers, all: [...graduates, ...employers] });
});

router.put('/approve-user/:type/:id', authenticate, requireRole('admin'), (req, res) => {
  const { type, id } = req.params;
  try {
    const db = getDb();
    const list = type === 'employer' ? db.employers : db.graduates;
    const idField = type === 'employer' ? 'employer_id' : 'graduate_id';
    
    const user = list.find(u => u[idField] == id);
    if (user) {
      user.status = 'approved';
      saveDb(db);
      res.json({ message: 'User approved' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/reject-user/:type/:id', authenticate, requireRole('admin'), (req, res) => {
  const { type, id } = req.params;
  try {
    const db = getDb();
    const list = type === 'employer' ? db.employers : db.graduates;
    const idField = type === 'employer' ? 'employer_id' : 'graduate_id';
    
    const user = list.find(u => u[idField] == id);
    if (user) {
      user.status = 'rejected';
      saveDb(db);
      res.json({ message: 'User rejected' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Job Approval
router.put('/approve-job/:id', authenticate, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const job = db.jobs.find(j => j.id == req.params.id);
    if (job) {
      job.status = 'approved';
      saveDb(db);
      res.json({ message: 'Job approved' });
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/reject-job/:id', authenticate, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const job = db.jobs.find(j => j.id == req.params.id);
    if (job) {
      job.status = 'rejected';
      saveDb(db);
      res.json({ message: 'Job rejected' });
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get every single account in the system (for management)
router.get('/users/all', authenticate, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const graduates = db.graduates.map(g => ({
      id: g.graduate_id, name: g.full_name, email: g.email, role: 'graduate', status: g.status, detail: g.student_number || 'N/A'
    }));
    const employers = db.employers.map(e => ({
      id: e.employer_id, name: e.company_name, email: e.email, role: 'employer', status: e.status, detail: e.industry || 'N/A'
    }));
    const admins = db.admins.map(a => ({
      id: a.admin_id, name: a.name, email: a.email, role: 'admin', status: 'active', detail: 'System Admin'
    }));
    
    res.json([...graduates, ...employers, ...admins]);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving all users' });
  }
});

// Delete a user account permanently
router.delete('/delete-user/:type/:id', authenticate, requireRole('admin'), (req, res) => {
  const { type, id } = req.params;
  try {
    const db = getDb();
    let deleted = false;
    
    if (type === 'graduate') {
      const initialLength = db.graduates.length;
      db.graduates = db.graduates.filter(u => u.graduate_id != id);
      deleted = db.graduates.length < initialLength;
    } else if (type === 'employer') {
      const initialLength = db.employers.length;
      db.employers = db.employers.filter(u => u.employer_id != id);
      deleted = db.employers.length < initialLength;
    } else if (type === 'admin') {
      // Prevent deleting the main admin if necessary, or just allow it if it's not the current user
      if (id == req.user.id) {
        return res.status(400).json({ error: 'You cannot delete yourself' });
      }
      const initialLength = db.admins.length;
      db.admins = db.admins.filter(a => a.admin_id != id);
      deleted = db.admins.length < initialLength;
    }

    if (deleted) {
      saveDb(db);
      res.json({ message: 'User account deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

module.exports = router;
