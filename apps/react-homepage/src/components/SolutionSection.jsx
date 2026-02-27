import SectionHeader from './layout/SectionHeader';

const DEPLOYMENTS = [
  { name: 'my-saas-app',   date: '2/12/2026' },
  { name: 'landing-page',  date: '2/9/2026'  },
  { name: 'api-backend',   date: '2/7/2026'  },
];

const FEATURES = [
  {
    iconBg: 'rgba(59,130,246,0.10)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8V3m0 0L4 6m3-3l3 3m4 5v6m0 0l-3-3m3 3l3-3" />
      </svg>
    ),
    title: "Push to GitHub, it's live",
    body: 'Connect your repo once. Every push deploys automatically.',
  },
  {
    iconBg: 'rgba(34,197,94,0.10)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="#4ade80" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Zero-setup infrastructure',
    body: 'SSL, Nginx, Node.js, Python, Git — configured and ready in minutes.',
  },
  {
    iconBg: 'rgba(168,85,247,0.10)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="#a78bfa" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Founder support',
    body: 'Every ticket reviewed by the founder. Real answers, not bots.',
  },
  {
    iconBg: 'rgba(234,179,8,0.10)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="#facc15" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Flat, predictable pricing',
    body: 'No usage fees. No complicated tiers. Cancel anytime.',
  },
  {
    iconBg: 'rgba(249,115,22,0.10)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="#fb923c" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Updates & patches, handled',
    body: 'Security patches and server updates go out directly. No action needed.',
  },
  {
    iconBg: 'rgba(236,72,153,0.10)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="#f472b6" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Ready in 2 minutes',
    body: 'Signup to live server. No provisioning, no waiting.',
  },
];

function FeatureCard({ iconBg, icon, title, body }) {
  return (
    <div className="group funnel-feature-card rounded-2xl border border-transparent">
      <div className="relative px-8 py-7">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <h3 className="funnel-heading-3 mb-2">{title}</h3>
        <p className="funnel-body-sm">{body}</p>
      </div>
    </div>
  );
}

export default function SolutionSection() {
  return (
    <section className="funnel-section funnel-bg-solution">
      <div className="funnel-wide">

        <SectionHeader
          kicker="The Solution"
          heading={<>Managed hosting.<br />Actually&nbsp;managed.</>}
          body="Server setup, deploys, updates, and patches — all handled."
        />

        {/* Dashboard mockup */}
        <div
          className="reveal"
          style={{ maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '5rem' }}
        >
          <div style={{ overflow: 'hidden', borderRadius: '0.75rem', border: '1px solid rgba(100,140,255,0.15)', background: '#0d0d1a', boxShadow: '0 0 80px 20px rgba(59,130,246,0.12), 0 0 40px 10px rgba(139,92,246,0.08), 0 0 120px 40px rgba(34,211,238,0.06), 0 25px 60px -12px rgba(0,0,0,0.7)' }}>

            {/* Deploy from Git */}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#d1d5db' }}>Deploy from Git</p>
              <div className="flex gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-lg text-xs funnel-mono truncate" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#60a5fa' }}>
                  https://github.com/you/my-saas-app.git
                </div>
                <div className="px-4 py-2.5 rounded-lg text-xs font-semibold shrink-0" style={{ background: '#2563eb', color: 'white' }}>
                  Deploy
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#22c55e' }}></span>
                <span className="text-[10px]" style={{ color: '#6b7280' }}>Auto-deploy enabled</span>
              </div>
            </div>

            {/* Recent Deployments */}
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-semibold" style={{ color: '#d1d5db' }}>Recent Deployments</p>
            </div>

            {DEPLOYMENTS.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center justify-between px-5 py-3"
                style={i < DEPLOYMENTS.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : {}}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 text-xs" style={{ color: '#4ade80' }}>●</span>
                  <div className="min-w-0">
                    <p className="text-sm funnel-mono truncate" style={{ color: '#e5e7eb' }}>{d.name}</p>
                    <p className="text-[10px]" style={{ color: '#6b7280' }}>{d.date}</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-md text-[10px] font-medium shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                  Redeploy
                </div>
              </div>
            ))}

          </div>
          <p className="text-center mt-6 text-[11px]" style={{ color: '#4b5563' }}>
            Your deploy dashboard — paste a repo, click deploy
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 reveal-stagger">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>

      </div>
    </section>
  );
}
