// Section header shared across dashboard sections
function SectionHeader({ title }) {
  return (
    <div className="border-b-faint" style={{ padding: '1.5rem 1.5rem 1rem' }}>
      <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dash-text-muted, #525252)' }}>
        {title}
      </h2>
    </div>
  );
}

function DataRow({ label, value, valueStyle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.6875rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--dash-text-secondary, #a1a1a1)' }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', color: 'var(--dash-text-primary, #fafafa)', fontFamily: 'JetBrains Mono, monospace', ...valueStyle }}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    running:      { dot: '#22c55e', label: 'Online'       },
    provisioning: { dot: '#eab308', label: 'Provisioning' },
    off:          { dot: '#ef4444', label: 'Offline'      },
  };
  const s = map[status] ?? map.off;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{
        width: '0.5rem', height: '0.5rem', borderRadius: '50%',
        background: s.dot,
        boxShadow: status === 'running' ? `0 0 0 3px rgba(34,197,94,0.15)` : 'none',
      }} />
      <span style={{ fontSize: '0.75rem', color: s.dot }}>{s.label}</span>
    </span>
  );
}

const CTAbtn = { padding: '0.25rem 0.625rem', borderRadius: '0.3125rem', background: 'transparent', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa', fontSize: '0.6875rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none' };

function GetStartedCard({ data, onNav }) {
  const domainCount = data.domains?.length ?? 0;

  const steps = [
    {
      id: 'account',
      label: 'Create your account',
      done: true,
    },
    {
      id: 'server',
      label: 'Set up a server',
      done: !!(data.hasPaid || data.hasServer || data.isProvisioning),
      cta: { label: 'Choose a plan', href: '/pay' },
    },
    {
      id: 'deploy',
      label: 'Deploy your first app',
      done: (data.siteCount ?? 0) > 0,
      cta: { label: 'Deploy now', onClick: () => onNav?.('deploy') },
    },
    {
      id: 'domain',
      label: 'Add a custom domain',
      done: domainCount > 0,
      cta: { label: 'Add domain', onClick: () => onNav?.('sites') },
    },
  ];

  const doneCount = steps.filter(s => s.done).length;
  if (doneCount === steps.length) return null;

  const activeIdx = steps.findIndex(s => !s.done);
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', marginBottom: '1.25rem', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dash-text-primary, #fafafa)' }}>
          Get Started
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)', fontVariantNumeric: 'tabular-nums' }}>
          {doneCount} / {steps.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#3b82f6', transition: 'width 0.4s ease' }} />
      </div>

      {/* Steps */}
      <div style={{ padding: '0.5rem 1.25rem 0.75rem' }}>
        {steps.map((step, i) => {
          const isActive = i === activeIdx;
          return (
            <div key={step.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.5rem 0',
              borderBottom: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              {/* State icon */}
              {step.done ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: '#22c55e' }}>
                  <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5" fill="rgba(34,197,94,0.1)" />
                  <path d="M5 8l2.5 2.5L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : isActive ? (
                <span style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid #3b82f6', flexShrink: 0, display: 'inline-block' }} />
              ) : (
                <span style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0, display: 'inline-block' }} />
              )}

              {/* Label */}
              <span style={{
                flex: 1, fontSize: '0.8125rem',
                color: step.done
                  ? 'var(--dash-text-muted, #525252)'
                  : isActive
                    ? 'var(--dash-text-primary, #fafafa)'
                    : 'var(--dash-text-secondary, #a1a1a1)',
              }}>
                {step.label}
              </span>

              {/* CTA — only on the current active step */}
              {isActive && step.cta && (
                step.cta.href ? (
                  <a href={step.cta.href} style={CTAbtn}>{step.cta.label} →</a>
                ) : (
                  <button onClick={step.cta.onClick} style={CTAbtn}>{step.cta.label} →</button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OverviewSection({ data, onNav }) {
  const {
    hasServer, isProvisioning, hasPaid, trialAvailable,
    serverStatus, serverName, ipAddress, ipv6Address,
    plan, siteCount, siteLimit, csrfToken,
  } = data;

  const atLimit = siteCount >= siteLimit;

  return (
    <section>
      <SectionHeader title="Overview" />

      <div style={{ padding: '1.5rem' }}>

        <GetStartedCard data={data} onNav={onNav} />

        {/* No server state */}
        {!hasServer && !isProvisioning && (
          <div style={{
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem',
            padding: '2.5rem 1.5rem', textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '0.375rem' }}>
              No server yet
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dash-text-muted, #525252)' }}>
              {hasPaid
                ? 'Server is being provisioned — contact support if this takes more than 5 minutes.'
                : trialAvailable
                  ? 'Start your free trial to get a server.'
                  : 'Purchase a plan to deploy your first app.'}
            </p>
            {!hasPaid && (
              <a href="/pay" style={{
                display: 'inline-block', marginTop: '1.25rem',
                padding: '0.5rem 1.25rem', borderRadius: '0.375rem',
                background: '#2563eb', color: '#fff',
                fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none',
              }}>
                {trialAvailable ? 'Start Free Trial' : 'View Plans'}
              </a>
            )}
          </div>
        )}

        {/* Provisioning spinner */}
        {isProvisioning && !hasServer && (
          <div style={{
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem',
            padding: '3rem 1.5rem', textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '3rem', height: '3rem', borderRadius: '50%',
              background: 'rgba(59,130,246,0.1)', marginBottom: '1rem',
            }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6', animation: 'spin 1s linear infinite' }}
                fill="none" viewBox="0 0 24 24">
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--dash-text-primary, #fafafa)', marginBottom: '0.375rem' }}>
              Setting up your server…
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dash-text-secondary, #a1a1a1)' }}>
              Usually takes 2–3 minutes. This page will refresh automatically.
            </p>
          </div>
        )}

        {/* Server card */}
        {(hasServer || (isProvisioning && hasServer)) && (
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem' }}>
            {/* Card header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <StatusBadge status={serverStatus} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--dash-text-secondary, #a1a1a1)', fontFamily: 'JetBrains Mono, monospace' }}>
                {serverName}
              </span>
            </div>

            {/* Data rows */}
            <div style={{ padding: '0 1.25rem' }}>
              <DataRow label="IPv4" value={ipAddress} valueStyle={{ color: '#60a5fa' }} />
              {ipv6Address && <DataRow label="IPv6" value={ipv6Address} valueStyle={{ fontSize: '0.6875rem' }} />}
              <DataRow label="Plan" value={plan?.toUpperCase()} />
              <DataRow
                label="Sites"
                value={`${siteCount} / ${siteLimit}`}
                valueStyle={atLimit ? { color: '#ef4444' } : {}}
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
              padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <form action="/server-action" method="POST">
                <input type="hidden" name="_csrf" value={csrfToken} />
                <input type="hidden" name="action" value="restart" />
                <button type="submit" style={{
                  padding: '0.4375rem 0.875rem', borderRadius: '0.375rem',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--dash-text-secondary, #a1a1a1)', fontSize: '0.8125rem',
                  cursor: 'pointer', fontWeight: 500,
                }}>
                  Restart
                </button>
              </form>
              <form action="/delete-server" method="POST"
                onSubmit={(e) => { if (!window.confirm('This will cancel your plan and delete the server. Are you sure?')) e.preventDefault(); }}>
                <input type="hidden" name="_csrf" value={csrfToken} />
                <button
                  type="submit"
                  style={{
                    padding: '0.4375rem 0.875rem', borderRadius: '0.375rem',
                    background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171', fontSize: '0.8125rem',
                    cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  Cancel Plan
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
