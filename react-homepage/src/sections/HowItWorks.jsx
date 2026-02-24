import { useState, useEffect, useRef, useCallback } from 'react';

const CELL_BORDER = '0.5px solid rgba(255,255,255,0.07)';
const STEP_DURATION = 3500; // ms per step

// Dashboard design tokens
const BG     = '#0a0a0a';
const CARD   = '#111111';
const BORDER = '#262626';
const TEXT   = '#fafafa';
const MUTED  = '#a1a1a1';
const DIM    = '#525252';
const ACCENT = '#3b82f6';

const STEPS = [
  {
    n: '01',
    title: 'Paste your repo URL',
    body: 'Drop your GitHub, GitLab, or Bitbucket URL into the dashboard and hit Deploy. We clone, install, and serve it.',
  },
  {
    n: '02',
    title: 'Watch it build',
    body: 'Live deploy logs stream as your app is cloned, dependencies installed, and your server started. Enable auto-deploy once — every future push triggers this automatically.',
  },
  {
    n: '03',
    title: "You're live",
    body: "Your app is running. Add a custom domain, we handle SSL automatically via Let's Encrypt. The dashboard shows status, sites, and deploy history.",
  },
];

// ─── Panel 1: Deploy input ───────────────────────────────────────────────────
function DeployPanel() {
  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: DIM }}>
        Deploy from Git
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

// ─── Panel 2: Deploy logs ────────────────────────────────────────────────────
const LOG_LINES = [
  { text: '$ git clone https://github.com/alex/my-saas-app', color: DIM },
  { text: "Cloning into 'my-saas-app'...", color: MUTED },
  { text: '$ npm install', color: DIM },
  { text: 'added 312 packages in 4.2s', color: MUTED },
  { text: '$ npm start', color: DIM },
  { text: 'Server listening on port 3000', color: MUTED },
  { text: '✓ App deployed successfully', color: '#4ade80' },
];

function LogsPanel() {
  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: ACCENT, boxShadow: `0 0 5px ${ACCENT}` }} />
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: DIM }}>
          Deploying my-saas-app
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

// ─── Panel 3: Live server ────────────────────────────────────────────────────
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
          <span style={{ fontSize: '0.6875rem' }}>🔒</span>
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

// ─── Main section ────────────────────────────────────────────────────────────
export default function HowItWorks() {
  const [active, setActive]   = useState(0);
  const [tick, setTick]       = useState(0);    // changes → restarts progress bar CSS animation
  const [started, setStarted] = useState(false);
  const sectionRef = useRef(null);
  const timerRef   = useRef(null);

  const advance = useCallback((from) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActive((from + 1) % STEPS.length);
      setTick((t) => t + 1);
    }, STEP_DURATION);
  }, []);

  // Kick off when section scrolls into view
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Schedule next step whenever active/started changes
  useEffect(() => {
    if (!started) return;
    advance(active);
    return () => clearTimeout(timerRef.current);
  }, [active, started, advance]);

  const handleClick = (i) => {
    clearTimeout(timerRef.current);
    setActive(i);
    setTick((t) => t + 1);
    if (!started) setStarted(true);
    advance(i);
  };

  return (
    <section ref={sectionRef} className="border-b-faint">
      {/* Title row */}
      <div style={{ padding: '6rem 2.5rem 4rem', borderBottom: CELL_BORDER }}>
        <div style={{ maxWidth: '36rem' }}>
          <p className="funnel-kicker mb-3">How it works</p>
          <h2 className="funnel-heading-2">Three steps to live</h2>
        </div>
      </div>

      {/* Two-col: steps + panel */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Steps */}
        <div className="border-r-faint" style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column' }}>
          {STEPS.map((step, i) => {
            const isActive = active === i;
            return (
              <div
                key={step.n}
                onClick={() => handleClick(i)}
                style={{
                  position: 'relative',
                  display: 'flex', gap: '1.25rem',
                  padding: '1.5rem 0',
                  borderBottom: i < STEPS.length - 1 ? CELL_BORDER : 'none',
                  cursor: 'pointer',
                  opacity: isActive ? 1 : 0.4,
                  transition: 'opacity 300ms ease',
                }}
              >
                {/* Step number circle */}
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '50%', flexShrink: 0,
                  border: isActive ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.1)',
                  background: isActive ? `${ACCENT}18` : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6875rem', fontWeight: 700,
                  color: isActive ? ACCENT : DIM,
                  transition: 'all 300ms ease',
                }}>
                  {step.n}
                </div>

                {/* Text */}
                <div style={{ paddingTop: '0.3rem' }}>
                  <h3 className="funnel-heading-3 mb-2">{step.title}</h3>
                  <p className="funnel-body-sm" style={{ color: '#6b7280' }}>{step.body}</p>
                </div>

                {/* Progress bar — fills over STEP_DURATION, re-keyed on each tick to restart */}
                {isActive && started && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '1.5px', overflow: 'hidden',
                  }}>
                    <div
                      key={`${i}-${tick}`}
                      style={{
                        height: '100%',
                        background: ACCENT,
                        animation: `hiw-progress ${STEP_DURATION}ms linear forwards`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Panel */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PanelChrome activeIdx={active} />
        </div>
      </div>
    </section>
  );
}
