// POST /resend-confirmation (secure: uses session userId)
exports.resendConfirmation = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login?error=Session expired. Please log in again.');
    }
    // Look up user email and last_resend_at
    const userResult = await pool.query('SELECT email, email_confirmed, last_resend_at FROM users WHERE id = $1', [userId]);
    if (!userResult.rows[0]) {
      req.session.destroy(() => {
        res.redirect('/login?error=Session expired. Please log in again.');
      });
      return;
    }
    const email = userResult.rows[0].email;
    const emailConfirmed = userResult.rows[0].email_confirmed;
    const lastResendAt = userResult.rows[0].last_resend_at;
    if (emailConfirmed) {
      return res.redirect('/dashboard?message=Your email is already confirmed.');
    }
    // Cooldown: 60 seconds
    const now = new Date();
    if (lastResendAt && (now - lastResendAt) < 60000) {
      const wait = Math.ceil((60000 - (now - lastResendAt)) / 1000);
      return res.redirect(`/getting-started?error=Please wait ${wait}s before resending confirmation email.`);
    }
    // Generate new confirmation code
    const { code, expiresAt } = createConfirmationCode();
    await pool.query('UPDATE users SET email_token = $1, token_expires_at = $2, last_resend_at = $3 WHERE id = $4', [code, expiresAt, now, userId]);
    await sendConfirmationEmail(email, code);
    res.redirect('/getting-started?message=Confirmation email sent! Check your inbox.');
  } catch (err) {
    console.error('[RESEND CONFIRMATION] Error:', err);
    res.redirect('/getting-started?error=Failed to resend confirmation email');
  }
};

const pool = require('../db');
const { getDashboardHead, getFooter, getScripts, getResponsiveNav } = require('../src/utils/helpers');
const { getNonce } = require('../src/utils/nonce');
const { createConfirmationCode } = require('../src/utils/emailToken');
const { sendConfirmationEmail } = require('../services/email');

exports.showGettingStarted = async (req, res) => {
  // Check payment, email confirmation, and server status
  try {
    const paymentCheck = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [req.session.userId, 'succeeded']
    );
    const hasPaid = paymentCheck.rows.length > 0;
    const { escapeHtml } = require('../src/utils/helpers');
    const plan = hasPaid ? paymentCheck.rows[0].plan : null;

    // Get user email and confirmation status
    const userResult = await pool.query(
      'SELECT email, email_confirmed FROM users WHERE id = $1',
      [req.session.userId]
    );
    if (!userResult.rows[0]) {
      // User not found, clear session and redirect to login
      req.session.destroy(() => {
        res.redirect('/login?error=Session expired. Please log in again.');
      });
      return;
    }
        const userEmail = escapeHtml(userResult.rows[0].email);
    const emailConfirmed = userResult.rows[0].email_confirmed;

        const serverCheck = await pool.query(
          "SELECT * FROM servers WHERE user_id = $1 AND status NOT IN ('deleted', 'failed')",
          [req.session.userId]
        );
        const hasServer = serverCheck.rows.length > 0;
    
        // TODO: Render getting-started page with status checks
        // (implementation continues)
      } catch (err) {
        console.error('[GETTING STARTED PAGE] Error:', err);
        res.redirect('/dashboard?error=Failed to load getting started page');
      }
    };
