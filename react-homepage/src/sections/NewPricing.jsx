import SectionTitle from '../components/SectionTitle';
import { pricingData } from '../data/pricingData';

const CELL_BORDER = '0.5px solid rgba(255,255,255,0.07)';

function PricingCell({ id, name, desc, price, period, features, popular, isLast }) {
  return (
    <div style={{
      padding: '3rem 2rem',
      borderRight: isLast ? 'none' : CELL_BORDER,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      background: popular ? 'rgba(37,99,235,0.04)' : 'transparent',
    }}>
      {popular && <span className="funnel-badge">Most Popular</span>}

      <h3 className={`funnel-heading-3 mb-1${popular ? ' mt-3' : ''}`}>{name}</h3>
      <p className="funnel-body-sm mb-5" style={{ color: '#6b7280' }}>{desc}</p>

      <p className="mb-1">
        <span style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff' }}>
          {price}
        </span>
        <span className="funnel-body-sm" style={{ color: '#6b7280', marginLeft: '0.25rem' }}>{period}</span>
      </p>
      <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '1.5rem' }}>3-day free trial</p>

      <ul className="flex flex-col gap-2 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="funnel-body-sm flex items-center gap-2" style={popular ? { color: '#d1d5db' } : {}}>
            <span style={{ color: '#4ade80', fontSize: '9px', flexShrink: 0 }}>●</span>
            {f}
          </li>
        ))}
      </ul>

      <a
        href={`/pay?plan=${id}&interval=monthly`}
        className={`funnel-btn ${popular ? 'funnel-btn-primary' : 'funnel-btn-subtle'} w-full`}
        style={{ textAlign: 'center' }}
      >
        Deploy {name}
      </a>
    </div>
  );
}

export default function NewPricing() {
  return (
    <section id="pricing" className="border-b-faint">
      {/* Section title row */}
      <div style={{ padding: '6rem 2.5rem 4rem', borderBottom: CELL_BORDER }}>
        <SectionTitle
          text1="Pricing"
          text2="One price. No surprises."
          text3="Transparent pricing with no hidden fees. Cancel anytime."
        />
      </div>

      {/* 3-col pricing grid with inline border-right dividers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {pricingData.map((plan, i) => (
          <PricingCell
            key={plan.id}
            {...plan}
            isLast={i === pricingData.length - 1}
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
