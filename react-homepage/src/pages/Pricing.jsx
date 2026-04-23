import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { pricingData } from '../data/pricingData';

function Check() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M2.5 7L5.5 10L11.5 4" stroke="#4ade80" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanCard({ id, name, desc, monthly, yearly, features, adds, popular, interval }) {
  const active = interval === 'yearly' ? yearly : monthly;
  return (
    <div style={{
      flex: '1 1 260px',
      maxWidth: '340px',
      background: popular ? 'rgba(37,99,235,0.06)' : 'rgba(255,255,255,0.02)',
      border: popular ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '0.75rem',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {popular && (
        <span style={{
          position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)',
          background: '#3b82f6', color: '#fff',
          fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.07em',
          padding: '0.2rem 0.75rem', borderRadius: '999px', whiteSpace: 'nowrap',
        }}>
          MOST POPULAR
        </span>
      )}

      <p className="funnel-heading-3 mb-1">{name}</p>
      <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '1.5rem' }}>{desc}</p>

      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '2.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {active.price}
        </span>
        <span style={{ fontSize: '0.8125rem', color: '#6b7280', marginLeft: '0.25rem' }}>{active.period}</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: interval === 'yearly' ? '#4ade80' : '#4b5563', marginBottom: '1.75rem', minHeight: '1rem' }}>
        {interval === 'yearly' ? `${active.perMonth}/mo · 2 months free` : '3-day free trial'}
      </p>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem', flex: 1 }}>
        {features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#d1d5db' }}>
            <Check />{f}
          </li>
        ))}
        {adds?.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#93c5fd' }}>
            <Check />{f}
          </li>
        ))}
      </ul>

      <a
        href={`/checkout?plan=${id}&interval=${interval}`}
        className={`funnel-btn ${popular ? 'funnel-btn-primary' : 'funnel-btn-subtle'} w-full text-center`}
      >
        Get {name}
      </a>
    </div>
  );
}

export default function Pricing() {
  const [interval, setInterval] = useState('monthly');
  const [trialUsed, setTrialUsed] = useState(true);
  const [trialHref, setTrialHref] = useState('/register');

  useEffect(() => {
    fetch('/api/pricing/status', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        setTrialUsed(d.trialUsed);
        setTrialHref(d.isLoggedIn ? '/dashboard' : '/register');
      })
      .catch(() => {});
  }, []);

  return (
    <PageLayout>
      <section className="cb-section">
        <div style={{ padding: 'clamp(4rem, 10vw, 7rem) clamp(1.5rem, 4vw, 4rem)', textAlign: 'center' }}>

          {/* Heading */}
          <p className="funnel-kicker mb-4">Pricing</p>
          <h1 className="funnel-heading-1 mb-4">Simple, transparent pricing.</h1>
          <p style={{ fontSize: '1rem', color: '#6b7280', maxWidth: '32rem', margin: '0 auto 2.5rem' }}>
            One server, deploy as many times as you want. No contracts.
          </p>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '3.5rem' }}>
            {['monthly', 'yearly'].map((opt) => (
              <button
                key={opt}
                onClick={() => setInterval(opt)}
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.8125rem', fontWeight: 500,
                  background: interval === opt ? 'rgba(255,255,255,0.07)' : 'transparent',
                  color: interval === opt ? '#fff' : '#6b7280',
                  border: 'none', cursor: 'pointer',
                  transition: 'background 150ms, color 150ms',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}
              >
                {opt === 'monthly' ? 'Monthly' : <>Yearly <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.12)', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>-10%</span></>}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            {pricingData.map((plan) => (
              <PlanCard key={plan.id} {...plan} interval={interval} />
            ))}
          </div>

          {/* Footer line */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            {!trialUsed && (
              <a href={trialHref} className="funnel-btn funnel-btn-primary">Start free 3-day trial</a>
            )}
            <p style={{ fontSize: '0.8125rem', color: '#4b5563' }}>
              No contracts · Full root access · Cancel anytime
            </p>
          </div>

        </div>
      </section>
    </PageLayout>
  );
}
