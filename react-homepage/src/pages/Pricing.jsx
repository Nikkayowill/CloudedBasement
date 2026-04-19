import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Side projects & learning',
    monthly: 15,
    yearly: 162,
    specs: [
      { label: 'RAM',       value: '1 GB' },
      { label: 'CPU',       value: '1 vCPU' },
      { label: 'Storage',   value: '25 GB SSD' },
      { label: 'Bandwidth', value: '1 TB/mo' },
      { label: 'Sites',     value: '2' },
      { label: 'Support',   value: 'Email' },
    ],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Production apps & freelancers',
    monthly: 35,
    yearly: 378,
    specs: [
      { label: 'RAM',       value: '2 GB' },
      { label: 'CPU',       value: '2 vCPUs' },
      { label: 'Storage',   value: '60 GB SSD' },
      { label: 'Bandwidth', value: '3 TB/mo' },
      { label: 'Sites',     value: '5' },
      { label: 'Support',   value: 'Priority (12hr)', valueClass: 'text-blue-400' },
      { label: 'Backups',   value: 'Weekly',          valueClass: 'text-blue-400' },
    ],
    highlight: true,
    badge: 'BEST VALUE',
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Agencies & high-traffic',
    monthly: 65,
    yearly: 702,
    specs: [
      { label: 'RAM',       value: '4 GB' },
      { label: 'CPU',       value: '2 vCPUs' },
      { label: 'Storage',   value: '80 GB SSD' },
      { label: 'Bandwidth', value: '4 TB/mo' },
      { label: 'Sites',     value: '10' },
      { label: 'Support',   value: 'Direct access', valueClass: 'text-purple-400' },
      { label: 'Backups',   value: 'Daily',         valueClass: 'text-purple-400' },
    ],
    highlight: false,
  },
];

const FULL_FEATURES = [
  { label: 'SSH & Root Access',          basic: '✓', pro: '✓', premium: '✓' },
  { label: 'Git Deployment',             basic: '✓', pro: '✓', premium: '✓' },
  { label: 'GitHub Auto-Deploy',         basic: '✓', pro: '✓', premium: '✓' },
  { label: 'One-Click Database',         basic: '✓', pro: '✓', premium: '✓' },
  { label: 'Custom Domains',             basic: '✓', pro: '✓', premium: '✓' },
  { label: 'Automatic SSL',              basic: '✓', pro: '✓', premium: '✓' },
  { label: 'Free Subdomain',             basic: '✓', pro: '✓', premium: '✓' },
  { label: 'Environment Variables',      basic: '✓', pro: '✓', premium: '✓' },
  { label: 'Managed Security Updates',   basic: '✓', pro: '✓', premium: '✓' },
  { label: 'Weekly Backups',             basic: '—', pro: '✓', premium: '✓' },
  { label: 'Daily Backups',              basic: '—', pro: '—', premium: '✓' },
  { label: 'Priority Support',           basic: '—', pro: '✓', premium: '✓' },
  { label: 'Direct Developer Access',    basic: '—', pro: '—', premium: '✓' },
];

const STACK = [
  { icon: '🐧', name: 'Ubuntu 22.04', sub: 'LTS' },
  { icon: '🟢', name: 'Node.js 20',   sub: '+ nvm' },
  { icon: '🌐', name: 'Nginx',         sub: 'Web server' },
  { icon: '🔒', name: 'Certbot',       sub: 'Free SSL' },
  { icon: '🐍', name: 'Python 3',      sub: '+ pip' },
  { icon: '🦀', name: 'Rust',          sub: 'cargo' },
  { icon: '🐹', name: 'Go 1.21',       sub: 'golang' },
  { icon: '🔥', name: 'UFW Firewall',  sub: 'Configured' },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [trialStatus, setTrialStatus] = useState({ isLoggedIn: false, trialUsed: false, loaded: false });

  useEffect(() => {
    fetch('/api/pricing/status', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch trial status');
        return r.json();
      })
      .then((data) => setTrialStatus({ ...data, loaded: true }))
      .catch(() => setTrialStatus({ isLoggedIn: false, trialUsed: false, loaded: true }));
  }, []);

  const showTrialBanner = trialStatus.loaded && !trialStatus.trialUsed;
  const trialHref = trialStatus.isLoggedIn ? '/dashboard' : '/register';

  return (
    <PageLayout>
        {/* Pricing hero + cards */}
        <section className="funnel-section funnel-bg-trust">
          <div className="funnel-wide">

            {/* Trial banner */}
            {showTrialBanner && (
              <div className="bg-linear-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/40 rounded-xl p-6 text-center mb-12">
                <span className="funnel-heading-3 block mb-2">Try Free for 3 Days</span>
                <p className="funnel-body-sm mb-4">No credit card required. Get a real server instantly.</p>
                <a href={trialHref} className="funnel-btn funnel-btn-primary">
                  Start Free Trial
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            )}

            {/* Heading */}
            <div className="text-center mb-12">
              <h1 className="funnel-heading-1 mb-4">Simple, Transparent&nbsp;Pricing</h1>
              <p className="funnel-body mb-4">One server, deploy as many times as you want.</p>
              <p className="funnel-kicker mb-8" style={{ color: '#60a5fa' }}>
                I update, add security, and backup your server for you — you can focus on shipping&nbsp;your&nbsp;apps.
              </p>

              {/* Billing toggle */}
              <div className="flex items-center justify-center gap-4">
                <span className={`funnel-body-sm transition-colors ${!yearly ? 'text-white' : ''}`}>Monthly</span>
                <button
                  onClick={() => setYearly((y) => !y)}
                  className="relative w-16 h-8 bg-gray-700 rounded-full hover:bg-gray-600"
                  role="switch"
                  aria-checked={yearly}
                  aria-label={`Billing period: ${yearly ? 'yearly' : 'monthly'}`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-blue-400 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(96,165,250,0.6)] ${yearly ? 'left-8' : 'left-1'}`}
                  />
                </button>
                <span className={`funnel-body-sm transition-colors ${yearly ? 'text-white' : ''}`}>
                  Yearly <span className="text-blue-400 font-bold">(Save 10%)</span>
                </span>
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`flex flex-col rounded-xl p-6 relative ${plan.highlight ? 'funnel-card-featured' : 'funnel-card'}`}
                >
                  {plan.badge && (
                    <div className="funnel-badge">{plan.badge}</div>
                  )}
                  <div className="mb-6">
                    <div className="funnel-heading-3 mb-1">{plan.name}</div>
                    <div className="funnel-body-sm">{plan.tagline}</div>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {yearly ? `$${(plan.yearly / 12).toFixed(2)}` : `$${plan.monthly}`}
                    </span>
                    <span className="funnel-body-sm">
                      {yearly
                        ? `/mo (billed yearly)`
                        : '/mo'}
                    </span>
                    {yearly && (
                      <span className="funnel-body-sm block mt-1 text-gray-400">
                        Yearly total: <span className="font-bold text-white">${plan.yearly}</span>
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 funnel-body-sm mb-6 flex-1">
                    {plan.specs.map(({ label, value, valueClass }) => (
                      <div key={label} className="flex justify-between">
                        <span>{label}</span>
                        <span className={valueClass || 'text-white'}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href={`/checkout?plan=${plan.id}&interval=${yearly ? 'yearly' : 'monthly'}`}
                    className={plan.highlight
                      ? 'funnel-btn funnel-btn-primary w-full justify-center'
                      : 'funnel-btn funnel-btn-subtle w-full justify-center'}
                  >
                    Get Started
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Full feature comparison */}
        <section className="funnel-section">
          <div className="funnel-wide">
            <button
              onClick={() => setDetailsOpen((o) => !o)}
              className="flex items-center justify-center gap-2 w-full text-gray-400 hover:text-white transition-colors py-4"
              aria-expanded={detailsOpen}
              aria-controls="feature-comparison"
            >
              <span className="funnel-body-sm font-medium">View full feature comparison</span>
              <svg
                className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {detailsOpen && (
              <div
                id="feature-comparison"
                role="region"
                aria-labelledby="feature-comparison-heading"
                className="overflow-x-auto mt-6"
              >
                <h3 id="feature-comparison-heading" className="sr-only">Feature comparison</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Feature</th>
                      <th className="text-center py-3 px-4 text-gray-300">Basic</th>
                      <th className="text-center py-3 px-4 text-blue-400">Pro</th>
                      <th className="text-center py-3 px-4 text-purple-400">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {FULL_FEATURES.map((f) => (
                      <tr key={f.label} className="border-b border-gray-800">
                        <td className="py-2 px-4">{f.label}</td>
                        <td className={`text-center ${f.basic === '✓' ? 'text-green-400' : 'text-gray-500'}`}>{f.basic}</td>
                        <td className={`text-center ${f.pro === '✓' ? 'text-green-400' : 'text-gray-500'}`}>{f.pro}</td>
                        <td className={`text-center ${f.premium === '✓' ? 'text-green-400' : 'text-gray-500'}`}>{f.premium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Stack */}
        <section className="funnel-section funnel-bg-process">
          <div className="funnel-wide">
            <h2 className="funnel-heading-2 text-center mb-8">What's Pre-Installed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {STACK.map(({ icon, name, sub }) => (
                <div key={name} className="funnel-card p-4">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="funnel-heading-3 text-sm">{name}</div>
                  <div className="funnel-body-sm">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust links */}
        <section className="funnel-section">
          <div className="funnel-wide text-center">
            <p className="funnel-body mb-4">Questions about security or how this works?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <a href="/is-this-safe" className="funnel-body-sm" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Is Clouded Basement safe?</a>
              <span className="hidden sm:inline text-gray-600">·</span>
              <a href="/compare" className="funnel-body-sm" style={{ color: '#60a5fa', textDecoration: 'underline' }}>See how we compare</a>
            </div>
          </div>
        </section>

    </PageLayout>
  );
}
