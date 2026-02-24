// Replica of the actual Clouded Basement dashboard layout
// Colors match CSS variables in global.css:
//   --dash-bg-elevated: #111111  --dash-card-border: #262626
//   --dash-accent: #3b82f6       --dash-text-secondary: #a1a1a1

const BG        = '#0a0a0a';
const CARD_BG   = '#111111';
const BORDER    = '#262626';
const TEXT      = '#fafafa';
const MUTED     = '#a1a1a1';
const DIM       = '#525252';
const ACCENT    = '#3b82f6';

// Nav icons (simplified path data matching real dashboard SVGs)
const NAV = [
  {
    label: 'Overview', active: true,
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-1a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" /></svg>,
  },
  {
    label: 'Sites',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  },
  {
    label: 'Deploy',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  },
  {
    label: 'Dev Tools',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  },
  {
    label: 'Settings',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
];

function Row({ label, value, valueColor }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.5rem 0', borderBottom: `1px solid ${BORDER}`,
    }}>
      <span style={{ fontSize: '0.75rem', color: DIM }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', color: valueColor || TEXT, fontFamily: "'Inter', system-ui, sans-serif" }}>{value}</span>
    </div>
  );
}

export default function DashboardCard() {
  return (
    <div style={{
      width: '100%', maxWidth: '32rem',
      background: BG,
      border: `1px solid ${BORDER}`,
      borderRadius: '0.625rem',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      userSelect: 'none',
    }}>
      {/* Browser chrome */}
      <div style={{
        padding: '0.5rem 0.875rem',
        background: '#0d0d0d',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#3a3a3a' }} />
        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#3a3a3a' }} />
        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#3a3a3a' }} />
        <span style={{ marginLeft: '0.5rem', color: DIM, fontSize: '0.6875rem' }}>
          dashboard.cloudedbasement.ca
        </span>
      </div>

      {/* Dashboard grid: sidebar + main */}
      <div style={{ display: 'flex', minHeight: '18rem' }}>

        {/* Sidebar */}
        <aside style={{
          width: '10rem', flexShrink: 0,
          borderRight: `1px solid ${BORDER}`,
          background: '#0d0d0d',
          display: 'flex', flexDirection: 'column',
          padding: '0.875rem 0',
        }}>
          {/* User block */}
          <div style={{
            padding: '0 0.875rem 0.75rem',
            borderBottom: `1px solid ${BORDER}`,
            marginBottom: '0.5rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6875rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>J</div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: TEXT, fontWeight: 500, lineHeight: 1.2 }}>jane@dev.io</div>
              <div style={{ fontSize: '0.5625rem', color: ACCENT, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pro Plan</div>
            </div>
          </div>

          {/* Nav */}
          <nav>
            {NAV.map((item) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.875rem',
                background: item.active ? `${ACCENT}1a` : 'transparent',
                color: item.active ? ACCENT : MUTED,
                fontSize: '0.75rem',
                borderLeft: item.active ? `2px solid ${ACCENT}` : '2px solid transparent',
              }}>
                {item.icon}
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '0.875rem', background: BG, overflowX: 'hidden' }}>
          {/* Server card */}
          <div style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: '0.5rem', padding: '0.875rem',
          }}>
            {/* Card header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '0.75rem', paddingBottom: '0.75rem',
              borderBottom: `1px solid ${BORDER}`,
            }}>
              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0,
                }} />
                <span style={{ fontSize: '0.6875rem', color: '#22c55e', fontWeight: 500 }}>Online</span>
              </div>
              {/* Server name */}
              <span style={{ fontSize: '0.75rem', color: MUTED }}>my-vps-prod</span>
            </div>

            {/* Data rows */}
            <Row label="IPv4"  value="143.198.x.x"  valueColor={ACCENT} />
            <Row label="Plan"  value="PRO" />
            <Row label="Sites" value="3 / 5" />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
              <button style={{
                flex: 1, padding: '0.375rem 0', fontSize: '0.6875rem', fontWeight: 500,
                background: 'transparent', border: `1px solid ${BORDER}`,
                borderRadius: '0.375rem', color: MUTED, cursor: 'default',
              }}>Restart</button>
              <button style={{
                padding: '0.375rem 0.625rem', fontSize: '0.6875rem', fontWeight: 500,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '0.375rem', color: '#f87171', cursor: 'default',
              }}>Cancel Plan</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
