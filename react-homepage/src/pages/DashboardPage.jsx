import { useState, useEffect } from 'react';
import DashboardLayout from './dashboard/DashboardLayout';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Forward demo params so the API can detect admin demo mode
    const urlParams = new URLSearchParams(window.location.search);
    const apiQuery = new URLSearchParams();
    if (urlParams.get('demo'))     apiQuery.set('demo',     urlParams.get('demo'));
    if (urlParams.get('state'))    apiQuery.set('state',    urlParams.get('state'));
    if (urlParams.get('demoPlan')) apiQuery.set('demoPlan', urlParams.get('demoPlan'));
    const apiUrl = '/api/dashboard' + (apiQuery.toString() ? '?' + apiQuery.toString() : '');

    fetch(apiUrl, { credentials: 'same-origin' })
      .then((r) => {
        if (r.status === 401 || r.status === 302) { window.location.href = '/login'; return null; }
        const ct = r.headers.get('content-type') || '';
        if (r.ok && !ct.includes('application/json')) { window.location.href = '/login'; return null; }
        if (!r.ok) throw new Error(`Dashboard API error (${r.status}) - is Express running and restarted?`);
        return r.json();
      })
      .then((json) => { if (json) setData(json); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const params = new URLSearchParams(window.location.search);
  const flashSuccess = params.get('success') || '';
  const flashError   = params.get('error')   || '';
  const flashWarning = params.get('warning') || '';

  if (loading) return (
    <div className="cb-screen-state">
      <span style={{ color: 'var(--dash-text-muted, #525252)', fontSize: '0.875rem' }}>Loading...</span>
    </div>
  );

  if (error) return (
    <div className="cb-screen-state">
      <span style={{ color: 'var(--dash-danger, #ef4444)', fontSize: '0.875rem' }}>{error}</span>
    </div>
  );

  return <DashboardLayout data={data} flashSuccess={flashSuccess} flashError={flashError} flashWarning={flashWarning} />;
}
