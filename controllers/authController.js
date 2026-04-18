// 2FA dependencies
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// GET /2fa/setup - Generate TOTP secret and QR code
exports.show2FASetup = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.redirect('/login');
  // Generate secret
  const secret = speakeasy.generateSecret({ name: 'Clouded Basement' });
  // Store temp secret in session (not DB until verified)
  req.session.temp2FASecret = secret.base32;
  // Generate QR code data URL
  const otpauth = secret.otpauth_url;
  const qr = await qrcode.toDataURL(otpauth);
  res.json({ qr, secret: secret.base32 });
};

// POST /2fa/verify - Verify TOTP code and enable 2FA
exports.verify2FASetup = async (req, res) => {
  const userId = req.session.userId;
  const { code } = req.body;
  const tempSecret = req.session.temp2FASecret;
  if (!userId || !tempSecret) return res.status(400).json({ success: false, error: 'No secret in session' });
  const verified = speakeasy.totp.verify({
    secret: tempSecret,
    encoding: 'base32',
    token: code,
    window: 1
  });
  if (!verified) return res.status(400).json({ success: false, error: 'Invalid code' });
  // Save secret to DB and enable 2FA
  await pool.query('UPDATE users SET twofa_enabled = TRUE, twofa_secret = $1 WHERE id = $2', [tempSecret, userId]);
  delete req.session.temp2FASecret;
  res.json({ success: true });
};

// POST /2fa/disable - Disable 2FA for user
exports.disable2FA = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ success: false });
  await pool.query('UPDATE users SET twofa_enabled = FALSE, twofa_secret = NULL WHERE id = $1', [userId]);
  res.json({ success: true });
};

// POST /2fa/verify-login - Verify TOTP code at login
exports.verify2FALogin = async (req, res) => {
  const userId = req.session.pending2FAUserId;
  const { code } = req.body;
  if (!userId) return res.status(400).json({ success: false, error: 'No pending 2FA' });
  const result = await pool.query('SELECT twofa_secret FROM users WHERE id = $1', [userId]);
  const secret = result.rows[0]?.twofa_secret;
  if (!secret) return res.status(400).json({ success: false, error: 'No 2FA secret' });
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: 1
  });
  if (!verified) {
    logSecurityEvent({
      userId,
      eventType: '2FA_FAILED',
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
    }).catch(() => {});
    return res.status(400).json({ success: false, error: 'Invalid code' });
  }
  // Mark session as 2FA-verified
  req.session.userId = userId;
  delete req.session.pending2FAUserId;
  res.json({ success: true });
};
const bcrypt = require('bcrypt');
const path = require('path');
const crypto = require('crypto');
const pool = require('../db');
const { validationResult } = require('express-validator');
const { getHTMLHead, getFooter, getScripts, getResponsiveNav, escapeHtml } = require('../src/utils/helpers');
const { createConfirmationCode, isCodeValid } = require('../src/utils/emailToken');
const { sendConfirmationEmail, sendWelcomeEmail } = require('../services/email');
const { isDisposableEmail } = require('../src/utils/emailValidation');
const { getNonce } = require('../src/utils/nonce');
const { logSecurityEvent, getClientIp } = require('../services/securityLog');

// Valid bcrypt hash used for constant-time comparison when user is not found.
const DUMMY_HASH = bcrypt.hashSync('clouded-basement-dummy-password', 10);

// Helper function to generate random verification code
function generateBotCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars like O, 0, I, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}


// POST /register - Handle registration with email confirmation
const handleRegister = async (req, res) => {
  // Validate bot verification code first
  if (!req.body.botCode || req.body.botCode.toUpperCase() !== req.session.botCode) {
    return res.redirect('/register?error=' + encodeURIComponent('The verification code you entered is incorrect. Bots are not allowed.') +
      (req.body.email ? ('&email=' + encodeURIComponent(req.body.email)) : ''));
  }
  
  // Clear the bot code so it can't be reused
  delete req.session.botCode;
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(' ');
    return res.redirect('/register?error=' + encodeURIComponent(errorMessages) +
      (req.body.email ? ('&email=' + encodeURIComponent(req.body.email)) : ''));
  }

  try {
    const { email, password, acceptTerms } = req.body;
    // Password strength enforcement (backend)
    const zxcvbn = require('zxcvbn');
    const pwStrength = zxcvbn(password);
    if (pwStrength.score < 3) {
      return res.redirect('/register?error=' + encodeURIComponent('Your password is too weak. ' + pwStrength.feedback.suggestions.join(' ')) +
        (email ? ('&email=' + encodeURIComponent(email)) : ''));
    }
    
    // Validate terms acceptance
    if (acceptTerms !== 'on') {
      return res.redirect('/register?error=' + encodeURIComponent('You must accept the Terms of Service to register.') +
        (email ? ('&email=' + encodeURIComponent(email)) : ''));
    }
    
    // Block disposable email addresses
    if (isDisposableEmail(email)) {
      return res.redirect('/register?error=' + encodeURIComponent('Temporary/disposable email addresses are not allowed. Please use a permanent email address.') +
        (email ? ('&email=' + encodeURIComponent(email)) : ''));
    }
    
    // Get client IP address (handles proxy/load balancer)
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;
    
    // Check if this IP has already used a trial in the last 90 days
    const ipTrialCheck = await pool.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE signup_ip = $1 
       AND trial_used = true 
       AND trial_used_at > NOW() - INTERVAL '90 days'`,
      [clientIp]
    );
    
    const ipHasUsedTrial = parseInt(ipTrialCheck.rows[0].count) > 0;
    
    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.redirect('/register?error=' + encodeURIComponent('Email already registered. Please log in.') +
        (email ? ('&email=' + encodeURIComponent(email)) : ''));
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate 6-digit confirmation code
    const { code, expiresAt } = createConfirmationCode();
    
    // Get browser fingerprint (for trial abuse prevention)
    // Validate fingerprint format: must be 64-char hex string (SHA-256) or null
    let fingerprint = req.body.fingerprint || null;
    if (fingerprint) {
      fingerprint = String(fingerprint).trim();
      // Reject if not valid 64-char hex (SHA-256 output)
      if (!/^[a-f0-9]{64}$/i.test(fingerprint)) {
        fingerprint = null; // Invalid format, treat as no fingerprint
      }
    }
    
    // Check if this fingerprint has already used a trial (VPN bypass prevention)
    let fingerprintHasUsedTrial = false;
    if (fingerprint) {
      const fpTrialCheck = await pool.query(
        `SELECT COUNT(*) as count FROM users 
         WHERE browser_fingerprint = $1 
         AND trial_used = true 
         AND trial_used_at > NOW() - INTERVAL '90 days'`,
        [fingerprint]
      );
      fingerprintHasUsedTrial = parseInt(fpTrialCheck.rows[0].count) > 0;
    }
    
    // Insert user with code, terms acceptance, signup IP, and fingerprint
    await pool.query(
      `INSERT INTO users (email, password_hash, email_token, token_expires_at, terms_accepted_at, signup_ip, trial_used, browser_fingerprint) 
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)`,
      [email, passwordHash, code, expiresAt, clientIp, ipHasUsedTrial || fingerprintHasUsedTrial, fingerprint]
    );

    // Send confirmation email with code (non-blocking)
    sendConfirmationEmail(email, code).catch(err => {
      console.error('Failed to send confirmation email:', err);
    });
    
    // Get the new user ID
    const newUser = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);
    
    // Create session immediately (allow access without confirmation)
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.redirect('/login?error=Registration successful. Please login.');
      }
      
      req.session.userId = newUser.rows[0].id;
      req.session.userEmail = email;
      req.session.userRole = newUser.rows[0].role;
      req.session.emailConfirmed = false; // Mark as unconfirmed
      req.session.flashMessage = `Welcome! Check your email (${email}) to verify your account.`;
      
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Registration error:', error);
    const fallbackEmail = req.body?.email || '';
    res.redirect('/register?error=' + encodeURIComponent('Registration failed. Please try again.') +
      (fallbackEmail ? ('&email=' + encodeURIComponent(fallbackEmail)) : ''));
  }
};


// POST /login - Handle login with email/password check, bcrypt verification, session creation
const handleLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/login?error=Invalid email or password');
  }

  try {
    const { email, password } = req.body;
    
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    // Constant-time comparison to prevent timing attacks
    // Always run bcrypt.compare() even if user doesn't exist
    const user = result.rows.length > 0 ? result.rows[0] : null;
    
    // Use dummy hash if user doesn't exist (same bcrypt cost as real passwords)
    const hashToCompare = user ? user.password_hash : DUMMY_HASH;
    
    // Always run bcrypt (prevents timing attack that reveals valid emails)
    const match = await bcrypt.compare(password, hashToCompare);
    
    // Reject if user doesn't exist OR password doesn't match
    if (!user || !match) {
      logSecurityEvent({
        eventType: 'LOGIN_FAILED',
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        email: req.body.email,
      }).catch(() => {});
      return res.redirect('/login?error=Invalid email or password');
    }

    // Regenerate session to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error on login:', err);
        return res.redirect('/login?error=An error occurred. Please try again.');
      }

      // If 2FA is enabled, require TOTP code
      if (user.twofa_enabled) {
        req.session.pending2FAUserId = user.id;
        req.session.userEmail = user.email;
        req.session.userRole = user.role;
        req.session.emailConfirmed = user.email_confirmed;
        return res.redirect('/auth/2fa/prompt');
      }

      // Set session (allow login even without email confirmation)
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userRole = user.role;
      req.session.emailConfirmed = user.email_confirmed; // Store confirmation status

      logSecurityEvent({
        userId: user.id,
        eventType: 'LOGIN_SUCCESS',
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        email: user.email,
      }).catch(() => {});

      // Redirect based on role
      if (user.role === 'admin') {
        return res.redirect('/admin');
      } else {
        return res.redirect('/dashboard');
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.redirect('/login?error=An error occurred. Please try again.');
  }
};

// GET /auth/2fa/prompt - Show 2FA code entry page
const show2FAPrompt = (req, res) => {
  if (!req.session.pending2FAUserId) return res.redirect('/login');
  res.send(`
    ${getHTMLHead('2FA Verification - Basement')}
    <main class="bg-black min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full bg-gray-900/80 backdrop-blur-xl border border-blue-500/30 rounded p-6 shadow">
        <h1 class="text-2xl font-bold text-white text-center mb-6">TWO-FACTOR AUTHENTICATION</h1>
        <form id="2faLoginForm" class="space-y-4">
          <input type="hidden" name="_csrf" value="${req.csrfToken()}">
          <input type="text" id="2faLoginCode" maxlength="6" placeholder="Enter 6-digit code" class="w-full px-4 py-2 rounded-lg text-white bg-black border border-gray-700 text-center font-mono" />
          <button type="submit" class="w-full py-2.5 bg-blue-600 text-white font-bold rounded hover:bg-blue-500 transition-all">Verify</button>
          <div id="2faLoginError" class="text-red-400 text-xs mt-2"></div>
        </form>
      </div>
    </main>
    <script nonce="${getNonce()}">
      document.getElementById('2faLoginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const code = document.getElementById('2faLoginCode').value.trim();
        const errorDiv = document.getElementById('2faLoginError');
        errorDiv.textContent = '';
        if (!code) { errorDiv.textContent = 'Enter code.'; return; }
        const csrfToken = document.querySelector('input[name="_csrf"]')?.value;
        const res = await fetch('/auth/2fa/verify-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ code })
        });
        const result = await res.json();
        if (result.success) {
          window.location.href = '/dashboard';
        } else {
          errorDiv.textContent = result.error || 'Invalid code.';
        }
      });
    </script>
  `);
};

// GET /confirm-email/:token - Verify email token and activate account
const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this token
    const userResult = await pool.query(
      'SELECT id, email, email_confirmed, token_expires_at FROM users WHERE email_token = $1',
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).send(`
${getHTMLHead('Invalid Token - Basement')}
    ${getResponsiveNav(req)}
    <main class="bg-gray-900 min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full bg-gray-800 border border-red-700 rounded-lg p-8 text-center">
        <h1 class="text-3xl font-bold text-red-400 mb-4">Invalid Token</h1>
        <p class="text-gray-400 mb-6">This confirmation link is invalid or has already been used.</p>
        <a href="/register" class="inline-block px-8 py-3 bg-brand text-gray-900 font-bold rounded-lg hover:bg-cyan-500 transition-colors">Register Again</a>
      </div>
    </main>
    ${getFooter()}
    ${getScripts('nav.js')}
      `);
    }

    const user = userResult.rows[0];

    // Check if token is expired
    if (!isCodeValid(user.token_expires_at)) {
      return res.status(400).send(`
${getHTMLHead('Token Expired - Basement')}
    ${getResponsiveNav(req)}
    <main class="bg-gray-900 min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full bg-gray-800 border border-red-700 rounded-lg p-8 text-center">
        <h1 class="text-3xl font-bold text-red-400 mb-4">Link Expired</h1>
        <p class="text-gray-400 mb-6">This confirmation link has expired (valid for 24 hours).</p>
        <a href="/register" class="inline-block px-8 py-3 bg-brand text-gray-900 font-bold rounded-lg hover:bg-cyan-500 transition-colors">Register Again</a>
      </div>
    </main>
    ${getFooter()}
    ${getScripts('nav.js')}
      `);
    }

    // Check if already confirmed
    if (user.email_confirmed) {
      return res.status(400).send(`
${getHTMLHead('Already Confirmed - Basement')}
    ${getResponsiveNav(req)}
    <main class="bg-gray-900 min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full bg-gray-800 border border-green-700 rounded-lg p-8 text-center">
        <h1 class="text-3xl font-bold text-green-400 mb-4">Already Confirmed</h1>
        <p class="text-gray-400 mb-6">This email has already been confirmed.</p>
        <a href="/login" class="inline-block px-8 py-3 bg-brand text-gray-900 font-bold rounded-lg hover:bg-cyan-500 transition-colors">Login</a>
      </div>
    </main>
    ${getFooter()}
    ${getScripts('nav.js')}
      `);
    }

    // Mark email as confirmed and clear token
    await pool.query(
      'UPDATE users SET email_confirmed = true, email_token = NULL, token_expires_at = NULL WHERE id = $1',
      [user.id]
    );

    res.send(`
${getHTMLHead('Email Confirmed - Basement')}
    ${getResponsiveNav(req)}
    <main class="bg-gray-900 min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full bg-gray-800 border border-green-700 rounded-lg p-8 text-center">
        <h1 class="text-3xl font-bold text-green-400 mb-4">✓ Email Confirmed!</h1>
        <p class="text-gray-400 mb-4">Your email has been successfully verified.</p>
        <p class="text-gray-500 mb-6">You can now login with your account.</p>
        <a href="/login" class="inline-block px-8 py-3 bg-brand text-gray-900 font-bold rounded-lg hover:bg-cyan-500 transition-colors">Go to Login</a>
      </div>
    </main>
    ${getFooter()}
    ${getScripts('nav.js')}
    `);
  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).send('Email confirmation failed');
  }
};

// GET /logout - Destroy session and redirect to login
const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.redirect('/');
    }
    res.clearCookie('sessionId');
    res.redirect('/login?message=Successfully logged out');
  });
};

// GET /resend-confirmation - Resend confirmation email
const resendConfirmation = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.redirect('/login?error=Email is required');
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Return same message whether email exists or not (prevent enumeration)
      return res.redirect('/verify-email?message=If that email is registered, a confirmation code has been sent.');
    }

    const user = result.rows[0];

    // Check if already confirmed
    if (user.email_confirmed) {
      return res.redirect('/login?message=Your email is already confirmed. You can login now.');
    }

    // Generate new confirmation code
    const { code, expiresAt } = createConfirmationCode();

    // Update user with new code (use email_token column, not confirmation_code)
    await pool.query(
      'UPDATE users SET email_token = $1, token_expires_at = $2 WHERE id = $3',
      [code, expiresAt, user.id]
    );

    // Send confirmation email
    await sendConfirmationEmail(email, code);

    // Set session email for the verify-email page to work
    req.session.userEmail = email;

    res.redirect(`/verify-email?email=${encodeURIComponent(email)}&message=Confirmation email sent! Check your inbox.`);
  } catch (error) {
    console.error('[RESEND CONFIRMATION] Error:', error);
    res.redirect('/login?error=Failed to resend confirmation email');
  }
};

// GET /verify-code - Display code verification form
const showVerifyCode = (req, res) => {
  const email = escapeHtml(req.query.email || '');
  res.send(`
${getHTMLHead('Verify Code - Basement')}
<body class="bg-gray-900">
    <div class="matrix-bg"></div>
    
    ${getResponsiveNav(req)}
    
    <div class="auth-container">
        <div class="auth-card">
            <h1>VERIFY CODE</h1>
            <p style="color: #8892a0; text-align: center; margin-bottom: 30px;">Enter the 6-digit code sent to<br><strong>${email}</strong></p>
            <form method="POST" action="/verify-code">
                <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                <input type="hidden" name="email" value="${email}">
                
                <div class="form-group">
                    <label>Confirmation Code</label>
                    <input type="text" name="code" placeholder="000000" maxlength="6" inputmode="numeric" required style="font-size: 24px; letter-spacing: 10px; text-align: center;">
                </div>
                
                <button type="submit" class="btn">Verify</button>
            </form>
            
            <p class="link" style="margin-top: 20px;"><a href="/register">Back to Register</a></p>
        </div>
    </div>
    
    ${getFooter()}
    ${getScripts('nav.js')}
  `);
};

// POST /verify-code - Verify the code
const handleVerifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.redirect(`/verify-code?email=${encodeURIComponent(email)}&error=Email not found`);
    }

    const user = result.rows[0];

    // Check if already confirmed
    if (user.email_confirmed) {
      return res.redirect('/login?message=Your email is already confirmed. You can login now.');
    }

    // Check if code matches and is valid
    if (user.email_token !== code || !isCodeValid(user.token_expires_at)) {
      return res.redirect(`/verify-code?email=${encodeURIComponent(email)}&error=Invalid or expired code`);
    }

    // Mark email as confirmed
    await pool.query(
      'UPDATE users SET email_confirmed = true WHERE id = $1',
      [user.id]
    );

    // Send welcome email (don't block on it)
    sendWelcomeEmail(user.email).catch(err => {
      console.error('[EMAIL] Failed to send welcome email:', err.message);
    });

    req.session.flashMessage = 'Email confirmed! You can now login.';
    res.redirect('/login');
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).send('Verification failed');
  }
};

// GET /verify-email - Show code entry page
const showVerifyEmail = (req, res) => {
  const error = escapeHtml(req.query.error || '');
  const success = escapeHtml(req.query.success || '');
  
  res.send(`
${getHTMLHead('Verify Email - Basement')}
    ${getResponsiveNav(req)}
    
    <main class="bg-gray-900 min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h1 class="text-3xl font-bold text-white text-center mb-4">VERIFY EMAIL</h1>
        <p class="text-gray-400 text-center mb-8">
          We sent a 6-digit code to your email.<br>
          Enter it below to verify your account.
        </p>
        
        ${error ? `<div class="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm"><svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>${error}</div>` : ''}
        ${success ? `<div class="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm"><svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>${success}</div>` : ''}
        
        <form method="POST" action="/verify-email" id="verifyForm" class="space-y-6">
          <input type="hidden" name="_csrf" value="${req.csrfToken()}">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
            <input type="text" name="code" maxlength="6" pattern="[0-9]{6}" inputmode="numeric" required
              class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none"
              placeholder="000000" autocomplete="off">
          </div>
          
          <button type="submit" class="w-full py-3 bg-blue-600 text-white font-bold">
            Verify Email
          </button>
        </form>
        
        <div class="mt-6 pt-6 border-t border-gray-700 text-center">
          <p class="text-gray-400 text-sm mb-2">Code expires in 15 minutes</p>
          <p class="text-gray-400 text-sm">
            Didn't receive it? <button type="button" id="resendBtn" class="text-brand hover:text-cyan-400 underline cursor-pointer">Resend Code</button>
          </p>
        </div>
      </div>
    </main>
    
    ${getFooter()}
    ${getScripts('nav.js')}
    
    <script nonce="${getNonce()}">
      document.getElementById('resendBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('resendBtn');
        btn.textContent = 'Sending...';
        btn.disabled = true;
        
        try {
          const csrfToken = document.querySelector('input[name="_csrf"]')?.value;
          if (!csrfToken) {
            alert('Security token missing. Please refresh and try again.');
            return;
          }
          const response = await fetch('/resend-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }
          });
          if (response.ok) {
            alert('Code resent! Check your email.');
          } else {
            alert('Failed to resend code. Please try again.');
          }
        } catch (err) {
          alert('Error sending code. Please try again.');
        } finally {
          btn.textContent = 'Resend Code';
          btn.disabled = false;
        }
      });
    </script>
  `);
};

// POST /verify-email - Handle code verification
const verifyEmailCode = async (req, res) => {
  try {
    const { code } = req.body;
    const email = req.session.userEmail; // Use logged-in user's email

    if (!code || !email) {
      return res.redirect('/verify-email?error=Invalid request');
    }

    // Find user with this code
    const userResult = await pool.query(
      'SELECT id, email, email_confirmed, email_token, token_expires_at FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.redirect('/register?error=User not found');
    }

    const user = userResult.rows[0];

    // Check if already confirmed
    if (user.email_confirmed) {
      req.session.userId = user.id;
      req.session.emailConfirmed = true;
      return res.redirect('/dashboard');
    }

    // Verify code matches
    if (user.email_token !== code) {
      return res.redirect('/verify-email?error=Invalid code. Please try again.');
    }

    // Check if code is expired
    if (!isCodeValid(user.token_expires_at)) {
      return res.redirect('/verify-email?error=Code expired. Please request a new one.');
    }

    // Mark email as confirmed
    await pool.query(
      'UPDATE users SET email_confirmed = true, email_token = NULL, token_expires_at = NULL WHERE id = $1',
      [user.id]
    );

    // Set session
    req.session.userId = user.id;
    req.session.emailConfirmed = true;

    // Redirect to dashboard
    res.redirect('/dashboard?success=Email confirmed! Welcome to Basement.');
  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect('/verify-email?error=Verification failed. Please try again.');
  }
};

// POST /resend-code - Resend verification code (returns JSON)
const resendCode = async (req, res) => {
  try {
    // Get email from logged-in user
    let email = req.session.userEmail;

    if (!email) {
      return res.json({ success: false, error: 'No email in session' });
    }

    // Find user
    const result = await pool.query('SELECT id, email, email_confirmed FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.json({ success: false, error: 'User not found' });
    }

    const user = result.rows[0];

    if (user.email_confirmed) {
      return res.json({ success: false, error: 'Email already confirmed' });
    }

    // Generate new code
    const { code, expiresAt } = createConfirmationCode();

    // Update user with new code
    await pool.query(
      'UPDATE users SET email_token = $1, token_expires_at = $2 WHERE id = $3',
      [code, expiresAt, user.id]
    );

    // Send confirmation email
    const emailResult = await sendConfirmationEmail(email, code);

    if (emailResult.success) {
      return res.json({ success: true, message: 'Code sent! Check your inbox.' });
    } else {
      return res.json({ success: false, error: 'Failed to send email. Try again.' });
    }
  } catch (error) {
    console.error('Resend code error:', error);
    return res.json({ success: false, error: 'Something went wrong' });
  }
};

// GET /forgot-password - Display forgot password form
const showForgotPassword = (req, res) => {
  const message = escapeHtml(req.query.message || '');
  const error = escapeHtml(req.query.error || '');
  const userEmail = escapeHtml(req.query.email || '');
  res.send(`
${getHTMLHead('Forgot Password - Basement')}
    ${getResponsiveNav(req)}
    
    <main class="bg-black min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full bg-gray-900/80 backdrop-blur-xl border border-blue-500/30 rounded p-6 shadow-[0_0_70px_rgba(0,102,255,0.25),0_0_110px_rgba(0,102,255,0.12),inset_0_0_35px_rgba(0,102,255,0.03)]">
        <h1 class="text-2xl font-bold text-white text-center mb-2">RESET PASSWORD</h1>
        <p class="text-center text-gray-400 text-sm mb-6">Enter your email to receive a reset link</p>
        
        ${message ? `<div class="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 text-sm flex items-center gap-2"><svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>${message}</div>` : ''}
        ${error ? `<div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-sm flex items-center gap-2"><svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>${error}</div>` : ''}
        
        <form method="POST" action="/forgot-password" class="space-y-4">
          <input type="hidden" name="_csrf" value="${req.csrfToken()}">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <input type="email" name="email" required 
              value="${userEmail}"
              class="w-full px-4 py-2.5 bg-black/40 border border-blue-500/30 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              placeholder="your@email.com">
          </div>
          <button type="submit" class="w-full py-2.5 bg-blue-600 text-white font-bold rounded hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(0,102,255,0.6)] transition-all">
            Send Reset Link
          </button>
        </form>
        
        <p class="text-center text-gray-400 mt-5 text-sm">
          Remember your password? <a href="/login" class="text-blue-400 hover:text-blue-300 font-medium">Login</a>
        </p>
      </div>
    </main>
    
    ${getFooter()}
    ${getScripts('nav.js')}
  `);
};

// POST /forgot-password - Generate reset token and send email
const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    
    // Always show success message (security: don't reveal if email exists)
    if (result.rows.length === 0) {
      return res.redirect('/forgot-password?message=' + encodeURIComponent('If that email exists, you will receive a reset link shortly.') + (email ? ('&email=' + encodeURIComponent(email)) : ''));
    }
    
    const user = result.rows[0];
    
    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Store token in database
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, resetTokenExpires, user.id]
    );
    
    logSecurityEvent({
      userId: user.id,
      eventType: 'PASSWORD_RESET_REQUESTED',
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      email: user.email,
    }).catch(() => {});

    // Send reset email (don't wait for it)
    const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    sendPasswordResetEmail(user.email, resetLink).catch(err => {
      console.error('[FORGOT PASSWORD] Failed to send email:', err);
    });
    
    res.redirect('/forgot-password?message=' + encodeURIComponent('If that email exists, you will receive a reset link shortly.') + (email ? ('&email=' + encodeURIComponent(email)) : ''));
  } catch (error) {
    console.error('[FORGOT PASSWORD] Error:', error);
    const fallbackEmail = req.body?.email || '';
    res.redirect('/forgot-password?error=An error occurred. Please try again.&email=' + encodeURIComponent(fallbackEmail));
  }
};

// Helper function to send password reset email
async function sendPasswordResetEmail(email, resetLink) {
  const { sendEmail } = require('../services/email');
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Reset Your Password</h2>
      <p>You requested to reset your password for Clouded Basement.</p>
      <p>Click the link below to set a new password:</p>
      <p style="margin: 30px 0;">
        <a href="${resetLink}">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #0066cc;">${resetLink}</p>
      <p style="margin-top: 30px; color: #666;">This link expires in 1 hour.</p>
      <p style="color: #666;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="margin: 30px 0; border: 1px solid #ddd;">
      <p style="color: #999; font-size: 12px;">Clouded Basement - Fast, Simple Cloud Hosting</p>
    </div>
  `;
  
  const text = `Reset your password for Clouded Basement.\n\nClick this link: ${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`;
  
  await sendEmail(email, 'Reset Your Password - Clouded Basement', html, text, true);
}

// GET /reset-password/:token - Display reset password form
const showResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify token exists and is not expired
    const result = await pool.query(
      'SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    
    if (result.rows.length === 0) {
      return res.redirect('/forgot-password?error=Invalid or expired reset link. Please request a new one.');
    }
    
    const errorMsg = escapeHtml(req.query.error || '');
    const successMsg = escapeHtml(req.query.message || '');
    res.send(`
${getHTMLHead('Reset Password - Basement')}
    ${getResponsiveNav(req)}
    <main class="bg-black min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full bg-gray-900/80 backdrop-blur-xl border border-blue-500/30 rounded p-6 shadow-[0_0_70px_rgba(0,102,255,0.25),0_0_110px_rgba(0,102,255,0.12),inset_0_0_35px_rgba(0,102,255,0.03)]">
        <h1 class="text-2xl font-bold text-white text-center mb-2">SET NEW PASSWORD</h1>
        <p class="text-center text-gray-400 text-sm mb-6">Enter your new password below</p>
        ${errorMsg ? `<div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-sm flex items-center gap-2"><svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>${errorMsg}</div>` : ''}
        ${successMsg ? `<div class="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded text-green-300 text-sm flex items-center gap-2"><svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>${successMsg}</div>` : ''}
        <form method="POST" action="/reset-password/${token}" class="space-y-4">
          <input type="hidden" name="_csrf" value="${req.csrfToken()}">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
            <input type="password" name="password" minlength="8" required 
              class="w-full px-4 py-2.5 bg-black/40 border border-blue-500/30 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              placeholder="Minimum 8 characters">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
            <input type="password" name="confirmPassword" minlength="8" required 
              class="w-full px-4 py-2.5 bg-black/40 border border-blue-500/30 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              placeholder="Re-enter password">
          </div>
          <button type="submit" class="w-full py-2.5 bg-blue-600 text-white font-bold rounded hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(0,102,255,0.6)] transition-all">
            Reset Password
          </button>
        </form>
        <p class="text-center text-gray-400 mt-5 text-sm">
          <a href="/login" class="text-blue-400 hover:text-blue-300 font-medium">Back to Login</a>
        </p>
      </div>
    </main>
    ${getFooter()}
    <script src="/js/form-validation.js"></script>
    <script src="/js/password-generator.js"></script>
    <script src="/js/password-strength.js"></script>
    ${getScripts('nav.js')}
    `);
  } catch (error) {
    console.error('[RESET PASSWORD] Error:', error);
    res.redirect('/forgot-password?error=An error occurred. Please try again.');
  }
};

// POST /reset-password/:token - Update password
const handleResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    
    console.log('[RESET PASSWORD] Received request:', { token, passwordLength: password?.length, confirmPasswordLength: confirmPassword?.length });
    
    // Validate passwords match
    if (password !== confirmPassword) {
      console.log('[RESET PASSWORD] Passwords do not match');
      return res.redirect(`/reset-password/${token}?error=Passwords do not match`);
    }
    
    // Validate password length
    if (password.length < 8) {
      return res.redirect(`/reset-password/${token}?error=Password must be at least 8 characters`);
    }
    // Password strength enforcement (backend)
    const zxcvbn = require('zxcvbn');
    const pwStrength = zxcvbn(password);
    if (pwStrength.score < 3) {
      return res.redirect(`/reset-password/${token}?error=Password is too weak. Suggestions: ${pwStrength.feedback.suggestions.join(' ')}`);
    }
    
    // Verify token exists and is not expired
    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    
    if (result.rows.length === 0) {
      return res.redirect('/forgot-password?error=Invalid or expired reset link. Please request a new one.');
    }
    
    const userId = result.rows[0].id;
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, userId]
    );
    
    console.log(`[RESET PASSWORD] Password reset successful for user ${userId}`);

    logSecurityEvent({
      userId,
      eventType: 'PASSWORD_RESET_COMPLETED',
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
    }).catch(() => {});

    res.redirect('/login?message=Password reset successful! Please login with your new password.');
  } catch (error) {
    console.error('[RESET PASSWORD] Error:', error);
    res.redirect(`/reset-password/${req.params.token}?error=An error occurred. Please try again.`);
  }
};

module.exports = {
  register: handleRegister,
  handleRegister,
  login: handleLogin,
  handleLogin,
  confirmEmail,
  logout: handleLogout,
  handleLogout,
  showVerifyEmail,
  verifyEmailCode,
  resendCode,
  resendConfirmation,
  showForgotPassword,
  handleForgotPassword,
  showResetPassword,
  handleResetPassword,
  // 2FA
  show2FASetup: exports.show2FASetup,
  verify2FASetup: exports.verify2FASetup,
  disable2FA: exports.disable2FA,
  verify2FALogin: exports.verify2FALogin,
  show2FAPrompt,
};
