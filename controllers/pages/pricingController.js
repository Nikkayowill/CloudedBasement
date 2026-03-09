const pool = require('../../db');

// JSON API handler — used by GET /api/pricing/status from the React Pricing page
exports.getPricingStatus = async (req, res) => {
  const isLoggedIn = !!req.session.userId;
  let trialUsed = false;

  if (isLoggedIn) {
    try {
      const result = await pool.query('SELECT trial_used FROM users WHERE id = $1', [req.session.userId]);
      if (result.rows.length > 0) trialUsed = result.rows[0].trial_used;
    } catch (err) {
      console.error('Error checking trial status:', err);
    }
  }

  res.json({ isLoggedIn, trialUsed });
};
