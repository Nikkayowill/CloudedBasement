import { useState, useEffect, useRef } from 'react';

// Dashboard design tokens
const BG = '#0a0a0a';
const CARD = '#111111';
const BORDER = '#262626';
const TEXT = '#fafafa';
const MUTED = '#a1a1a1';
const DIM = '#525252';
const ACCENT = '#3b82f6';

const STEPS = [
  {
    n: '01',
    title: 'Connect your Git repository',
    body: 'Paste your GitHub repo URL, choose your branch, and start deploy. We handle server setup, dependencies, and web server configuration.',
  },
  {
    n: '02',
    title: 'Automate cloud server deploys',
    body: 'Watch real-time build logs while your app installs and boots. Enable auto-deploy once and every push ships to your managed VPS.',
  },
  {
    n: '03',
    title: 'Go live with full control',
    body: 'Your app is online. Add domains, enable SSL, host WordPress, and manage everything from one dashboard with full SSH and root access.',
  },
];

function DeployPanel() {
  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: DIM }}>
        Git-based deployment
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          readOnly
          value="https://github.com/alex/my-saas-app.git"
          style={{
            flex: 1, padding: '0.5rem 0.75rem', minWidth: 0,
            background: BG, border: `1px solid ${BORDER}`,
            borderRadius: '0.375rem', color: MUTED,
            fontSize: '0.6875rem', fontFamily: 'monospace', outline: 'none',
          }}
        />
        <button style={{
          padding: '0.5rem 1rem', flexShrink: 0,
          background: ACCENT, border: 'none',
          borderRadius: '0.375rem', color: '#fff',
          fontSize: '0.75rem', fontWeight: 600, cursor: 'default',
        }}>Deploy</button>
      </div>
      <p style={{ fontSize: '0.6875rem', color: DIM }}>
        Works with GitHub, GitLab, and Bitbucket.
      </p>
    </div>
  );
}

const LOG_LINES = [
  { text: '$ git clone https://github.com/alex/my-saas-app', color: DIM },
  { text: "Cloning into 'my-saas-app'...", color: MUTED },
  { text: '$ npm install', color: DIM },
  { text: 'added 312 packages in 4.2s', color: MUTED },
  { text: '$ npm start', color: DIM },
  { text: 'Server listening on port 3000', color: MUTED },
  { text: 'App deployed successfully', color: '#4ade80' },
];

function LogsPanel() {
  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: ACCENT, boxShadow: `0 0 5px ${ACCENT}` }} />
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: DIM }}>
          Deploying managed VPS app
        </p>
      </div>
      <div style={{
        background: BG, border: `1px solid ${BORDER}`,
        borderRadius: '0.375rem', padding: '0.75rem',
        fontFamily: 'monospace', fontSize: '0.6875rem', lineHeight: 1.8,
        display: 'flex', flexDirection: 'column',
      }}>
        {LOG_LINES.map((line, i) => (
          <span key={i} style={{ color: line.color }}>{line.text}</span>
        ))}
      </div>
    </div>
  );
}

function LivePanel() {
  const rowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.45rem 0', borderBottom: `1px solid ${BORDER}`,
  };
  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ fontSize: '0.6875rem', color: '#22c55e', fontWeight: 600 }}>Online</span>
        </div>
        <span style={{ fontSize: '0.6875rem', color: DIM }}>my-saas-app</span>
      </div>
      <div style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={rowStyle}>
          <span style={{ fontSize: '0.6875rem', color: DIM }}>IPv4</span>
          <span style={{ fontSize: '0.75rem', color: ACCENT, fontFamily: 'monospace' }}>143.198.x.x</span>
        </div>
        <div style={rowStyle}>
          <span style={{ fontSize: '0.6875rem', color: DIM }}>Plan</span>
          <span style={{ fontSize: '0.75rem', color: TEXT }}>PRO</span>
        </div>
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <span style={{ fontSize: '0.6875rem', color: DIM }}>Sites</span>
          <span style={{ fontSize: '0.75rem', color: TEXT }}>1 / 5</span>
        </div>
      </div>
      <div style={{
        background: BG, border: `1px solid ${BORDER}`,
        borderRadius: '0.375rem', padding: '0.5rem 0.75rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.6875rem' }}>SSL</span>
          <span style={{ fontSize: '0.75rem', color: TEXT }}>myapp.com</span>
        </div>
        <span style={{ fontSize: '0.625rem', color: '#22c55e', fontWeight: 600 }}>SSL active</span>
      </div>
    </div>
  );
}

const PANELS = [DeployPanel, LogsPanel, LivePanel];

function PanelChrome({ activeIdx }) {
  const Panel = PANELS[activeIdx];
  return (
    <div style={{
      width: '100%', maxWidth: '28rem',
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: '0.625rem', overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        padding: '0.5rem 0.875rem', background: '#0d0d0d',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: '0.375rem',
      }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#3a3a3a' }} />
        ))}
        <span style={{ marginLeft: '0.5rem', color: DIM, fontSize: '0.6875rem' }}>
          dashboard.cloudedbasement.ca
        </span>
      </div>
      <Panel />
    </div>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      if (window.innerWidth < 768) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const sectionH = sectionRef.current.offsetHeight;
      const vh = window.innerHeight;
      const scrolled = -rect.top;
      const scrollable = sectionH - vh;
      if (scrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, scrolled / scrollable));
      const step = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
      setActive(step);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="hiw-section">
      <div className="hiw-sticky border-b-faint" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="pt-14 px-10 pb-10 border-b-dim shrink-0" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Chess background image */}
          <img
            src="/Images/chess-example.png"
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
              zIndex: 0,
            }}
          />
          <p className="funnel-kicker mb-3" style={{ position: 'relative', zIndex: 1 }}>How it works</p>
          <h2 className="funnel-heading-2" style={{ position: 'relative', zIndex: 1 }}>Up and running in three steps.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ flex: 1, minHeight: 0 }}>
          <div className="border-r-faint py-8 px-10 flex flex-col justify-center">
            {STEPS.map((step, i) => {
              const isActive = active === i;
              return (
                <div
                  key={step.n}
                  onClick={() => setActive(i)}
                  className={`flex gap-5 py-8 cursor-pointer${i < STEPS.length - 1 ? ' border-b-dim' : ''}`}
                  style={{
                    opacity: isActive ? 1 : 0.35,
                    transition: 'opacity 400ms ease',
                  }}
                >
                  <div style={{
                    width: '2.25rem', height: '2.25rem', borderRadius: '50%', flexShrink: 0,
                    border: isActive ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.1)',
                    background: isActive ? `${ACCENT}18` : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700,
                    color: isActive ? ACCENT : DIM,
                    transition: 'all 400ms ease',
                  }}>
                    {step.n}
                  </div>
                  <div style={{ paddingTop: '0.3rem' }}>
                    <h3 className="funnel-heading-3 mb-2">{step.title}</h3>
                    <p className="funnel-body-sm text-gray-500">{step.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="py-8 px-10 flex items-center justify-center">
            <PanelChrome activeIdx={active} />
          </div>
        </div>
      </div>
    </section>
  );
}
