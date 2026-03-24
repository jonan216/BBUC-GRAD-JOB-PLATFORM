const express = require('express');
const supabase = require('../supabase');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Graduate applies for a job
router.post('/', authenticate, requireRole('graduate'), async (req, res) => {
  const { jobId } = req.body;

  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) return res.status(404).json({ error: 'Job not found' });

    // Prevent duplicate applications
    const { data: existing, error: existError } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('graduate_id', req.user.id)
      .single();

    if (existing) return res.status(400).json({ error: 'You have already applied for this job' });

    // Get graduate details
    const { data: graduate, error: gradError } = await supabase
      .from('graduates')
      .select('full_name')
      .eq('graduate_id', req.user.id)
      .single();

    const application = {
      id: Date.now().toString(),
      job_id: jobId,
      graduate_id: req.user.id,
      employer_id: job.employer_id,
      graduate_name: graduate ? graduate.full_name : 'Unknown',
      job_title: job.title,
      company_name: job.company_name,
      status: 'applied'
    };

    const { error: insertError } = await supabase.from('applications').insert([application]);
    if (insertError) throw insertError;

    res.status(201).json(application);
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get graduate's applications
router.get('/me', authenticate, requireRole('graduate'), async (req, res) => {
  try {
    const { data: apps, error } = await supabase
      .from('applications')
      .select('*, jobs(*)')
      .eq('graduate_id', req.user.id);
    
    if (error) throw error;
    
    // Flatten the result for backward compatibility if needed, though Supabase returns nested objects
    const enrichedApps = (apps || []).map(app => ({
      ...app,
      job: app.jobs
    }));
    
    res.json(enrichedApps);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Employer gets applications for all their posted jobs
router.get('/employer', authenticate, requireRole('employer'), async (req, res) => {
  try {
    const { data: apps, error } = await supabase
      .from('applications')
      .select('*, graduates(cv_url)')
      .eq('employer_id', req.user.id);
    
    if (error) throw error;
    
    const enrichedApps = (apps || []).map(app => ({
      ...app,
      cv_url: app.graduates ? app.graduates.cv_url : null
    }));
    
    res.json(enrichedApps);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update application status (Employer or Admin)
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  if (!['applied', 'shortlisted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // Check ownership or admin
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('employer_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !application) return res.status(404).json({ error: 'Application not found' });
    
    if (req.user.role !== 'admin' && application.employer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
