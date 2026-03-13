// Replica UI mockups — faithful to the real Clouded Basement dashboard.
// Responsive: icon-only sidebar, fluid width, no fixed heights.

const D = {
  bgBase:    '#000000',
  bg:        '#0a0a0a',
  bgElevated:'#111111',
  bgSurface: '#161616',
  border:    '#262626',
  borderFaint:'#1c1c1c',
  text:      '#fafafa',
  textSec:   '#a1a1a1',
  textMuted: '#525252',
  accent:    '#3b82f6',
  accentBg:  'rgba(59,130,246,0.1)',
  success:   '#22c55e',
  successBg: 'rgba(34,197,94,0.1)',
  warning:   '#eab308',
  warningBg: 'rgba(234,179,8,0.1)',
  danger:    '#ef4444',
  dangerBg:  'rgba(239,68,68,0.08)',
};

// ─── Shell (browser chrome wrapper) ──────────────────────────────────────────

function Shell({ url, children }) {
  return (
    <div style={{
      width: '100%',
      background: D.bgBase,
      border: `1px solid ${D.border}`,
      borderRadius: 12,
      overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: 12,
      lineHeight: '1.5',
      userSelect: 'none',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>
      {/* Chrome bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 14px',
        background: D.bgSurface,
        borderBottom: `1px solid ${D.border}`,
      }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
        <div style={{
          flex: 1,
          margin: '0 8px',
          padding: '3px 10px',
          background: D.bg,
          border: `1px solid ${D.border}`,
          borderRadius: 6,
          color: D.textMuted,
          fontSize: 10,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 280,
        }}>
          {url}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Sidebar — icon-only, 44px wide ──────────────────────────────────────────

const NAV = [
  { id: 'overview',  d: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-1a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z' },
  { id: 'sites',     d: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
  { id: 'deploy',    d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { id: 'dev-tools', d: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { id: 'settings',  d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

function Sidebar({ active }) {
  return (
    <aside style={{
      width: 44,
      flexShrink: 0,
      background: D.bgBase,
      borderRight: `1px solid ${D.border}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 0',
      gap: 2,
    }}>
      {/* Avatar */}
      <div style={{
        width: 26, height: 26,
        borderRadius: '50%',
        background: D.accent,
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 11,
        marginBottom: 10,
      }}>A</div>

      {NAV.map(item => {
        const isActive = item.id === active;
        return (
          <div key={item.id} style={{
            width: 32, height: 32,
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isActive ? D.accentBg : 'transparent',
            color: isActive ? D.accent : D.textMuted,
          }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={item.d} />
            </svg>
          </div>
        );
      })}
    </aside>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div style={{
      background: D.bgElevated,
      border: `1px solid ${D.border}`,
      borderRadius: 10,
      padding: '14px 16px',
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, aside }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 12,
      paddingBottom: 10,
      borderBottom: `1px solid ${D.borderFaint}`,
    }}>
      <span style={{ color: D.text, fontWeight: 600, fontSize: 12 }}>{title}</span>
      {aside}
    </div>
  );
}

function DataRow({ label, value, valueColor, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 0',
      borderBottom: last ? 'none' : `1px solid ${D.borderFaint}`,
    }}>
      <span style={{ color: D.textMuted, fontSize: 11 }}>{label}</span>
      <span style={{ color: valueColor || D.textSec, fontSize: 11, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function Btn({ children, variant = 'secondary', style }) {
  const v = {
    primary:   { background: D.accent,    color: '#fff',       border: 'none',                   fontWeight: 600 },
    secondary: { background: D.bgSurface, color: D.textSec,    border: `1px solid ${D.border}`,  fontWeight: 500 },
    danger:    { background: D.dangerBg,  color: D.danger,     border: `1px solid ${D.danger}30`, fontWeight: 500 },
  }[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '5px 11px',
      borderRadius: 6,
      fontSize: 11,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      flexShrink: 0,
      ...v,
      ...style,
    }}>
      {children}
    </span>
  );
}

function Badge({ children, color = 'success' }) {
  const colors = {
    success: { bg: D.successBg, text: D.success },
    warning: { bg: D.warningBg, text: D.warning },
    accent:  { bg: D.accentBg,  text: D.accent  },
    danger:  { bg: D.dangerBg,  text: D.danger  },
  }[color];
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 99,
      fontSize: 10, fontWeight: 600,
      background: colors.bg, color: colors.text,
    }}>
      {children}
    </span>
  );
}

function InputRow({ placeholder, btnLabel, btnVariant = 'primary', hint }) {
  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{
          flex: 1,
          padding: '7px 10px',
          background: D.bg,
          border: `1px solid ${D.border}`,
          borderRadius: 7,
          color: D.textMuted,
          fontSize: 11,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}>
          {placeholder}
        </div>
        <Btn variant={btnVariant}>{btnLabel}</Btn>
      </div>
      {hint && (
        <p style={{ color: D.textMuted, fontSize: 10, margin: '6px 0 0', lineHeight: 1.5 }}>{hint}</p>
      )}
    </>
  );
}

// ─── Dashboard — Overview ─────────────────────────────────────────────────────

export function DashboardMockup() {
  return (
    <Shell url="app.cloudedbasement.com/dashboard">
      <div style={{ display: 'flex', background: D.bg }}>
        <Sidebar active="overview" />
        <main style={{ flex: 1, minWidth: 0, padding: '14px 14px' }}>
          <Card>
            <CardHeader
              title="basement-core"
              aside={
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: D.success, fontWeight: 500 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: D.success,
                    boxShadow: `0 0 6px ${D.success}`,
                    display: 'inline-block', flexShrink: 0,
                  }} />
                  Online
                </span>
              }
            />
            <DataRow label="IPv4"  value="143.198.167.42" valueColor={D.accent} />
            <DataRow label="Plan"  value="PRO" />
            <DataRow label="Sites" value="2 / 5" last />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <Btn variant="secondary">Restart</Btn>
              <Btn variant="danger">Cancel Plan</Btn>
            </div>
          </Card>
        </main>
      </div>
    </Shell>
  );
}

// ─── Deploy from Git ──────────────────────────────────────────────────────────

export function DeployMockup() {
  return (
    <Shell url="app.cloudedbasement.com/dashboard — Deploy">
      <div style={{ display: 'flex', background: D.bg }}>
        <Sidebar active="deploy" />
        <main style={{ flex: 1, minWidth: 0, padding: '14px 14px' }}>
          <Card>
            <CardHeader title="Deploy from Git" />
            <InputRow
              placeholder="https://github.com/username/repo.git"
              btnLabel="Deploy"
              hint="Paste your GitHub repository URL to deploy automatically."
            />
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${D.borderFaint}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ color: D.text, fontWeight: 600, fontSize: 12 }}>Auto-Deploy</span>
                <Badge color="success">Enabled</Badge>
              </div>
              <p style={{ color: D.textMuted, fontSize: 10, margin: 0, lineHeight: 1.5 }}>
                Push to <code style={{ color: D.accent, fontFamily: 'monospace' }}>main</code> to trigger a deploy automatically.
              </p>
            </div>
          </Card>
        </main>
      </div>
    </Shell>
  );
}

// ─── Sites — Domains & SSL ────────────────────────────────────────────────────

const DEMO_DOMAINS = [
  { domain: 'myapp.com',         ssl: true  },
  { domain: 'api.myapp.com',     ssl: true  },
  { domain: 'staging.myapp.com', ssl: false },
];

export function DomainsMockup() {
  return (
    <Shell url="app.cloudedbasement.com/dashboard — Sites">
      <div style={{ display: 'flex', background: D.bg }}>
        <Sidebar active="sites" />
        <main style={{ flex: 1, minWidth: 0, padding: '14px 14px' }}>
          <Card>
            <CardHeader title="Your Sites" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {DEMO_DOMAINS.map(d => (
                <div key={d.domain} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: D.bg,
                  border: `1px solid ${D.borderFaint}`,
                  borderRadius: 7,
                  gap: 8,
                  minWidth: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 12, flexShrink: 0 }}>{d.ssl ? '🔒' : '⚠️'}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        color: D.text, fontWeight: 500, fontSize: 11,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {d.domain}
                      </div>
                      <div style={{ color: d.ssl ? D.success : D.warning, fontSize: 10 }}>
                        {d.ssl ? 'SSL active' : 'Waiting for SSL'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {!d.ssl && <Btn variant="secondary">Enable SSL</Btn>}
                    <Btn variant="danger">Remove</Btn>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 12, borderTop: `1px solid ${D.borderFaint}` }}>
              <InputRow
                placeholder="yourdomain.com"
                btnLabel="Add Domain"
                hint={<>Point your A record to <code style={{ color: D.accent, fontFamily: 'monospace' }}>143.198.167.42</code> first.</>}
              />
            </div>
          </Card>
        </main>
      </div>
    </Shell>
  );
}

// ─── Billing — mirrors the real /pay checkout page ───────────────────────────

export function BillingMockup() {
  return (
    <Shell url="cloudedbasement.com/pay?plan=pro">
      <div style={{ padding: '16px', maxWidth: 360, margin: '0 auto' }}>

        {/* Plan header */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{
            display: 'inline-block',
            padding: '3px 12px',
            background: D.accentBg,
            border: `1px solid ${D.accent}40`,
            borderRadius: 99,
            color: D.accent,
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 8,
          }}>
            Monthly Billing
          </div>
          <div style={{ color: D.text, fontWeight: 700, fontSize: 20, lineHeight: 1 }}>Pro</div>
          <div style={{ color: D.textMuted, fontSize: 11, marginTop: 3 }}>Best Value · For production apps</div>
        </div>

        {/* Price + perks box */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: `1px solid ${D.border}`,
          borderRadius: 9,
          padding: '14px 16px',
          marginBottom: 14,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${D.border}` }}>
            <div style={{ color: D.accent, fontWeight: 700, fontSize: 28, lineHeight: 1 }}>
              $35<span style={{ color: D.textMuted, fontSize: 14, fontWeight: 400 }}>/month</span>
            </div>
            <div style={{ color: D.textMuted, fontSize: 10, marginTop: 4 }}>
              Early Adopter price · was $60 · locked for life
            </div>
          </div>
          {[
            'Billed monthly starting today',
            'Cancel anytime — no contracts',
            'Instant server activation after payment',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 7 }}>
              <span style={{ color: D.accent, fontWeight: 700, fontSize: 13, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ color: D.textSec, fontSize: 11, lineHeight: 1.4 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Stripe card fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          {[
            { label: 'Cardholder Name', value: 'Alex Johnson', mono: false },
            { label: 'Card Number',     value: '4242  4242  4242  4242', mono: true  },
          ].map(f => (
            <div key={f.label}>
              <div style={{ color: D.textSec, fontSize: 11, fontWeight: 600, marginBottom: 5 }}>{f.label}</div>
              <div style={{
                padding: '10px 12px',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid #404040`,
                borderRadius: 7,
                color: f.mono ? D.textSec : D.textSec,
                fontSize: 12,
                fontFamily: f.mono ? 'monospace' : 'inherit',
                letterSpacing: f.mono ? '0.1em' : 'normal',
              }}>
                {f.value}
              </div>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Expiry Date', value: '12 / 27' },
              { label: 'CVC',        value: '···' },
            ].map(f => (
              <div key={f.label}>
                <div style={{ color: D.textSec, fontSize: 11, fontWeight: 600, marginBottom: 5 }}>{f.label}</div>
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid #404040`,
                  borderRadius: 7,
                  color: D.textSec, fontSize: 12,
                  fontFamily: 'monospace',
                }}>
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div style={{
          padding: '11px 0',
          background: D.accent,
          borderRadius: 7,
          color: '#fff', fontWeight: 700, fontSize: 13,
          textAlign: 'center',
          marginBottom: 10,
        }}>
          Complete Payment
        </div>

        <div style={{ color: D.textMuted, fontSize: 10, textAlign: 'center' }}>
          Powered by Stripe · Secure SSL encryption
        </div>
      </div>
    </Shell>
  );
}

// ─── Settings — Server Updates + Support Ticket ───────────────────────────────

export function SupportMockup() {
  return (
    <Shell url="app.cloudedbasement.com/dashboard — Settings">
      <div style={{ display: 'flex', background: D.bg }}>
        <Sidebar active="settings" />
        <main style={{ flex: 1, minWidth: 0, padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Server Updates */}
          <Card>
            <CardHeader
              title="Server Updates"
              aside={
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 5,
                  background: D.successBg, color: D.success,
                  fontSize: 10, fontWeight: 700,
                }}>
                  <svg width="10" height="10" fill="none" stroke={D.success} strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Up to date
                </span>
              }
            />
            <p style={{ color: D.textMuted, fontSize: 11, margin: 0, lineHeight: 1.5 }}>
              Your server is running the latest patches and configurations.
            </p>
          </Card>

          {/* Support Ticket */}
          <Card>
            <CardHeader title="Submit a Support Ticket" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Subject',     value: 'Help with custom Nginx config' },
                { label: 'Priority',    value: 'Normal' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ color: D.textMuted, fontSize: 10, marginBottom: 4 }}>{f.label}</div>
                  <div style={{
                    padding: '6px 10px',
                    background: D.bg,
                    border: `1px solid ${D.border}`,
                    borderRadius: 6,
                    color: f.label === 'Priority' ? D.textMuted : D.textSec,
                    fontSize: 11,
                  }}>
                    {f.value}
                  </div>
                </div>
              ))}
              <Btn variant="primary" style={{ alignSelf: 'flex-start', marginTop: 2 }}>
                Send Ticket
              </Btn>
            </div>
          </Card>

        </main>
      </div>
    </Shell>
  );
}
