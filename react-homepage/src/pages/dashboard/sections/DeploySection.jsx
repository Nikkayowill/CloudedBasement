import { useState, useEffect, useRef } from 'react';

function SectionHeader({ title }) {
  return (
    <div className="border-b-faint" style={{ padding: '1.5rem 1.5rem 1rem' }}>
      <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dash-text-muted, #525252)' }}>
        {title}
      </h2>
    </div>
  );
}

const STATUS = {
  success:   { color: '#22c55e', label: 'Deployed'   },
  failed:    { color: '#ef4444', label: 'Failed'      },
  deploying: { color: '#eab308', label: 'Deploying…'  },
  pending:   { color: '#eab308', label: 'Pending…'    },
};

const PREVIEW_COLOR = '#a78bfa'; // violet

function StatusBadge({ status }) {
  const s = STATUS[status] ?? { color: '#525252', label: status ?? 'Unknown' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
      <span style={{ width: '0.4375rem', height: '0.4375rem', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      <span style={{ fontSize: '0.6875rem', color: s.color }}>{s.label}</span>
    </span>
  );
}

function repoName(gitUrl = '') {
  return gitUrl.split('/').pop().replace(/\.git$/, '') || gitUrl;
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function AiDiagnosis({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      margin: '0.5rem 1.25rem 0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid rgba(239,68,68,0.2)',
      background: 'rgba(239,68,68,0.04)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 0.75rem', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: '#f87171' }}>✦</span>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#fca5a5', letterSpacing: '0.04em' }}>
          AI Diagnosis
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: '#f87171', opacity: 0.7 }}>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 0.75rem 0.75rem' }}>
          <p style={{
            fontSize: '0.8125rem', color: '#fecaca', lineHeight: 1.6,
            margin: 0, whiteSpace: 'pre-wrap',
          }}>
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

function BuildLog({ depId, initialStatus, initialOutput }) {
  const isLive = initialStatus === 'pending' || initialStatus === 'deploying';
  const [open, setOpen] = useState(isLive);
  const [output, setOutput] = useState(initialOutput || '');
  const [status, setStatus] = useState(initialStatus);
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);

  // Poll while deploying, stop when done
  useEffect(() => {
    if (status !== 'pending' && status !== 'deploying') return;

    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/deployment-status/${depId}`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setOutput(data.output || '');
        setStatus(data.status);
        if (data.status !== 'pending' && data.status !== 'deploying') {
          clearInterval(intervalRef.current);
        }
      } catch (_) {}
    }, 2000);

    return () => clearInterval(intervalRef.current);
  }, [depId, status]);

  // Auto-scroll to bottom when output grows
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, open]);

  if (!output) return null;

  const isRunning = status === 'pending' || status === 'deploying';

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 1.25rem', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {isRunning && (
          <span style={{
            width: '0.4375rem', height: '0.4375rem', borderRadius: '50%',
            background: '#eab308', flexShrink: 0,
            animation: 'cb-pulse 1.2s ease-in-out infinite',
          }} />
        )}
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', letterSpacing: '0.04em' }}>
          {isRunning ? 'Build log (live)' : 'Build log'}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: '#4b5563' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div style={{
          margin: '0 1.25rem 0.75rem',
          borderRadius: '0.375rem',
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}>
          <pre style={{
            margin: 0,
            padding: '0.75rem 1rem',
            fontSize: '0.6875rem',
            lineHeight: 1.6,
            color: '#d1d5db',
            fontFamily: 'JetBrains Mono, monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            maxHeight: '18rem',
            overflowY: 'auto',
          }}>
            {output}
            <span ref={bottomRef} />
          </pre>
        </div>
      )}
    </div>
  );
}

function DeploymentRow({ dep, csrfToken, isLatest, uptimeStatus }) {
  const [confirming, setConfirming] = useState(false);
  const name = repoName(dep.git_url);
  const subdomainUrl = dep.subdomain ? `https://${dep.subdomain}.cloudedbasement.ca` : null;

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.25rem', gap: '1rem', flexWrap: 'wrap',
      }}>
      {/* Left: repo info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1875rem', minWidth: 0 }}>
        <span style={{
          fontSize: '0.875rem', fontWeight: 500,
          color: 'var(--dash-text-primary, #fafafa)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {name}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {dep.is_preview && (
            <span style={{
              fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.05em',
              padding: '0.1rem 0.4rem', borderRadius: '0.25rem',
              background: 'rgba(167,139,250,0.12)', border: `1px solid rgba(167,139,250,0.3)`,
              color: PREVIEW_COLOR, textTransform: 'uppercase',
            }}>
              Preview
            </span>
          )}
          {dep.branch && (
            <span style={{ fontSize: '0.6875rem', color: dep.is_preview ? PREVIEW_COLOR : 'var(--dash-text-muted, #525252)', fontFamily: 'JetBrains Mono, monospace' }}>
              {dep.branch}
            </span>
          )}
          {dep.subdomain && (
            <>
              <a
                href={subdomainUrl}
                target="_blank" rel="noreferrer"
                style={{ fontSize: '0.6875rem', color: dep.is_preview ? PREVIEW_COLOR : '#60a5fa', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}
              >
                {dep.subdomain}.cloudedbasement.ca ↗
              </a>
              {dep.status === 'success' && <UptimeDot url={subdomainUrl} uptimeStatus={uptimeStatus} />}
            </>
          )}
          <span style={{ fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>
            {formatDate(dep.deployed_at || dep.created_at)}
          </span>
        </div>
      </div>

      {/* Right: status + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
        <StatusBadge status={dep.status} />

        {/* Redeploy */}
        <form action="/deploy" method="POST">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <input type="hidden" name="git_url" value={dep.git_url} />
          <button type="submit" style={{
            padding: '0.3125rem 0.625rem', borderRadius: '0.3125rem',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--dash-text-secondary, #a1a1a1)', fontSize: '0.6875rem',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            Redeploy
          </button>
        </form>

        {/* Rollback — only on past successful deployments that have a commit SHA */}
        {!isLatest && dep.status === 'success' && dep.commit_sha && (
          <form action="/rollback" method="POST">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <input type="hidden" name="deploymentId" value={dep.id} />
            <button type="submit" title={`Roll back to ${dep.commit_sha.slice(0, 7)}`} style={{
              padding: '0.3125rem 0.625rem', borderRadius: '0.3125rem',
              background: 'transparent', border: '1px solid rgba(251,191,36,0.3)',
              color: '#fbbf24', fontSize: '0.6875rem',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              ↩ Rollback
            </button>
          </form>
        )}

        {/* Delete */}
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            style={{
              padding: '0.3125rem 0.625rem', borderRadius: '0.3125rem',
              background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', fontSize: '0.6875rem', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Delete
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', color: '#f87171' }}>Sure?</span>
            <form action="/delete-deployment" method="POST">
              <input type="hidden" name="_csrf" value={csrfToken} />
              <input type="hidden" name="deploymentId" value={dep.id} />
              <button type="submit" style={{
                padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171', fontSize: '0.6875rem', cursor: 'pointer',
              }}>
                Yes
              </button>
            </form>
            <button
              onClick={() => setConfirming(false)}
              style={{
                padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--dash-text-muted, #525252)', fontSize: '0.6875rem', cursor: 'pointer',
              }}
            >
              No
            </button>
          </div>
        )}
      </div>
      </div>
      {dep.status === 'failed' && dep.ai_diagnosis && (
        <AiDiagnosis text={dep.ai_diagnosis} />
      )}
      <BuildLog depId={dep.id} initialStatus={dep.status} initialOutput={dep.output} />
    </div>
  );
}

function UptimeDot({ url, uptimeStatus }) {
  if (!uptimeStatus || !url) return null;
  const entry = uptimeStatus[url];
  if (!entry) return null;
  const isUp = entry.status === 'up';
  return (
    <span title={isUp ? 'Site is up' : `Down since ${entry.down_since ? new Date(entry.down_since).toLocaleString() : 'unknown'}`} style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0,
    }}>
      <span style={{
        width: '0.4375rem', height: '0.4375rem', borderRadius: '50%', flexShrink: 0,
        background: isUp ? '#22c55e' : '#ef4444',
        boxShadow: isUp ? '0 0 0 2px rgba(34,197,94,0.2)' : '0 0 0 2px rgba(239,68,68,0.2)',
      }} />
      <span style={{ fontSize: '0.625rem', color: isUp ? '#22c55e' : '#ef4444' }}>
        {isUp ? 'up' : 'down'}
      </span>
    </span>
  );
}

export default function DeploySection({ data }) {
  const { deployments = [], csrfToken, hasServer, siteCount = 0, siteLimit = 2, uptimeStatus = {} } = data;
  const [gitUrl, setGitUrl]           = useState('');
  const [startCommand, setStartCommand] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const atLimit = siteCount >= siteLimit;

  // No server state
  if (!hasServer) {
    return (
      <section>
        <SectionHeader title="Deploy" />
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem',
            padding: '2.5rem 1.5rem', textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '0.375rem' }}>
              No server yet
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dash-text-muted, #525252)', marginBottom: '1.25rem' }}>
              You need an active server to deploy apps.
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

  return (
    <section>
      <SectionHeader title="Deploy" />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Deploy form */}
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--dash-text-primary, #fafafa)', marginBottom: '0.25rem' }}>
              Deploy from Git
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)' }}>
              Supports GitHub, GitLab, and Bitbucket public repositories.
            </p>
          </div>

          <div style={{ padding: '1rem 1.25rem' }}>
            {atLimit ? (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: '0.375rem',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <span style={{ fontSize: '0.8125rem', color: '#fca5a5' }}>
                  Site limit reached ({siteCount}/{siteLimit}). Upgrade your plan or delete a site to deploy a new one.
                </span>
                <a href="/pricing" style={{
                  flexShrink: 0, fontSize: '0.75rem', fontWeight: 500,
                  color: '#60a5fa', textDecoration: 'none', whiteSpace: 'nowrap',
                }}>
                  Upgrade →
                </a>
              </div>
            ) : (
              <form action="/deploy" method="POST">
                <input type="hidden" name="_csrf" value={csrfToken} />
                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <input
                    type="url"
                    name="git_url"
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    required
                    style={{
                      flex: 1, minWidth: '14rem',
                      padding: '0.5rem 0.875rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.375rem',
                      color: 'var(--dash-text-primary, #fafafa)',
                      fontSize: '0.875rem', outline: 'none',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                  <button type="submit" style={{
                    padding: '0.5rem 1.125rem',
                    background: '#2563eb', border: 'none', borderRadius: '0.375rem',
                    color: '#fff', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}>
                    Deploy
                  </button>
                </div>

                {/* Advanced options */}
                <div style={{ marginTop: '0.625rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(s => !s)}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    <span style={{ fontSize: '0.5rem' }}>{showAdvanced ? '▲' : '▼'}</span>
                    Advanced options
                  </button>
                  {showAdvanced && (
                    <div style={{ marginTop: '0.625rem' }}>
                      <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)', marginBottom: '0.3125rem' }}>
                        Custom startup command <span style={{ color: 'var(--dash-text-muted, #525252)', fontWeight: 400 }}>(optional — overrides default)</span>
                      </label>
                      <input
                        type="text"
                        value={startCommand}
                        onChange={e => setStartCommand(e.target.value)}
                        placeholder="node server.js  or  npm start"
                        style={{
                          width: '100%', padding: '0.4375rem 0.75rem',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '0.375rem',
                          color: 'var(--dash-text-primary, #fafafa)',
                          fontSize: '0.8125rem', outline: 'none',
                          fontFamily: 'JetBrains Mono, monospace',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                      />
                      <p style={{ marginTop: '0.3rem', fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>
                        e.g. <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>node dist/server.js</code> or <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>gunicorn main:app</code>
                      </p>
                    </div>
                  )}
                </div>

                <p style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>
                  Deploying an existing repo will trigger a redeploy. {siteCount}/{siteLimit} sites used.
                {/* Always submit start_command even when advanced panel is collapsed */}
                <input type="hidden" name="start_command" value={startCommand} />
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Deployment list */}
        {deployments.length > 0 ? (
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--dash-text-muted, #525252)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Deployments
              </span>
            </div>
            {deployments.map((dep, idx) => (
              <DeploymentRow key={dep.id} dep={dep} csrfToken={csrfToken} isLatest={idx === 0} uptimeStatus={uptimeStatus} />
            ))}
          </div>
        ) : (
          <div style={{
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem',
            padding: '2rem 1.5rem', textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dash-text-muted, #525252)' }}>
              No deployments yet. Deploy your first app above.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
