import SectionTitle from '../components/SectionTitle';
import IntegrationsCarousel from '../components/IntegrationsCarousel';
import { featuresData } from '../data/featuresData';

const CELL_BORDER = '0.5px solid rgba(255,255,255,0.07)';

function FeatureCell({ Icon, title, body }) {
  return (
    <div className="feature-cell" style={{ padding: '2.5rem' }}>
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '0.375rem',
        background: 'rgba(96,165,250,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#60a5fa', marginBottom: '1.25rem',
      }}>
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <h3 className="funnel-heading-3 mb-2">{title}</h3>
      <p className="funnel-body-sm">{body}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="border-b-faint">
      {/* Section title row */}
      <div style={{ padding: '6rem 2.5rem 4rem', borderBottom: CELL_BORDER }}>
        <SectionTitle
          text1="What you get"
          text2="Everything a production app needs. Nothing it doesn't."
          text3="We built the hosting platform we always wanted — fast deploys, zero ops overhead, and sane defaults out of the box."
        />
      </div>

      {/* 4-col feature grid with inline border-right dividers */}
      <div className="features-grid">
        {featuresData.map((feat) => (
          <FeatureCell key={feat.title} {...feat} />
        ))}
      </div>

      {/* Integrations carousel strip */}
      <div style={{ borderTop: CELL_BORDER, padding: '1.5rem 0 1.25rem' }}>
        <p style={{
          textAlign: 'center',
          fontSize: '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '1rem',
        }}>
          Trusted integrations
        </p>
        <IntegrationsCarousel />
      </div>
    </section>
  );
}
