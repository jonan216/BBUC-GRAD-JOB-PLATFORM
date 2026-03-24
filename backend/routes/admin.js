const express = require('express');
const supabase = require('../supabase');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users and jobs for admin overview
router.get('/overview', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [
      { data: graduatesRaw },
      { data: employersRaw },
      { data: jobsRaw }
    ] = await Promise.all([
      supabase.from('graduates').select('*'),
      supabase.from('employers').select('*'),
      supabase.from('jobs').select('*')
    ]);

    const graduates = (graduatesRaw || []).map(g => ({
      id: g.graduate_id, name: g.full_name, email: g.email, phone: g.phone, extra: g.course, details: g.student_number, status: g.status, type: 'graduate'
    }));
    const employers = (employersRaw || []).map(e => ({
      id: e.employer_id, name: e.company_name, email: e.email, phone: e.phone, extra: e.industry, details: e.location, status: e.status, type: 'employer'
    }));
    const jobs = (jobsRaw || []).map(j => ({
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
router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [
      { data: graduatesRaw },
      { data: employersRaw }
    ] = await Promise.all([
      supabase.from('graduates').select('*'),
      supabase.from('employers').select('*')
    ]);

    const graduates = (graduatesRaw || []).map(g => ({
      id: g.graduate_id, name: g.full_name, email: g.email, phone: g.phone, extra: g.course, status: g.status, type: 'graduate'
    }));
    const employers = (employersRaw || []).map(e => ({
      id: e.employer_id, name: e.company_name, email: e.email, phone: e.phone, extra: e.industry, status: e.status, type: 'employer'
    }));
    res.json({ graduates, employers, all: [...graduates, ...employers] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/approve-user/:type/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { type, id } = req.params;
  try {
    const table = type === 'employer' ? 'employers' : 'graduates';
    const idField = type === 'employer' ? 'employer_id' : 'graduate_id';
    
    const { error } = await supabase.from(table).update({ status: 'approved' }).eq(idField, id);
    if (error) throw error;
    res.json({ message: 'User approved' });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/reject-user/:type/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { type, id } = req.params;
  try {
    const table = type === 'employer' ? 'employers' : 'graduates';
    const idField = type === 'employer' ? 'employer_id' : 'graduate_id';
    
    const { error } = await supabase.from(table).update({ status: 'rejected' }).eq(idField, id);
    if (error) throw error;
    res.json({ message: 'User rejected' });
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Job Approval
router.put('/approve-job/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase.from('jobs').update({ status: 'approved' }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Job approved' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/reject-job/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase.from('jobs').update({ status: 'rejected' }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Job rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get every single account in the system (for management)
router.get('/users/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [
      { data: graduatesRaw },
      { data: employersRaw },
      { data: adminsRaw }
    ] = await Promise.all([
      supabase.from('graduates').select('*'),
      supabase.from('employers').select('*'),
      supabase.from('admins').select('*')
    ]);

    const graduates = (graduatesRaw || []).map(g => ({
      id: g.graduate_id, name: g.full_name, email: g.email, role: 'graduate', status: g.status, detail: g.student_number || 'N/A'
    }));
    const employers = (employersRaw || []).map(e => ({
      id: e.employer_id, name: e.company_name, email: e.email, role: 'employer', status: e.status, detail: e.industry || 'N/A'
    }));
    const admins = (adminsRaw || []).map(a => ({
      id: a.admin_id, name: a.name, email: a.email, role: 'admin', status: 'active', detail: 'System Admin'
    }));
    
    res.json([...graduates, ...employers, ...admins]);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving all users' });
  }
});

// Delete a user account permanently
router.delete('/delete-user/:type/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === 'admin' && id == req.user.id) {
      return res.status(400).json({ error: 'You cannot delete yourself' });
    }

    const table = type === 'graduate' ? 'graduates' : (type === 'employer' ? 'employers' : 'admins');
    const idField = type === 'graduate' ? 'graduate_id' : (type === 'employer' ? 'employer_id' : 'admin_id');
    
    const { error } = await supabase.from(table).delete().eq(idField, id);
    if (error) throw error;

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

module.exports = router;
