const pool = require('../db');
const { getDashboardHead, getFooter, getScripts, getResponsiveNav, escapeHtml } = require('../src/utils/helpers');
const { getNonce } = require('../src/utils/nonce');
const { createConfirmationCode } = require('../src/utils/emailToken');
const { sendConfirmationEmail } = require('../services/email');

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

exports.showGettingStarted = async (req, res) => {
  // Check payment, email confirmation, and server status
  try {
    const paymentCheck = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [req.session.userId, 'succeeded']
    );
    const hasPaid = paymentCheck.rows.length > 0;
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

    const message = escapeHtml(req.query.message || '');
    const error   = escapeHtml(req.query.error   || '');

    if (typeof req.csrfToken !== 'function') {
      throw new Error('CSRF middleware not configured for gettingStarted route');
    }
    const csrfToken = req.csrfToken();

    const steps = [
      {
        label: 'Confirm your email',
        done: emailConfirmed,
        action: emailConfirmed ? null : `
          <form action="/resend-confirmation" method="POST" style="display:inline">
            <input type="hidden" name="_csrf" value="${csrfToken}">
            <button type="submit" class="dash-btn dash-btn-secondary" style="font-size:0.8125rem;padding:0.375rem 0.875rem;">
              Resend confirmation email
            </button>
          </form>`,
      },
      {
        label: 'Choose a plan &amp; pay',
        done: hasPaid,
        action: hasPaid ? null : `<a href="/pricing" class="dash-btn dash-btn-primary" style="font-size:0.8125rem;padding:0.375rem 0.875rem;">View plans</a>`,
      },
      {
        label: 'Server provisioned',
        done: hasServer,
        action: (!hasPaid) ? null : hasServer ? null : `<a href="/dashboard" class="dash-btn dash-btn-secondary" style="font-size:0.8125rem;padding:0.375rem 0.875rem;">Go to dashboard</a>`,
      },
    ];

    const stepHtml = steps.map((step, i) => {
      const icon = step.done
        ? `<svg class="w-5 h-5 flex-shrink-0" style="color:#4ade80" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`
        : `<span style="display:inline-flex;align-items:center;justify-content:center;width:1.25rem;height:1.25rem;border-radius:50%;border:1.5px solid rgba(255,255,255,0.2);font-size:0.6875rem;color:var(--dash-text-muted,#525252);flex-shrink:0">${i + 1}</span>`;
      return `
        <div style="display:flex;align-items:flex-start;gap:0.875rem;padding:1rem 1.25rem;border-bottom:1px solid rgba(255,255,255,0.05)">
          <div style="padding-top:0.0625rem">${icon}</div>
          <div style="flex:1;min-width:0">
            <p style="font-size:0.875rem;font-weight:500;color:${step.done ? 'var(--dash-text-secondary,#a1a1a1)' : 'var(--dash-text-primary,#fafafa)'};text-decoration:${step.done ? 'line-through' : 'none'}">${step.label}</p>
          </div>
          ${step.action ? `<div style="flex-shrink:0">${step.action}</div>` : ''}
        </div>`;
    }).join('');

    const allDone = steps.every(s => s.done);

    res.send(`
${getDashboardHead('Getting Started - Clouded Basement')}
  ${getResponsiveNav(req)}

  <main class="min-h-screen py-16 px-4" style="background:var(--dash-bg-base,#000)">
    <div class="max-w-lg mx-auto">

      <div class="text-center mb-10">
        <h1 class="text-2xl font-semibold mb-2" style="color:var(--dash-text-primary,#fafafa)">
          Getting started
        </h1>
        <p class="text-sm" style="color:var(--dash-text-secondary,#a1a1a1)">
          Signed in as <span style="color:var(--dash-accent,#3b82f6)">${userEmail}</span>
        </p>
      </div>

      ${message ? `<div class="mb-5 px-4 py-3 rounded-lg text-sm" style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#86efac">${message}</div>` : ''}
      ${error   ? `<div class="mb-5 px-4 py-3 rounded-lg text-sm" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#fca5a5">${error}</div>`   : ''}

      <div class="dash-card" style="overflow:hidden">
        ${stepHtml}
        ${allDone ? `
        <div style="padding:1.25rem;text-align:center">
          <a href="/dashboard" class="dash-btn dash-btn-primary">Go to your dashboard →</a>
        </div>` : ''}
      </div>

    </div>
  </main>

  ${getFooter()}
  ${getScripts('nav.js')}
`);
      } catch (err) {
        console.error('[GETTING STARTED PAGE] Error:', err);
        res.redirect('/dashboard?error=Failed to load getting started page');
      }
    };
