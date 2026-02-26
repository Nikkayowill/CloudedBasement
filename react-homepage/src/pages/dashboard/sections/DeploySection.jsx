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

const STATUS = {
  success:   { color: '#22c55e', label: 'Deployed'   },
  failed:    { color: '#ef4444', label: 'Failed'      },
  deploying: { color: '#eab308', label: 'Deploying…'  },
  pending:   { color: '#eab308', label: 'Pending…'    },
};

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

function DeploymentRow({ dep, csrfToken }) {
  const [confirming, setConfirming] = useState(false);
  const name = repoName(dep.git_url);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1.25rem',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      gap: '1rem', flexWrap: 'wrap',
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
          {dep.subdomain && (
            <a
              href={`https://${dep.subdomain}.cloudedbasement.ca`}
              target="_blank" rel="noreferrer"
              style={{ fontSize: '0.6875rem', color: '#60a5fa', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {dep.subdomain}.cloudedbasement.ca
            </a>
          )}
          {dep.branch && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>
              {dep.branch}
            </span>
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
  );
}

export default function DeploySection({ data }) {
  const { deployments = [], csrfToken, hasServer, siteCount = 0, siteLimit = 2 } = data;
  const [gitUrl, setGitUrl] = useState('');
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
                <a href="/pay" style={{
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
                <p style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>
                  Deploying an existing repo will trigger a redeploy. {siteCount}/{siteLimit} sites used.
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
            {deployments.map((dep) => (
              <DeploymentRow key={dep.id} dep={dep} csrfToken={csrfToken} />
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
