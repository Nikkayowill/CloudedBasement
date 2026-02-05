// Google OAuth Configuration using Passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../db');

// Initialize Google OAuth strategy
function initializeGoogleAuth() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('[OAUTH] Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    return;
  }

  const callbackURL = process.env.NODE_ENV === 'production'
    ? 'https://cloudedbasement.ca/auth/google/callback'
    : 'http://localhost:3000/auth/google/callback';

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const googleId = profile.id;
      const displayName = profile.displayName || email?.split('@')[0] || 'User';

      if (!email) {
        return done(new Error('No email provided by Google'), null);
      }

      // Check if user exists by Google ID
      let result = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleId]
      );

      if (result.rows.length > 0) {
        // Existing Google user - log them in
        return done(null, result.rows[0]);
      }

      // Check if user exists by email (might have registered with password before)
      result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length > 0) {
        // User exists with this email - link their Google account
        const user = result.rows[0];
        await pool.query(
          'UPDATE users SET google_id = $1, email_confirmed = true WHERE id = $2',
          [googleId, user.id]
        );
        user.google_id = googleId;
        user.email_confirmed = true;
        return done(null, user);
      }

      // New user - create account
      const insertResult = await pool.query(
        `INSERT INTO users (email, google_id, auth_provider, email_confirmed, created_at)
         VALUES ($1, $2, 'google', true, NOW())
         RETURNING *`,
        [email.toLowerCase(), googleId]
      );

      console.log(`[OAUTH] New user registered via Google: ${email}`);
      return done(null, insertResult.rows[0]);

    } catch (error) {
      console.error('[OAUTH] Google auth error:', error);
      return done(error, null);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, result.rows[0] || null);
    } catch (error) {
      done(error, null);
    }
  });

  console.log('[OAUTH] Google OAuth initialized');
}

module.exports = { passport, initializeGoogleAuth };
