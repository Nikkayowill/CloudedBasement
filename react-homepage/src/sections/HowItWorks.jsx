import DashboardCard from '../components/DashboardCard';

const CELL_BORDER = '0.5px solid rgba(255,255,255,0.07)';

const STEPS = [
  {
    n: '01',
    title: 'Connect your repo',
    body: 'Link your GitHub repository from the dashboard. Takes 30 seconds — no config files, no YAML.',
  },
  {
    n: '02',
    title: 'Push to main',
    body: 'Every push to your main branch triggers a fresh build and deploys your app automatically.',
  },
  {
    n: '03',
    title: "You're live",
    body: 'Your app is running behind Nginx with SSL and a custom domain. Check the dashboard for logs and status.',
  },
];

export default function HowItWorks() {
  return (
    <section className="border-b-faint">
      {/* Section title row */}
      <div style={{ padding: '6rem 2.5rem 4rem', borderBottom: CELL_BORDER }}>
        <div style={{ maxWidth: '36rem' }}>
          <p className="funnel-kicker mb-3">How it works</p>
          <h2 className="funnel-heading-2">Three steps to live</h2>
        </div>
      </div>

      {/* Two-col: steps left, dashboard right */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Steps */}
        <div className="border-r-faint" style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {STEPS.map((step, i) => (
            <div key={step.n} style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Step number + connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                  border: CELL_BORDER,
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: '0.75rem', fontWeight: 700,
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.02em',
                  flexShrink: 0,
                }}>
                  {step.n}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: '1px', flex: 1, minHeight: '2rem', background: 'rgba(255,255,255,0.05)', marginTop: '0.5rem' }} />
                )}
              </div>
              {/* Text */}
              <div style={{ paddingTop: '0.25rem' }}>
                <h3 className="funnel-heading-3 mb-2">{step.title}</h3>
                <p className="funnel-body-sm" style={{ color: '#6b7280' }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div style={{
          padding: '3rem 2.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <DashboardCard />
        </div>
      </div>
    </section>
  );
}
