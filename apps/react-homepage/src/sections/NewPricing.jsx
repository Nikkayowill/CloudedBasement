import { useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import { pricingData } from '../data/pricingData';

const CELL_BORDER = '0.5px solid rgba(255,255,255,0.07)';

function PricingCell({ id, name, desc, monthly, yearly, features, adds, popular, isLast, interval }) {
  const active = interval === 'yearly' ? yearly : monthly;

  return (
    <div style={{
      padding: '3rem 2rem',
      borderRight: isLast ? 'none' : CELL_BORDER,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      background: popular ? 'rgba(37,99,235,0.04)' : 'transparent',
    }}>
      {popular && <span className="funnel-badge">Most Popular</span>}

      <h3 className="funnel-heading-3 mb-1">{name}</h3>
      <p className="funnel-body-sm mb-5" style={{ color: '#6b7280' }}>{desc}</p>

      <p className="mb-1">
        <span style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff' }}>
          {active.price}
        </span>
        <span className="funnel-body-sm" style={{ color: '#6b7280', marginLeft: '0.25rem' }}>{active.period}</span>
      </p>
      <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '1.5rem', minHeight: '1.25rem' }}>
        {interval === 'yearly'
          ? <span style={{ color: '#4ade80' }}>{active.perMonth}/mo — 2 months free</span>
          : '3-day free trial'}
      </p>

      <ul className="flex flex-col gap-2 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="funnel-body-sm flex items-center gap-2" style={popular ? { color: '#d1d5db' } : {}}>
            <span style={{ color: '#4ade80', fontSize: '9px', flexShrink: 0 }}>●</span>
            {f}
          </li>
        ))}

        {adds && adds.length > 0 && (
          <>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0 0.125rem' }}>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{
                fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap',
              }}>also includes</span>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
            </li>
            {adds.map((f) => (
              <li key={f} className="funnel-body-sm flex items-center gap-2" style={{ color: '#93c5fd' }}>
                <span style={{ color: '#60a5fa', fontSize: '9px', flexShrink: 0 }}>●</span>
                {f}
              </li>
            ))}
          </>
        )}
      </ul>

      <a
        href={`/pay?plan=${id}&interval=${interval}`}
        className={`funnel-btn ${popular ? 'funnel-btn-primary' : 'funnel-btn-subtle'} w-full`}
        style={{ textAlign: 'center' }}
      >
        {name}
      </a>
    </div>
  );
}

export default function NewPricing() {
  const [interval, setInterval] = useState('monthly');

  return (
    <section id="pricing" className="border-b-faint">
      {/* Section title row */}
      <div style={{ padding: '6rem 2.5rem 4rem', borderBottom: CELL_BORDER }}>
        <SectionTitle
          text1="Pricing"
          text2="One price. No surprises."
          text3="Transparent pricing with no hidden fees. Cancel anytime."
        />

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            border: CELL_BORDER, borderRadius: '0.5rem',
            overflow: 'hidden', background: 'rgba(255,255,255,0.02)',
          }}>
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
                  transition: 'background 150ms ease, color 150ms ease',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}
              >
                {opt === 'monthly' ? 'Monthly' : (
                  <>
                    Yearly
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em',
                      padding: '0.1rem 0.4rem', borderRadius: '0.25rem',
                      background: 'rgba(74,222,128,0.15)', color: '#4ade80',
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

      {/* Responsive pricing grid: stacks on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {pricingData.map((plan, i) => (
          <PricingCell
            key={plan.id}
            {...plan}
            isLast={i === pricingData.length - 1}
            interval={interval}
          />
        ))}
      </div>

      {/* Footer note */}
      <div style={{ borderTop: CELL_BORDER, padding: '1rem 2.5rem', textAlign: 'center' }}>
        <p className="funnel-body-sm" style={{ color: '#4b5563' }}>
          No contracts. Cancel anytime.{' '}
          <a href="/pricing" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Full pricing details →</a>
        </p>
      </div>
    </section>
  );
}
