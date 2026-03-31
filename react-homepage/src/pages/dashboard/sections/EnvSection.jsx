import { useState, useEffect } from 'react';

function SectionHeader({ title }) {
  return (
    <div className="border-b-faint" style={{ padding: '1.5rem 1.5rem 1rem' }}>
      <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dash-text-muted, #525252)' }}>
        {title}
      </h2>
    </div>
  );
}

function CardShell({ title, subtitle, children }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--dash-text-primary, #fafafa)' }}>{title}</span>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)', marginTop: '0.1875rem' }}>{subtitle}</p>
        )}
      </div>
      <div style={{ padding: '1rem 1.25rem' }}>{children}</div>
    </div>
  );
}

function MaskedValue({ value }) {
  const [shown, setShown] = useState(false);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem',
        color: shown ? 'var(--dash-text-primary, #fafafa)' : 'var(--dash-text-muted, #525252)',
        wordBreak: 'break-all',
      }}>
        {shown ? value : '••••••••'}
      </span>
      <button
        onClick={() => setShown(s => !s)}
        style={{
          padding: '0.125rem 0.5rem', background: 'transparent',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.25rem',
          color: 'var(--dash-text-muted, #525252)', fontSize: '0.625rem',
          cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        {shown ? 'Hide' : 'Show'}
      </button>
    </span>
  );
}

export default function EnvSection({ data }) {
  const { hasServer, csrfToken } = data;

  const [envVars, setEnvVars]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState(null);

  const [newKey, setNewKey]     = useState('');
  const [newVal, setNewVal]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!hasServer) return;
    setLoading(true);
    fetch('/api/env-vars', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setEnvVars(d.envVars || []))
      .catch(() => setApiError('Failed to load environment variables.'))
      .finally(() => setLoading(false));
  }, [hasServer]);

  async function handleAdd(e) {
    e.preventDefault();
    setFormErr(null);
    const key = newKey.trim().toUpperCase();
    const val = newVal;
    if (!key) return setFormErr('Key is required.');
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return setFormErr('Key must start with a letter or underscore and contain only letters, numbers, and underscores.');
    setSaving(true);
    try {
      const r = await fetch('/api/env-vars', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ key, value: val }),
      });
      const d = await r.json();
      if (!r.ok) return setFormErr(d.error || 'Failed to save.');
      setEnvVars(prev => {
        const idx = prev.findIndex(v => v.key === d.envVar.key);
        return idx >= 0
          ? prev.map((v, i) => i === idx ? d.envVar : v)
          : [...prev, d.envVar].sort((a, b) => a.key.localeCompare(b.key));
      });
      setNewKey('');
      setNewVal('');
    } catch {
      setFormErr('Network error. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      const r = await fetch(`/api/env-vars/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'x-csrf-token': csrfToken },
      });
      if (r.ok) {
        setEnvVars(prev => prev.filter(v => v.id !== id));
      } else {
        const errText = await r.text();
        console.error('Failed to delete env var:', r.status, errText);
        setApiError('Failed to delete environment variable.');
        if (typeof window.showToastError === 'function') window.showToastError('Failed to delete environment variable.');
      }
    } catch (err) {
      console.error('Error deleting env var:', err);
      setApiError('Network error. Try again.');
      if (typeof window.showToastError === 'function') window.showToastError('Network error. Try again.');
    } finally {
      setDeletingId(null);
    }
  }

  if (!hasServer) {
    return (
      <section>
        <SectionHeader title="Environment Variables" />
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem',
            padding: '2.5rem 1.5rem', textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '0.375rem' }}>
              No server yet
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dash-text-muted, #525252)', marginBottom: '1.25rem' }}>
              Environment variables are injected into your deployments at build time.
            </p>
            <a href="/pay" style={{
              display: 'inline-block', padding: '0.5rem 1.25rem',
              borderRadius: '0.375rem', background: '#2563eb',
              color: '#fff', fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none',
            }}>
              Get a Server
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title="Environment Variables" />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Info banner */}
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '0.5rem',
          background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
          fontSize: '0.8125rem', color: 'var(--dash-text-secondary, #a1a1a1)', lineHeight: 1.5,
        }}>
          These variables are injected into your server's <code style={{ fontFamily: 'JetBrains Mono, monospace', color: '#60a5fa' }}>.env</code> file on every deploy. Changes take effect on the next deployment.
        </div>

        {/* Current vars */}
        <CardShell title="Current Variables" subtitle={loading ? 'Loading…' : `${envVars.length} variable${envVars.length !== 1 ? 's' : ''} set`}>
          {apiError && (
            <p style={{ fontSize: '0.8125rem', color: '#f87171', marginBottom: '0.75rem' }}>{apiError}</p>
          )}

          {!loading && envVars.length === 0 && !apiError && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--dash-text-muted, #525252)', textAlign: 'center', padding: '1rem 0' }}>
              No variables set yet. Add one below.
            </p>
          )}

          {envVars.map(v => (
            <div key={v.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.5625rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              flexWrap: 'wrap',
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem',
                color: '#a3e635', flexShrink: 0, minWidth: '8rem',
              }}>
                {v.key}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <MaskedValue value={v.value} />
              </span>
              <button
                onClick={() => handleDelete(v.id)}
                disabled={deletingId === v.id}
                style={{
                  flexShrink: 0, padding: '0.1875rem 0.5rem',
                  background: 'transparent', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '0.25rem', color: '#f87171',
                  fontSize: '0.6875rem', cursor: deletingId === v.id ? 'wait' : 'pointer',
                }}
              >
                {deletingId === v.id ? '…' : 'Remove'}
              </button>
            </div>
          ))}
        </CardShell>

        {/* Add form */}
        <CardShell title="Add / Update Variable">
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 10rem', minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)', marginBottom: '0.3125rem' }}>
                  KEY
                </label>
                <input
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  placeholder="DATABASE_URL"
                  autoCapitalize="characters"
                  style={{
                    width: '100%', padding: '0.5rem 0.75rem',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.375rem', color: 'var(--dash-text-primary, #fafafa)',
                    fontSize: '0.8125rem', fontFamily: 'JetBrains Mono, monospace',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ flex: '2 1 14rem', minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)', marginBottom: '0.3125rem' }}>
                  VALUE
                </label>
                <input
                  value={newVal}
                  onChange={e => setNewVal(e.target.value)}
                  placeholder="postgres://user:pass@host/db"
                  style={{
                    width: '100%', padding: '0.5rem 0.75rem',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.375rem', color: 'var(--dash-text-primary, #fafafa)',
                    fontSize: '0.8125rem', fontFamily: 'JetBrains Mono, monospace',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {formErr && (
              <p style={{ fontSize: '0.8125rem', color: '#f87171', margin: 0 }}>{formErr}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '0.4375rem 1rem', borderRadius: '0.375rem',
                  background: saving ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.35)',
                  color: '#60a5fa', fontSize: '0.8125rem', fontWeight: 500,
                  cursor: saving ? 'wait' : 'pointer',
                }}
              >
                {saving ? 'Saving…' : 'Save Variable'}
              </button>
              <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)' }}>
                If the key already exists, the value will be updated.
              </span>
            </div>
          </form>
        </CardShell>

      </div>
    </section>
  );
}
