import SectionTitle from '../components/SectionTitle';
import IntegrationsCarousel from '../components/IntegrationsCarousel';
import { featuresData } from '../data/featuresData';

const CELL_BORDER = '0.5px solid rgba(255,255,255,0.07)';

function FeatureCell({ Icon, title, body, isLast }) {
  return (
    <div style={{
      padding: '2rem 2.5rem',
      borderRight: isLast ? 'none' : CELL_BORDER,
    }}>
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
      <div style={{ padding: '4rem 2.5rem 3rem', borderBottom: CELL_BORDER }}>
        <SectionTitle
          text1="Features"
          text2="Everything you need, nothing you don't"
          text3="We built the hosting platform we always wanted — fast deploys, zero ops overhead, and sane defaults."
        />
      </div>

      {/* 4-col feature grid with inline border-right dividers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {featuresData.map((feat, i) => (
          <FeatureCell
            key={feat.title}
            {...feat}
            isLast={i === featuresData.length - 1}
          />
        ))}
      </div>

      {/* Integrations carousel strip */}
      <div style={{
        borderTop: CELL_BORDER,
        padding: '1.25rem 0',
      }}>
        <IntegrationsCarousel />
      </div>
    </section>
  );
}
