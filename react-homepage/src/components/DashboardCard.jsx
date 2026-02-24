const DEPLOYMENTS = [
  { repo: 'my-saas-app',   branch: 'main',       ago: '2 hours ago',  status: 'success' },
  { repo: 'landing-page',  branch: 'main',       ago: '3 days ago',   status: 'success' },
  { repo: 'api-backend',   branch: 'production', ago: '5 days ago',   status: 'success' },
];

const DOMAINS = [
  { name: 'myapp.com',     ssl: true },
  { name: 'api.myapp.com', ssl: true },
];

function StatusDot({ color }) {
  return (
    <span style={{
      display: 'inline-block', width: '7px', height: '7px',
      borderRadius: '50%', background: color, flexShrink: 0,
      boxShadow: `0 0 6px ${color}`,
    }} />
  );
}

function Badge({ children, color = 'rgba(74,222,128,0.15)', text = '#4ade80' }) {
  return (
    <span style={{
      fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.05em',
      textTransform: 'uppercase', padding: '0.15rem 0.5rem',
      borderRadius: '0.25rem', background: color, color: text,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

export default function DashboardCard() {
  const divider = '1px solid rgba(255,255,255,0.05)';

  return (
    <div style={{
      width: '100%', maxWidth: '28rem',
      background: 'rgba(10,10,18,0.85)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '0.625rem',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: '0.8125rem',
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    }}>
      {/* Window chrome */}
      <div style={{
        padding: '0.625rem 1rem',
        borderBottom: divider,
        background: 'rgba(255,255,255,0.02)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
          dashboard — Clouded Basement
        </span>
      </div>

      {/* Server status row */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: divider, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <StatusDot color="#4ade80" />
          <span style={{ color: '#fff', fontWeight: 500 }}>my-vps-prod</span>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>· 143.198.x.x</span>
        </div>
        <Badge>Running</Badge>
      </div>

      {/* Domains */}
      <div style={{ padding: '0.75rem 1.25rem', borderBottom: divider }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Domains
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {DOMAINS.map((d) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{d.name}</span>
              {d.ssl && <Badge color="rgba(96,165,250,0.12)" text="#60a5fa">SSL ✓</Badge>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent deploys */}
      <div style={{ padding: '0.75rem 1.25rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Recent Deployments
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {DEPLOYMENTS.map((d) => (
            <div key={d.repo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <StatusDot color="#4ade80" />
                <span style={{ color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.repo}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', flexShrink: 0 }}>
                  {d.branch}
                </span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', flexShrink: 0 }}>
                {d.ago}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
