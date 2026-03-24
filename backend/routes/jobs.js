const express = require('express');
const supabase = require('../supabase');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all approved jobs (Graduates)
router.get('/', authenticate, async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .or('status.eq.approved,status.eq.active');
    
    if (error) throw error;
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get jobs created by employer
router.get('/me', authenticate, requireRole('employer'), async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', req.user.id);
    
    if (error) throw error;
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Post a new job (Employer)
router.post('/', authenticate, requireRole('employer'), async (req, res) => {
  const { title, description, location, salary, requirements } = req.body;
  
  try {
    const { data: employer, error: empError } = await supabase
      .from('employers')
      .select('company_name')
      .eq('employer_id', req.user.id)
      .single();

    if (empError && empError.code !== 'PGRST116') throw empError;

    const newJob = {
      id: Date.now().toString(),
      employer_id: req.user.id,
      company_name: employer ? employer.company_name : 'Unknown',
      title,
      description,
      location,
      salary,
      requirements: requirements ? requirements.split(',').map(r => r.trim()).filter(Boolean) : [],
      status: 'pending'
    };

    const { error: insertError } = await supabase.from('jobs').insert([newJob]);
    if (insertError) throw insertError;

    res.status(201).json(newJob);
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
