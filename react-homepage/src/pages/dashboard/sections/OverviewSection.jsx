import { useState, useEffect, useCallback } from 'react';

// ── Metrics Grid ──────────────────────────────────────────────────────────────

function metricColor(val) {
  if (val === null) return '#525252';
  if (val >= 85) return '#ef4444';
  if (val >= 60) return '#eab308';
  return '#22c55e';
}

function MetricTile({ label, value, unit = '%', showBar = true }) {
  const isAvailable = value !== null;
  const color = showBar ? metricColor(value) : '#60a5fa';

  return (
    <div style={{
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '0.625rem',
      padding: '0.875rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      minWidth: 0,
    }}>
      <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#525252' }}>
        {label}
      </span>
      <span style={{
        fontSize: '1.375rem', fontWeight: 700, lineHeight: 1,
        fontFamily: 'JetBrains Mono, monospace',
        color: isAvailable ? color : '#525252',
      }}>
        {isAvailable ? `${value}${unit}` : '—'}
      </span>
      {showBar && (
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginTop: '0.25rem' }}>
          <div style={{
            height: '100%',
            width: isAvailable ? `${Math.min(value, 100)}%` : '0%',
            background: color,
            borderRadius: 99,
            transition: 'width 0.6s ease, background 0.3s ease',
            boxShadow: isAvailable && value >= 60 ? `0 0 6px ${color}60` : 'none',
          }} />
        </div>
      )}
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem', marginBottom: '1.25rem' }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          background: '#111111', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '0.625rem', padding: '0.875rem 1rem', height: '5rem',
        }}>
          <div style={{ height: '0.5rem', width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: '0.625rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '1.25rem', width: '55%', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      ))}
    </div>
  );
}

function MetricsGrid() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res  = await fetch('/api/metrics', { credentials: 'same-origin' });
      const json = await res.json();
      setData(json);
    } catch {
      setData({ available: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) return <MetricsSkeleton />;

  // If metrics aren't available (no server / DO API unreachable), render nothing
  if (!data?.available) return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <style>{`
        @media (max-width: 520px) { .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
      <div className="metrics-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.625rem',
      }}>
        <MetricTile label="CPU"    value={data.cpu}    unit="%" showBar />
        <MetricTile label="Memory" value={data.memory} unit="%" showBar />
        <MetricTile label="Disk"   value={data.disk}   unit="%" showBar />
        <MetricTile label="Uptime" value={data.uptime} unit=""  showBar={false} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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
  // Add email confirmation step after payment
  const steps = [
    {
      id: 'account',
      label: 'Create your account',
      done: true,
    },
    {
      id: 'email',
      label: 'Confirm your email',
      done: !!data.emailConfirmed,
      cta: !data.emailConfirmed ? { label: 'Resend confirmation', href: '/resend-confirmation' } : undefined,
      extra: !data.emailConfirmed ? (
        <div style={{ color: '#facc15', fontSize: '0.75rem', marginTop: 4 }}>
          Please check your inbox and click the link to verify your email before continuing.<br />
          {data.userEmail && data.userEmail.trim() ? (
            <span style={{ color: '#a1a1a1' }}>Email: <b>{data.userEmail}</b></span>
          ) : (
            <span style={{ color: '#a1a1a1' }}>Email not provided</span>
          )}
        </div>
      ) : null,
    },
    {
      id: 'payment',
      label: 'Choose a plan',
      done: !!(data.hasPaid || data.hasServer || data.isProvisioning),
      cta: data.emailConfirmed ? { label: 'Choose a plan', href: '/pay' } : undefined,
      hidden: !data.emailConfirmed,
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

  const visibleSteps = steps.filter(s => !s.hidden);
  const doneCount = visibleSteps.filter(s => s.done).length;
  if (doneCount === visibleSteps.length) {
    return (
      <div style={{
        border: '1px solid rgba(34,197,94,0.18)',
        borderRadius: '0.625rem',
        marginBottom: '1.25rem',
        background: 'rgba(34,197,94,0.07)',
        color: '#22c55e',
        padding: '1.5rem 1.25rem',
        textAlign: 'center',
        fontWeight: 500,
        fontSize: '1.05rem',
        letterSpacing: '0.01em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <svg width="32" height="32" viewBox="0 0 20 20" fill="none" style={{ marginBottom: 6 }}>
          <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2" fill="rgba(34,197,94,0.08)" />
          <path d="M6 10.5l2.5 2.5L14 8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Your server is ready!
        <div style={{ color: '#a1a1a1', fontWeight: 400, fontSize: '0.95rem', marginTop: 2 }}>
          Welcome to your dashboard. You can now deploy apps, manage domains, and explore all features.
        </div>
      </div>
    );
  }

  const activeIdx = visibleSteps.findIndex(s => !s.done);
  const pct = Math.round((doneCount / visibleSteps.length) * 100);

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', marginBottom: '1.25rem', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dash-text-primary, #fafafa)' }}>
          Get Started
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)', fontVariantNumeric: 'tabular-nums' }}>
          {doneCount} / {visibleSteps.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#3b82f6', transition: 'width 0.4s ease' }} />
      </div>

      {/* Steps */}
      <div style={{ padding: '0.5rem 1.25rem 0.75rem' }}>
        {visibleSteps.map((step, i) => {
          const isActive = i === activeIdx;
          return (
            <div key={step.id} style={{
              display: 'flex',
              gap: '0.75rem',
              padding: '0.5rem 0',
              borderBottom: i < visibleSteps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.75rem' }}>
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
              {/* Extra info for email step */}
              {step.extra && isActive && (
                <div style={{ marginLeft: 28 }}>{step.extra}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UptimeSummaryCard({ uptimeStatus }) {
  if (!uptimeStatus || Object.keys(uptimeStatus).length === 0) return null;

  const entries = Object.entries(uptimeStatus);
  const downSites = entries.filter(([, v]) => v.status === 'down');
  const allUp = downSites.length === 0;

  return (
    <div style={{
      border: `1px solid ${allUp ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.25)'}`,
      borderRadius: '0.625rem',
      marginBottom: '1.25rem',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.75rem 1.25rem',
        borderBottom: entries.length > 0 && !allUp ? '1px solid rgba(255,255,255,0.05)' : 'none',
        background: allUp ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
      }}>
        <span style={{
          width: '0.5rem', height: '0.5rem', borderRadius: '50%', flexShrink: 0,
          background: allUp ? '#22c55e' : '#ef4444',
        }} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: allUp ? '#22c55e' : '#f87171' }}>
          {allUp
            ? `All sites operational (${entries.length})`
            : `${downSites.length} site${downSites.length > 1 ? 's' : ''} down`}
        </span>
      </div>
      {!allUp && downSites.map(([url]) => (
        <div key={url} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.5rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{ fontSize: '0.75rem', color: '#f87171', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {url}
          </span>
          <span style={{ fontSize: '0.6875rem', color: '#ef4444', flexShrink: 0, marginLeft: '0.5rem' }}>down</span>
        </div>
      ))}
    </div>
  );
}

export default function OverviewSection({ data, onNav }) {
  const {
    hasServer, isProvisioning, hasPaid, trialAvailable,
    serverStatus, serverName, ipAddress, ipv6Address,
    plan, siteCount, siteLimit, csrfToken,
    uptimeStatus = {},
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

        {/* Live metrics — only rendered when server is running */}
        {hasServer && serverStatus === 'running' && <MetricsGrid />}

        {/* Uptime summary — shown when we have at least one check result */}
        {hasServer && <UptimeSummaryCard uptimeStatus={uptimeStatus} />}

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
