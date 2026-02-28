import SectionTitle from '../components/SectionTitle';
import IntegrationsCarousel from '../components/IntegrationsCarousel';
import { featuresData } from '../data/featuresData';

function FeatureCell({ Icon, title, body }) {
  return (
    <div className="feature-cell p-10">
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-blue-400 mb-5"
           style={{ background: 'rgba(96,165,250,0.08)' }}>
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
      <div className="pt-28 pb-20 px-10 border-b-dim">
        <SectionTitle
          text1="What you get"
          text2="Everything a production app needs. Nothing it doesn't."
        />
      </div>

      {/* 4-col feature grid with inline border-right dividers */}
      <div className="features-grid">
        {featuresData.map((feat) => (
          <FeatureCell key={feat.title} {...feat} />
        ))}
      </div>

      {/* Integrations carousel strip */}
      <div className="border-t-dim pt-6 pb-5">
        <p className="funnel-mono text-[11px] font-semibold tracking-widest uppercase text-center mb-4"
           style={{ color: 'rgba(255,255,255,0.3)' }}>
          Trusted integrations
        </p>
        <IntegrationsCarousel />
      </div>
    </section>
  );
}
