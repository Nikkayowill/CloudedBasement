import { useState } from 'react';

function SectionHeader({ title }) {
  return (
    <div className="border-b-faint" style={{ padding: '1.5rem 1.5rem 1rem' }}>
      <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dash-text-muted, #525252)' }}>
        {title}
      </h2>
    </div>
  );
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ScopeBadge({ scope }) {
  const colors = {
    deploy: { bg: 'rgba(45,167,223,0.12)', color: '#7fd6ff' },
    read:   { bg: 'rgba(34,197,94,0.10)',  color: '#86efac' },
  };
  const c = colors[scope] ?? { bg: 'rgba(255,255,255,0.06)', color: '#a1a1a1' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.1rem 0.45rem',
      borderRadius: '0.25rem',
      fontSize: '0.625rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      background: c.bg,
      color: c.color,
      marginRight: '0.25rem',
    }}>
      {scope}
    </span>
  );
}

function KeyRevealModal({ apiKey: key, onClose }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function copy() {
    if (!navigator?.clipboard?.writeText) {
      // Fallback: use execCommand via a temporary textarea
      try {
        const ta = document.createElement('textarea');
        ta.value = key;
        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          setCopyFailed(true);
          setTimeout(() => setCopyFailed(false), 3500);
        }
      } catch {
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 3500);
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3500);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        width: '100%',
        maxWidth: '32rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>✓</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f5f5f5' }}>API key created</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Copy your key now — it will never be shown again.
        </p>
        <div style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.375rem',
          padding: '0.75rem 1rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.75rem',
          color: '#d1d5db',
          wordBreak: 'break-all',
          marginBottom: '0.75rem',
        }}>
          {key}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={copy}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: '0.375rem',
              border: '1px solid rgba(255,255,255,0.12)',
              background: copied ? 'rgba(34,197,94,0.12)' : copyFailed ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
              color: copied ? '#86efac' : copyFailed ? '#fca5a5' : '#d1d5db',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied!' : copyFailed ? 'Copy manually' : 'Copy key'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: '0.375rem',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: '#9ca3af',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateKeyForm({ csrfToken, onCreated }) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState(['deploy']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleScope(s) {
    setScopes(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ name, scopes }),
      });
      
      // Check response status first
      if (!res.ok) {
        // Try to extract error from response body (supports JSON and text)
        let errorMsg = 'Failed to create key';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } else {
            const text = await res.text();
            errorMsg = text || errorMsg;
          }
        } catch (parseErr) {
          console.error('Error parsing response:', parseErr);
        }
        setError(errorMsg);
        return;
      }
      
      // Only parse JSON if response is ok
      const data = await res.json();
      setName('');
      setScopes(['deploy']);
      onCreated(data);
    } catch (err) {
      setError('Network error — please try again');
      console.error('Request failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.3rem' }}>
          Key name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. CI/CD pipeline"
          maxLength={100}
          required
          style={{
            width: '100%',
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.375rem',
            padding: '0.45rem 0.75rem',
            fontSize: '0.8125rem',
            color: '#f5f5f5',
            outline: 'none',
          }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.4rem' }}>
          Scopes
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['deploy', 'read'].map(s => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.8125rem', color: scopes.includes(s) ? '#f5f5f5' : '#6b7280' }}>
              <input
                type="checkbox"
                checked={scopes.includes(s)}
                onChange={() => toggleScope(s)}
                style={{ accentColor: '#2DA7DF' }}
              />
              {s}
            </label>
          ))}
        </div>
      </div>
      {error && (
        <p style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '0.5rem' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !name.trim() || scopes.length === 0}
        style={{
          padding: '0.45rem 1rem',
          borderRadius: '0.375rem',
          border: 'none',
          background: loading ? 'rgba(45,167,223,0.5)' : '#2DA7DF',
          color: '#fff',
          fontSize: '0.8125rem',
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: (!name.trim() || scopes.length === 0) ? 0.5 : 1,
        }}
      >
        {loading ? 'Creating…' : 'Create key'}
      </button>
    </form>
  );
}

function KeyRow({ apiKey: k, csrfToken, onRevoked }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function revoke() {
    if (!confirm(`Revoke key "${k.name}"? This cannot be undone.`)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/keys/${k.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'x-csrf-token': csrfToken },
      });
      
      if (!res.ok) {
        // Attempt to extract error message from response
        let errorMsg = 'Failed to revoke key';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } else {
            const text = await res.text();
            errorMsg = text || errorMsg;
          }
        } catch (parseErr) {
          console.error('Error parsing error response:', parseErr);
        }
        setError(errorMsg);
        return;
      }
      
      // Success - notify parent and clear error
      setError('');
      onRevoked(k.id);
    } catch (err) {
      setError('Network error — could not revoke key');
      console.error('Revoke failed:', err);
    } finally {
      setLoading(false);
    }
  }

  const expired = k.expires_at && new Date(k.expires_at) < new Date();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#f5f5f5' }}>{k.name}</span>
          {expired && (
            <span style={{ fontSize: '0.625rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.1rem 0.35rem', borderRadius: '0.25rem' }}>
              EXPIRED
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
          <code style={{ fontSize: '0.6875rem', color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>
            {k.key_prefix}…
          </code>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.6875rem' }}>·</span>
          {(k.scopes || []).map(s => <ScopeBadge key={s} scope={s} />)}
        </div>
        <div style={{ fontSize: '0.6875rem', color: '#4b5563' }}>
          Created {formatDate(k.created_at)}
          {k.last_used_at ? ` · Last used ${formatDate(k.last_used_at)}` : ' · Never used'}
          {k.expires_at ? ` · Expires ${formatDate(k.expires_at)}` : ''}
        </div>
        {error && (
          <div style={{ fontSize: '0.6875rem', color: '#f87171', marginTop: '0.35rem' }}>
            {error}
          </div>
        )}
      </div>
      <button
        onClick={revoke}
        disabled={loading}
        style={{
          padding: '0.3rem 0.625rem',
          borderRadius: '0.25rem',
          border: '1px solid rgba(239,68,68,0.25)',
          background: 'rgba(239,68,68,0.06)',
          color: '#f87171',
          fontSize: '0.6875rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Revoking…' : 'Revoke'}
      </button>
    </div>
  );
}

export default function ApiKeysSection({ data }) {
  const { csrfToken, apiKeys: initial = [] } = data;
  const [keys, setKeys] = useState(initial);
  const [revealedKey, setRevealedKey] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function handleCreated(result) {
    setRevealedKey(result.key);
    // Refresh list from server to get the new key's metadata
    fetch('/api/keys', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setKeys(d.keys || []))
      .catch(() => {});
    setShowForm(false);
  }

  function handleRevoked(id) {
    setKeys(prev => prev.filter(k => k.id !== id));
  }

  return (
    <div style={{ color: '#f5f5f5' }}>
      {revealedKey && (
        <KeyRevealModal apiKey={revealedKey} onClose={() => setRevealedKey(null)} />
      )}

      <SectionHeader title="API Keys" />

      {/* Intro + create button */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
          Use API keys to authenticate programmatic deploys (CI/CD, scripts).
          Send deploys via <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#9ca3af' }}>POST /api/deploy</code> with a{' '}
          <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#9ca3af' }}>Bearer</code> token.
        </p>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            padding: '0.4rem 0.875rem',
            borderRadius: '0.375rem',
            border: '1px solid rgba(45,167,223,0.3)',
            background: showForm ? 'rgba(45,167,223,0.06)' : 'rgba(45,167,223,0.12)',
            color: '#7fd6ff',
            fontSize: '0.75rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {showForm ? 'Cancel' : '+ New key'}
        </button>
      </div>

      {showForm && (
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <CreateKeyForm csrfToken={csrfToken} onCreated={handleCreated} />
        </div>
      )}

      {/* Key list */}
      {keys.length === 0 ? (
        <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#4b5563', fontSize: '0.8125rem' }}>
          No API keys yet. Create one to get started.
        </div>
      ) : (
        <div>
          {keys.map(k => (
            <KeyRow key={k.id} apiKey={k} csrfToken={csrfToken} onRevoked={handleRevoked} />
          ))}
        </div>
      )}

      {/* Usage example */}
      <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4b5563', marginBottom: '0.5rem' }}>
          Usage example
        </p>
        <pre style={{
          margin: 0,
          padding: '0.75rem 1rem',
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.375rem',
          fontSize: '0.6875rem',
          color: '#9ca3af',
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}>
{`curl -X POST https://cloudedbasement.ca/api/deploy \\
  -H "Authorization: Bearer cbk_<your_key>" \\
  -H "Content-Type: application/json" \\
  -d '{"git_url":"https://github.com/you/your-repo"}'`}
        </pre>
      </div>
    </div>
  );
}
