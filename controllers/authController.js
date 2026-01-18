const bcrypt = require('bcrypt');
const pool = require('../db');
const { validationResult } = require('express-validator');
const { getHTMLHead, getFooter, getScripts, getResponsiveNav } = require('../helpers');

// GET /register - Display registration form with CSRF token
const showRegister = (req, res) => {
  res.send(`
${getHTMLHead('Register - Basement')}
    <link rel="stylesheet" href="/css/auth.css">
</head>
<body>
    <div class="matrix-bg"></div>
    
    ${getResponsiveNav(req)}
    
    <div class="auth-container">
        <div class="auth-card">
            <h1>CREATE ACCOUNT</h1>
            <form method="POST" action="/register">
                <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" minlength="8" required>
                </div>
                
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="confirmPassword" minlength="8" required>
                </div>
                
                <button type="submit" class="btn">Register</button>
            </form>
            
            <p class="link">Already have an account? <a href="/login">Login</a></p>
        </div>
    </div>
    
    ${getFooter()}
    ${getScripts('nav.js')}
  `);
};

// POST /register - Handle registration with validation, bcrypt hashing, database insert
const handleRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send(`
      <h1 style="color: #88FE00;">Validation Error</h1>
      <ul>${errors.array().map(err => `<li>${err.msg}</li>`).join('')}</ul>
      <a href="/register" style="color: #88FE00;">Go back</a>
    `);
  }

  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).send('Email already registered. <a href="/login">Login</a>');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert user
    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
      [email, passwordHash]
    );

    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Registration failed');
  }
};

// GET /login - Display login form with CSRF token
const showLogin = (req, res) => {
  const flashMessage = req.session.flashMessage;
  delete req.session.flashMessage;
  const message = req.query.message || '';
  const error = req.query.error || '';
  res.send(`
${getHTMLHead('Login - Basement')}
    <link rel="stylesheet" href="/css/auth.css">
    <style>
      .flash-message {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(136, 254, 0, 0.15);
        color: var(--glow);
        padding: 12px 36px 12px 16px;
        border-radius: 6px;
        border: 1px solid rgba(136, 254, 0, 0.3);
        box-shadow: 0 2px 10px rgba(136, 254, 0, 0.1);
        font-weight: 400;
        font-size: 14px;
        z-index: 10000;
        animation: slideDown 0.3s ease-out;
        max-width: 400px;
        text-align: center;
      }
      .flash-message.fade-out {
        animation: fadeOut 0.5s ease-out forwards;
      }
      .flash-close {
        position: absolute;
        top: 6px;
        right: 8px;
        background: none;
        border: none;
        color: var(--glow);
        font-size: 18px;
        cursor: pointer;
        padding: 2px 6px;
        line-height: 1;
        opacity: 0.5;
        transition: opacity 0.2s;
      }
      .flash-close:hover {
        opacity: 1;
      }
      @keyframes slideDown {
        from {
          transform: translate(-50%, -100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%);
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        to {
          opacity: 0;
          transform: translate(-50%, -50px);
        }
      }
    </style>
</head>
<body>
    <div class="matrix-bg"></div>
    
    ${flashMessage ? `
    <div class="flash-message" id="flashMessage">
      ${flashMessage}
      <button class="flash-close" onclick="dismissFlash()">&times;</button>
    </div>
    <script>
      function dismissFlash() {
        const msg = document.getElementById('flashMessage');
        msg.classList.add('fade-out');
        setTimeout(() => msg.remove(), 500);
      }
      setTimeout(() => {
        const msg = document.getElementById('flashMessage');
        if (msg) dismissFlash();
      }, 7000);
    </script>
    ` : ''}
    
    ${getResponsiveNav(req)}
    
    <div class="auth-container">
        <div class="auth-card">
            <h1>LOGIN</h1>
            ${message ? `<div class="message">${message}</div>` : ''}
            ${error ? `<div class="error">${error}</div>` : ''}
            <form method="POST" action="/login">
                <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required>
                </div>
                
                <button type="submit" class="btn">Login</button>
            </form>
            
            <p class="link">Don't have an account? <a href="/register">Register</a></p>
        </div>
    </div>
    
    ${getFooter()}
    ${getScripts('nav.js')}
  `);
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
    if (result.rows.length === 0) {
      return res.redirect('/login?error=Invalid email or password');
    }

    const user = result.rows[0];
    
    // Check password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.redirect('/login?error=Invalid email or password');
    }

    // Set session
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    return res.redirect('/login?error=An error occurred. Please try again.');
  }
};

// GET /logout - Destroy session and redirect to login
const handleLogout = (req, res) => {
  req.session.flashMessage = 'Successfully logged out';
  req.session.save((err) => {
    if (err) console.error('Session save error:', err);
    res.redirect('/login');
  });
};

module.exports = {
  showRegister,
  handleRegister,
  showLogin,
  handleLogin,
  handleLogout
};
