import SectionTitle from '../components/SectionTitle';
import IntegrationsCarousel from '../components/IntegrationsCarousel';
import { featuresData } from '../data/featuresData';

function FeatureCell({ Icon, title, body }) {
  return (
    <div className="p-10">
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-blue-400 mb-5 bg-blue-400/10">
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <h3 className="funnel-heading-3 mb-2">{title}</h3>
      <p className="funnel-body-sm">{body}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features">
      <div className="cb-title-row" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="/Images/chess.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.12,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle
            text1="What you get"
            text2="Managed VPS hosting features built for startups, agencies, and developers."
          />
        </div>
      </div>

      <div className="cb-grid-cells cb-grid-cells--features">
        {featuresData.map((feat) => (
          <FeatureCell key={feat.title} {...feat} />
        ))}
      </div>

      <div className="border-t-dim pt-6 pb-5">
        <p className="funnel-mono text-[11px] font-semibold tracking-widest uppercase text-center mb-4 text-white/30">
          Automation-ready integrations
        </p>
        <IntegrationsCarousel />
      </div>
    </section>
  );
}
