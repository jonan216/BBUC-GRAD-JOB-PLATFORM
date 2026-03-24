const express = require('express');
const supabase = require('../supabase');

const router = express.Router();

// Get public statistics for landing page
router.get('/stats', async (req, res) => {
  try {
    const [
      { count: totalGraduates },
      { count: totalEmployers },
      { count: totalJobs }
    ] = await Promise.all([
      supabase.from('graduates').select('*', { count: 'exact', head: true }),
      supabase.from('employers').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).or('status.eq.approved,status.eq.active')
    ]);

    // Mock placement rate for now, or calculate if data exists
    const statsData = {
      totalGraduates: totalGraduates || 0,
      totalEmployers: totalEmployers || 0,
      totalJobs: totalJobs || 0,
      placementRate: 85, // Default placeholder
      hiredThisMonth: Math.floor((totalGraduates || 0) * 0.1) // Placeholder logic
    };

    res.json(statsData);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// Get latest 3 approved jobs for landing page
router.get('/latest-jobs', async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .or('status.eq.approved,status.eq.active')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;
    res.json(jobs || []);
  } catch (error) {
    console.error('Latest jobs error:', error);
    res.status(500).json({ error: 'Server error fetching latest jobs' });
  }
});

module.exports = router;
