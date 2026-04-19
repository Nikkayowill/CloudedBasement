import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Side projects & learning',
    monthly: 15,
    yearly: 162,
    specs: [
      { label: 'RAM',       value: '1 GB' },
      { label: 'CPU',       value: '1 vCPU' },
      { label: 'Storage',   value: '25 GB SSD' },
      { label: 'Bandwidth', value: '1 TB/mo' },
      { label: 'Sites',     value: '2' },
      { label: 'Support',   value: 'Email' },
    ],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Production apps & freelancers',
    monthly: 35,
    yearly: 378,
    specs: [
      { label: 'RAM',       value: '2 GB' },
      { label: 'CPU',       value: '2 vCPUs' },
      { label: 'Storage',   value: '60 GB SSD' },
      { label: 'Bandwidth', value: '3 TB/mo' },
      { label: 'Sites',     value: '5' },
      { label: 'Support',   value: 'Priority (12hr)', accent: true },
      { label: 'Backups',   value: 'Weekly',          accent: true },
    ],
    highlight: true,
    badge: 'BEST VALUE',
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Agencies & high-traffic',
    monthly: 65,
    yearly: 702,
    specs: [
      { label: 'RAM',       value: '4 GB' },
      { label: 'CPU',       value: '2 vCPUs' },
      { label: 'Storage',   value: '80 GB SSD' },
      { label: 'Bandwidth', value: '4 TB/mo' },
      { label: 'Sites',     value: '10' },
      { label: 'Support',   value: 'Direct access', purple: true },
      { label: 'Backups',   value: 'Daily',         purple: true },
    ],
    highlight: false,
  },
];

const FULL_FEATURES = [
  { label: 'SSH & Root Access',          basic: true,  pro: true,  premium: true  },
  { label: 'Git Deployment',             basic: true,  pro: true,  premium: true  },
  { label: 'GitHub Auto-Deploy',         basic: true,  pro: true,  premium: true  },
  { label: 'One-Click Database',         basic: true,  pro: true,  premium: true  },
  { label: 'Custom Domains',             basic: true,  pro: true,  premium: true  },
  { label: 'Automatic SSL',             basic: true,  pro: true,  premium: true  },
  { label: 'Free Subdomain',             basic: true,  pro: true,  premium: true  },
  { label: 'Environment Variables',      basic: true,  pro: true,  premium: true  },
  { label: 'Managed Security Updates',   basic: true,  pro: true,  premium: true  },
  { label: 'Weekly Backups',             basic: false, pro: true,  premium: true  },
  { label: 'Daily Backups',              basic: false, pro: false, premium: true  },
  { label: 'Priority Support',           basic: false, pro: true,  premium: true  },
  { label: 'Direct Developer Access',    basic: false, pro: false, premium: true  },
];

const STACK = [
  { icon: '🐧', name: 'Ubuntu 22.04', sub: 'LTS' },
  { icon: '🟢', name: 'Node.js 20',   sub: '+ nvm' },
  { icon: '🌐', name: 'Nginx',         sub: 'Web server' },
  { icon: '🔒', name: 'Certbot',       sub: 'Free SSL' },
  { icon: '🐍', name: 'Python 3',      sub: '+ pip' },
  { icon: '🦀', name: 'Rust',          sub: 'cargo' },
  { icon: '🐹', name: 'Go 1.21',       sub: 'golang' },
  { icon: '🔥', name: 'UFW Firewall',  sub: 'Configured' },
];

function PricingCell({ id, name, tagline, monthly, yearly, specs, highlight, badge, interval }) {
  const price    = interval === 'yearly' ? (yearly / 12).toFixed(2) : monthly;
  const subline  = interval === 'yearly'
    ? <span style={{ color: '#86efac' }}>Billed ${yearly}/yr · 2 months free</span>
    : '3-day free trial';

  return (
    <div
      className="py-12 px-8 flex flex-col relative"
      style={{ background: highlight ? 'rgba(37,99,235,0.04)' : 'transparent' }}
    >
      {badge && <span className="funnel-badge">{badge}</span>}

      <h3 className="funnel-heading-3 mb-1">{name}</h3>
      <p className="funnel-body-sm mb-5" style={{ color: '#6b7280' }}>{tagline}</p>

      <p className="mb-1">
        <span style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff' }}>
          ${price}
        </span>
        <span className="funnel-body-sm ml-1" style={{ color: '#6b7280' }}>/mo</span>
      </p>
      <p className="text-xs mb-6" style={{ color: '#4b5563', minHeight: '1.25rem' }}>{subline}</p>

      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {specs.map(({ label, value, accent, purple }) => (
          <li key={label} className="funnel-body-sm flex justify-between gap-4">
            <span style={{ color: '#6b7280' }}>{label}</span>
            <span style={{
              color: purple ? '#c084fc' : accent ? '#93c5fd' : '#fff',
              textAlign: 'right',
            }}>
              {value}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={`/checkout?plan=${id}&interval=${interval}`}
        className={`funnel-btn ${highlight ? 'funnel-btn-primary' : 'funnel-btn-subtle'} w-full`}
        style={{ justifyContent: 'center' }}
      >
        Get Started
      </a>
    </div>
  );
}

function CheckCell({ value }) {
  if (value === true)  return <span style={{ color: '#4ade80' }}>✓</span>;
  if (value === false) return <span style={{ color: '#374151' }}>—</span>;
  return <span style={{ color: '#9ca3af' }}>{value}</span>;
}

export default function Pricing() {
  const [interval, setInterval]       = useState('monthly');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [trialStatus, setTrialStatus] = useState({ isLoggedIn: false, trialUsed: false, loaded: false });

  useEffect(() => {
    fetch('/api/pricing/status', { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setTrialStatus({ ...data, loaded: true }))
      .catch(() => setTrialStatus({ isLoggedIn: false, trialUsed: false, loaded: true }));
  }, []);

  const showTrialBanner = trialStatus.loaded && !trialStatus.trialUsed;
  const trialHref       = trialStatus.isLoggedIn ? '/dashboard' : '/register';

  return (
    <PageLayout>

      {/* ── Plans ─────────────────────────────────────────────────────────── */}
      <section>
        <div className="cb-title-row">

          {/* Trial banner */}
          {showTrialBanner && (
            <div style={{
              padding: '0.875rem 1.25rem', marginBottom: '2rem',
              border: '1px solid rgba(59,130,246,0.25)', borderRadius: '0.5rem',
              background: 'rgba(37,99,235,0.06)', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <div>
                <p className="funnel-heading-3" style={{ marginBottom: '0.25rem' }}>
                  Try free for 3 days
                </p>
                <p className="funnel-body-sm">No credit card required. Get a real server instantly.</p>
              </div>
              <a href={trialHref} className="funnel-btn funnel-btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                Start Free Trial
              </a>
            </div>
          )}

          {/* Heading */}
          <p className="funnel-kicker mb-4">Pricing</p>
          <h1 className="funnel-heading-1 mb-4">Simple, transparent pricing</h1>
          <p className="funnel-body mb-2">One server, deploy as many times as you want.</p>
          <p className="funnel-body-sm mb-8" style={{ color: '#60a5fa' }}>
            I update, patch security, and back up your server for you — so you can focus on shipping.
          </p>

          {/* Billing toggle */}
          <div className="flex justify-center mt-2">
            <div className="inline-flex items-center rounded-lg overflow-hidden border-dim" style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['monthly', 'yearly'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setInterval(opt)}
                  className="py-2 px-5 flex items-center gap-2"
                  style={{
                    fontSize: '0.8125rem', fontWeight: 500,
                    background: interval === opt ? 'rgba(255,255,255,0.07)' : 'transparent',
                    color: interval === opt ? '#fff' : '#6b7280',
                    border: 'none', cursor: 'pointer',
                    transition: 'background 150ms ease, color 150ms ease',
                  }}
                  aria-pressed={interval === opt}
                >
                  {opt === 'monthly' ? 'Monthly' : (
                    <>
                      Yearly
                      <span style={{
                        fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em',
                        padding: '0.15rem 0.4rem', borderRadius: '0.2rem',
                        color: '#4ade80', background: 'rgba(74,222,128,0.12)',
                      }}>
                        SAVE 10%
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="cb-grid-cells cb-grid-cells--pricing">
          {PLANS.map((plan) => (
            <PricingCell key={plan.id} {...plan} interval={interval} />
          ))}
        </div>

        {/* Footer strip */}
        <div className="border-t-dim py-4 px-10 text-center">
          <p className="funnel-body-sm" style={{ color: '#4b5563' }}>
            No contracts. Keep full server control.{' '}
            <a href="/is-this-safe" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
              Is Clouded Basement safe?
            </a>
            {' · '}
            <a href="/compare" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
              Compare plans
            </a>
          </p>
        </div>
      </section>

      {/* ── Feature comparison ────────────────────────────────────────────── */}
      <section>
        <div className="cb-title-row">
          <button
            onClick={() => setDetailsOpen((o) => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              color: detailsOpen ? '#fff' : '#6b7280',
              transition: 'color 150ms',
            }}
            aria-expanded={detailsOpen}
          >
            <span className="funnel-heading-3">Full feature comparison</span>
            <svg
              style={{
                width: '1rem', height: '1rem', flexShrink: 0,
                transform: detailsOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 200ms ease',
              }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {detailsOpen && (
          <div className="cb-content-pad" style={{ paddingBlock: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#6b7280', fontWeight: 500 }}>Feature</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#d1d5db' }}>Basic</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#93c5fd' }}>Pro</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#c084fc' }}>Premium</th>
                </tr>
              </thead>
              <tbody>
                {FULL_FEATURES.map((f) => (
                  <tr key={f.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.625rem 1rem', color: '#9ca3af' }}>{f.label}</td>
                    <td style={{ textAlign: 'center', padding: '0.625rem 1rem' }}><CheckCell value={f.basic} /></td>
                    <td style={{ textAlign: 'center', padding: '0.625rem 1rem' }}><CheckCell value={f.pro} /></td>
                    <td style={{ textAlign: 'center', padding: '0.625rem 1rem' }}><CheckCell value={f.premium} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Pre-installed stack ────────────────────────────────────────────── */}
      <section>
        <div className="cb-title-row">
          <SectionTitle
            text1="Stack"
            text2="What's pre-installed"
            text3="Every server ships with a full developer stack, configured and ready to use."
          />
        </div>

        <div className="cb-grid-cells cb-grid-cells--features">
          {STACK.map(({ icon, name, sub }) => (
            <div key={name} style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.625rem' }}>{icon}</div>
              <p className="funnel-heading-3" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{name}</p>
              <p className="funnel-body-sm" style={{ color: '#6b7280' }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

    </PageLayout>
  );
}
