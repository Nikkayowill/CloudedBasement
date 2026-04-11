import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.375rem',
  color: '#f5f5f5',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 150ms',
  boxSizing: 'border-box',
};

function Flash({ type, children }) {
  const styles = {
    success: { bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.2)',  color: '#86efac' },
    warning: { bg: 'rgba(234,179,8,0.07)',  border: 'rgba(234,179,8,0.2)',  color: '#fde047' },
    error:   { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',  color: '#fca5a5' },
    info:    { bg: 'rgba(45,167,223,0.07)', border: 'rgba(45,167,223,0.2)', color: '#7fd6ff' },
  };
  const s = styles[type] ?? styles.info;
  return (
    <div style={{
      background: s.bg, border: '1px solid ' + s.border, borderRadius: '0.375rem',
      padding: '0.5rem 0.75rem', marginBottom: '0.75rem',
      fontSize: '0.8125rem', color: s.color, lineHeight: 1.5,
    }}>
      {children}
    </div>
  );
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const [csrf, setCsrf] = useState('');

  const error      = searchParams.get('error') || '';
  const success    = searchParams.get('message') || searchParams.get('success') || '';
  const warning    = searchParams.get('warning') || '';
  const email      = searchParams.get('email') || '';
  const showResend = error && error.toLowerCase().includes('confirm your email') && email;
  const [clientError, setClientError] = useState('');

  useEffect(() => {
    fetch('/api/csrf-token', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setCsrf(d.csrfToken))
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#16171d' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '85rem', margin: '0 auto', minHeight: '100vh', borderLeft: '1px solid rgba(255,255,255,0.07)', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ width: '100%', maxWidth: '24.5rem', maxHeight: '94vh', overflowY: 'auto', background: 'rgba(17, 24, 39, 0.84)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.9rem', padding: '1.75rem', boxShadow: '0 24px 70px rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2DA7DF', margin: '0 0 0.375rem' }}>Welcome back</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f5f5f5', margin: 0 }}>Sign in</h1>
        </div>

        {clientError && <Flash type="error">{clientError}</Flash>}
        {success    && <Flash type="success">{success}</Flash>}
        {warning    && <Flash type="warning">{warning}</Flash>}
        {error      && <Flash type="error">{error}</Flash>}
        {showResend && (
          <Flash type="info">
            <a href={'/resend-confirmation?email=' + encodeURIComponent(email)} style={{ color: '#7fd6ff', textDecoration: 'underline' }}>
              Resend confirmation email
            </a>
          </Flash>
        )}

        <form method="POST" action="/login" onSubmit={e => {
          // Basic client-side validation
          const emailVal = e.target.email.value;
          const passVal = e.target.password.value;
          if (!emailVal || !passVal) {
            setClientError('Email and password are required.');
            e.preventDefault();
          } else {
            setClientError('');
          }
        }}>
          <input type="hidden" name="_csrf" value={csrf} />

          <div style={{ marginBottom: '0.875rem' }}>
            <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.375rem' }}>Email</label>
            <input id="login-email" type="email" name="email" required defaultValue={email} style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(45,167,223,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.375rem' }}>
              <label htmlFor="login-password" style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af' }}>Password</label>
              <a href="/forgot-password" style={{ fontSize: '0.6875rem', color: '#2DA7DF', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.target.style.color = '#7fd6ff'; }}
                onMouseLeave={(e) => { e.target.style.color = '#2DA7DF'; }}>Forgot?</a>
            </div>
            <input id="login-password" type="password" name="password" required style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(45,167,223,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
          </div>

          <button type="submit" disabled={!csrf} style={{ width: '100%', padding: '0.5rem', background: csrf ? '#2DA7DF' : 'rgba(45,167,223,0.3)', border: 'none', borderRadius: '0.375rem', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: csrf ? 'pointer' : 'not-allowed', transition: 'background 150ms', marginBottom: '1rem' }}>
            Sign in
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ padding: '0 0.75rem', fontSize: '0.6875rem', color: '#4b5563' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <a href="/auth/google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', background: '#fff', borderRadius: '0.375rem', color: '#111', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'background 150ms', marginBottom: '1.25rem' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
          <GoogleIcon />
          Continue with Google
        </a>

        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <a href="/register" style={{ color: '#2DA7DF', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={(e) => { e.target.style.color = '#7fd6ff'; }}
            onMouseLeave={(e) => { e.target.style.color = '#2DA7DF'; }}>Create one free</a>
        </p>

      </div>
    </div>
    </div>
  );
}
