import { useState, useEffect } from 'react';
import DashboardLayout from './dashboard/DashboardLayout';

export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch('/api/dashboard', { credentials: 'same-origin' })
      .then((r) => {
        if (r.status === 401 || r.status === 302) { window.location.href = '/login'; return null; }
        // If redirected to login page (auth failure, not JSON)
        const ct = r.headers.get('content-type') || '';
        if (r.ok && !ct.includes('application/json')) { window.location.href = '/login'; return null; }
        if (!r.ok) throw new Error(`Dashboard API error (${r.status}) — is Express running and restarted?`);
        return r.json();
      })
      .then((json) => { if (json) setData(json); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Flash from query params (server redirects after POST actions)
  const params       = new URLSearchParams(window.location.search);
  const flashSuccess = params.get('success') || '';
  const flashError   = params.get('error')   || '';

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--dash-text-muted, #525252)', fontSize: '0.875rem' }}>Loading…</span>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--dash-danger, #ef4444)', fontSize: '0.875rem' }}>{error}</span>
    </div>
  );

  return <DashboardLayout data={data} flashSuccess={flashSuccess} flashError={flashError} />;
}
