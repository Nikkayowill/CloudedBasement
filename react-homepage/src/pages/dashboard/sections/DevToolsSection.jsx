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

const MONO = { fontFamily: 'JetBrains Mono, monospace' };

function CardLabel({ children }) {
  return (
    <p style={{ fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)', marginBottom: '0.3125rem' }}>
      {children}
    </p>
  );
}

function CredRow({ label, value, masked, onCopy }) {
  const display = masked ? '••••••••••••' : (value || '—');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
      gap: '0.75rem', flexWrap: 'wrap',
    }}>
      <div style={{ minWidth: 0 }}>
        <CardLabel>{label}</CardLabel>
        <span style={{
          fontSize: '0.8125rem',
          color: masked ? 'var(--dash-text-muted, #525252)' : 'var(--dash-text-primary, #fafafa)',
          ...MONO, wordBreak: 'break-all',
        }}>
          {display}
        </span>
      </div>
      {!masked && value && (
        <button
          onClick={() => onCopy(value)}
          style={{
            flexShrink: 0, padding: '0.25rem 0.625rem',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.25rem', color: 'var(--dash-text-secondary, #a1a1a1)',
            fontSize: '0.6875rem', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Copy
        </button>
      )}
    </div>
  );
}

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button onClick={handle} style={{
      flexShrink: 0, padding: '0.3125rem 0.75rem', borderRadius: '0.3125rem',
      background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
      color: copied ? '#4ade80' : 'var(--dash-text-secondary, #a1a1a1)',
      fontSize: '0.6875rem', cursor: 'pointer', whiteSpace: 'nowrap',
      transition: 'color 0.15s',
    }}>
      {copied ? 'Copied!' : label}
    </button>
  );
}

function CardShell({ title, badge, children }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--dash-text-primary, #fafafa)' }}>
          {title}
        </span>
        {badge && (
          <span style={{
            fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', padding: '0.1rem 0.4rem',
            borderRadius: '0.2rem', background: 'rgba(34,197,94,0.12)', color: '#4ade80',
          }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: '0.75rem 1.25rem' }}>
        {children}
      </div>
    </div>
  );
}

function DatabaseSetupCard({ csrfToken, isDemo }) {
  const [busy, setBusy]     = useState(null); // 'postgres' | 'mongodb'
  const [result, setResult] = useState(null);

  async function install(dbType) {
    setBusy(dbType); setResult(null);
    if (isDemo) {
      await new Promise(r => setTimeout(r, 1200));
      setBusy(null);
      setResult({ type: 'success', message: `${dbType === 'postgres' ? 'PostgreSQL' : 'MongoDB'} installation started. Refresh in 2–3 minutes.` });
      return;
    }
    try {
      const body = new URLSearchParams({ database_type: dbType, _csrf: csrfToken });
      const r = await fetch('/setup-database', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (r.redirected || r.ok) {
        setResult({ type: 'success', message: `${dbType === 'postgres' ? 'PostgreSQL' : 'MongoDB'} installation started. Refresh in 2–3 minutes.` });
      } else {
        setResult({ type: 'error', message: `Server error: ${r.status}` });
      }
    } catch {
      setResult({ type: 'error', message: 'Network error. Try again.' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--dash-text-primary, #fafafa)' }}>Install a Database</span>
        <p style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)', marginTop: '0.1875rem' }}>
          One-click installation directly on your server. Credentials are stored securely.
        </p>
      </div>
      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => install('postgres')}
            disabled={!!busy}
            style={{
              padding: '0.5rem 1.125rem', borderRadius: '0.375rem',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
              color: '#60a5fa', fontSize: '0.8125rem', fontWeight: 500,
              cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1,
            }}
          >
            {busy === 'postgres' ? 'Installing…' : 'Install PostgreSQL'}
          </button>
          <button
            onClick={() => install('mongodb')}
            disabled={!!busy}
            style={{
              padding: '0.5rem 1.125rem', borderRadius: '0.375rem',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              color: '#86efac', fontSize: '0.8125rem', fontWeight: 500,
              cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1,
            }}
          >
            {busy === 'mongodb' ? 'Installing…' : 'Install MongoDB'}
          </button>
        </div>
        {result && (
          <p style={{ fontSize: '0.8125rem', color: result.type === 'success' ? '#86efac' : '#fca5a5', margin: 0, lineHeight: 1.5 }}>
            {result.message}
          </p>
        )}
      </div>
    </div>
  );
}

function DatabaseBackupCard({ csrfToken, postgresInstalled, mongodbInstalled, isDemo }) {
  const [busy, setBusy]     = useState(null); // db_type being backed up
  const [result, setResult] = useState(null);

  async function runBackup(dbType) {
    setBusy(dbType); setResult(null);
    if (isDemo) {
      await new Promise(r => setTimeout(r, 1200));
      setBusy(null);
      setResult({ type: 'success', message: `Backup saved to /root/db-backups/${dbType === 'postgres' ? 'pg-app_db' : 'mongo'}-${new Date().toISOString().slice(0,10)}.${dbType === 'postgres' ? 'sql.gz' : 'tar.gz'}` });
      return;
    }
    try {
      const r = await fetch('/api/backup-database', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ db_type: dbType }),
      });
      let d = null;
      try { d = await r.json(); } catch { /* non-JSON response */ }
      if (r.ok) {
        if (d?.success) setResult({ type: 'success', message: d.message });
        else setResult({ type: 'error', message: d?.error || (d ? 'Backup failed.' : 'Invalid response format.') });
      } else {
        setResult({ type: 'error', message: d?.error || `Server error: ${r.status}` });
      }
    } catch {
      setResult({ type: 'error', message: 'Network error.' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--dash-text-primary, #fafafa)' }}>Database Backups</span>
        <p style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)', marginTop: '0.1875rem' }}>
          Stored in <code style={MONO}>/root/db-backups/</code> on your server · 7-day retention
        </p>
      </div>
      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {postgresInstalled && (
            <button
              onClick={() => runBackup('postgres')}
              disabled={!!busy}
              style={{
                padding: '0.5rem 1.125rem', borderRadius: '0.375rem',
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                color: '#60a5fa', fontSize: '0.8125rem', fontWeight: 500,
                cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1,
              }}
            >
              {busy === 'postgres' ? 'Backing up…' : 'Backup PostgreSQL'}
            </button>
          )}
          {mongodbInstalled && (
            <button
              onClick={() => runBackup('mongodb')}
              disabled={!!busy}
              style={{
                padding: '0.5rem 1.125rem', borderRadius: '0.375rem',
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                color: '#86efac', fontSize: '0.8125rem', fontWeight: 500,
                cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1,
              }}
            >
              {busy === 'mongodb' ? 'Backing up…' : 'Backup MongoDB'}
            </button>
          )}
        </div>
        {result && (
          <p style={{ fontSize: '0.8125rem', color: result.type === 'success' ? '#86efac' : '#fca5a5', margin: 0, lineHeight: 1.5 }}>
            {result.message}
          </p>
        )}
        <p style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)', lineHeight: 1.5 }}>
          Backups also run automatically every 24 hours. A confirmation email is sent on completion.
        </p>
      </div>
    </div>
  );
}

export default function DevToolsSection({ data }) {
  const { hasServer, sshUsername, ipAddress, postgresInstalled, mongodbInstalled } = data;
  const [creds, setCreds]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [revealed, setRevealed] = useState(false);

  async function reveal() {
    if (creds) { setRevealed(true); return; }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/credentials?type=all', { credentials: 'same-origin' });
      if (!r.ok) throw new Error(`${r.status}`);
      setCreds(await r.json());
      setRevealed(true);
    } catch {
      setError('Could not load credentials. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copy(text) {
    // Try async clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        // Optionally show success toast or feedback here
        if (typeof window.showToast === 'function') window.showToast('Copied!');
        return true;
      } catch (err) {
        // Optionally show error toast or feedback here
        if (typeof window.showToastError === 'function') window.showToastError('Copy failed');
      }
    }
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        if (typeof window.showToast === 'function') window.showToast('Copied!');
        return true;
      } else {
        if (typeof window.showToastError === 'function') window.showToastError('Copy failed');
      }
    } catch (err) {
      if (typeof window.showToastError === 'function') window.showToastError('Copy failed');
    }
    return false;
  }

  if (!hasServer) {
    return (
      <section>
        <SectionHeader title="Dev Tools" />
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem',
            padding: '2.5rem 1.5rem', textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '0.375rem' }}>
              No server yet
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dash-text-muted, #525252)', marginBottom: '1.25rem' }}>
              SSH access, database credentials, and environment tools appear here once your server is provisioned.
            </p>
            <a href="/pricing" style={{
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

  const sshCommand = `ssh ${sshUsername || 'root'}@${ipAddress}`;

  return (
    <section>
      <SectionHeader title="Dev Tools" />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Reveal banner */}
        {!revealed && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1.25rem', gap: '1rem', flexWrap: 'wrap',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--dash-text-primary, #fafafa)', marginBottom: '0.1875rem' }}>
                Credentials are hidden
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)' }}>
                Click reveal to load your SSH and database credentials securely.
              </p>
            </div>
            <button
              onClick={reveal}
              disabled={loading}
              style={{
                flexShrink: 0, padding: '0.4375rem 1rem',
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '0.375rem', color: '#60a5fa',
                fontSize: '0.8125rem', fontWeight: 500, cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? 'Loading…' : 'Reveal Credentials'}
            </button>
          </div>
        )}

        {error && (
          <p style={{ fontSize: '0.8125rem', color: '#f87171', padding: '0 0.25rem' }}>{error}</p>
        )}

        {/* SSH */}
        <CardShell title="SSH Access" badge="Active">
          <CredRow label="Username" value={sshUsername || 'root'} masked={false} onCopy={copy} />
          <CredRow label="Host / IP" value={ipAddress} masked={false} onCopy={copy} />
          <CredRow
            label="Password"
            value={revealed ? creds?.ssh?.password : null}
            masked={!revealed || !creds?.ssh?.password}
            onCopy={copy}
          />
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <code style={{
              flex: 1, minWidth: '12rem', fontSize: '0.75rem', padding: '0.5rem 0.75rem',
              background: 'rgba(0,0,0,0.35)', borderRadius: '0.3125rem',
              color: '#a3e635', ...MONO, wordBreak: 'break-all',
            }}>
              {sshCommand}
            </code>
            <CopyButton text={sshCommand} label="Copy Command" />
          </div>
        </CardShell>

        {/* PostgreSQL */}
        {postgresInstalled && (
          <CardShell title="PostgreSQL" badge="Installed">
            <CredRow label="Host"     value={revealed ? creds?.postgres?.host      : null} masked={!revealed} onCopy={copy} />
            <CredRow label="Port"     value="5432"                                          masked={false}     onCopy={copy} />
            <CredRow label="Database" value={revealed ? creds?.postgres?.database   : null} masked={!revealed} onCopy={copy} />
            <CredRow label="Username" value={revealed ? creds?.postgres?.username   : null} masked={!revealed} onCopy={copy} />
            <CredRow label="Password" value={revealed ? creds?.postgres?.password   : null} masked={!revealed} onCopy={copy} />
            {revealed && creds?.postgres?.connectionString && (
              <div style={{ marginTop: '0.75rem' }}>
                <CardLabel>Connection String</CardLabel>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <code style={{
                    flex: 1, minWidth: '10rem', fontSize: '0.6875rem', padding: '0.5rem 0.75rem',
                    background: 'rgba(0,0,0,0.35)', borderRadius: '0.3125rem',
                    color: '#a3e635', ...MONO, wordBreak: 'break-all',
                  }}>
                    {creds.postgres.connectionString}
                  </code>
                  <CopyButton text={creds.postgres.connectionString} label="Copy" />
                </div>
              </div>
            )}
          </CardShell>
        )}

        {/* MongoDB */}
        {mongodbInstalled && (
          <CardShell title="MongoDB" badge="Installed">
            <CredRow label="Host"     value={revealed ? creds?.mongodb?.host      : null} masked={!revealed} onCopy={copy} />
            <CredRow label="Port"     value="27017"                                        masked={false}     onCopy={copy} />
            <CredRow label="Database" value={revealed ? creds?.mongodb?.database   : null} masked={!revealed} onCopy={copy} />
            <CredRow label="Username" value={revealed ? creds?.mongodb?.username   : null} masked={!revealed} onCopy={copy} />
            <CredRow label="Password" value={revealed ? creds?.mongodb?.password   : null} masked={!revealed} onCopy={copy} />
            {revealed && creds?.mongodb?.connectionString && (
              <div style={{ marginTop: '0.75rem' }}>
                <CardLabel>Connection String</CardLabel>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <code style={{
                    flex: 1, minWidth: '10rem', fontSize: '0.6875rem', padding: '0.5rem 0.75rem',
                    background: 'rgba(0,0,0,0.35)', borderRadius: '0.3125rem',
                    color: '#a3e635', ...MONO, wordBreak: 'break-all',
                  }}>
                    {creds.mongodb.connectionString}
                  </code>
                  <CopyButton text={creds.mongodb.connectionString} label="Copy" />
                </div>
              </div>
            )}
          </CardShell>
        )}

        {/* No databases installed */}
        {!postgresInstalled && !mongodbInstalled && (
          <DatabaseSetupCard csrfToken={data.csrfToken} isDemo={!!data.isDemo} />
        )}

        {/* Database backup card — shown when a DB is installed */}
        {(postgresInstalled || mongodbInstalled) && (
          <DatabaseBackupCard
            csrfToken={data.csrfToken}
            postgresInstalled={postgresInstalled}
            mongodbInstalled={mongodbInstalled}
            isDemo={!!data.isDemo}
          />
        )}

      </div>
    </section>
  );
}
