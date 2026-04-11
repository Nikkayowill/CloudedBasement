import PageLayout from '../components/PageLayout';

const TABLE_ROWS = [
  { feature: 'Full SSH & root access',     basement: '✓', heroku: '✗', render: '✗', railway: '✗', diy: '✓', bClass: 'text-green-400', hClass: 'text-red-400', rClass: 'text-red-400', rwClass: 'text-red-400', dClass: 'text-green-400' },
  { feature: 'Your own dedicated server',  basement: '✓', heroku: '✗', render: '✗', railway: '✗', diy: '✓', bClass: 'text-green-400', hClass: 'text-red-400', rClass: 'text-red-400', rwClass: 'text-red-400', dClass: 'text-green-400' },
  { feature: 'Git push to deploy',         basement: '✓', heroku: '✓', render: '✓', railway: '✓', diy: '✗', bClass: 'text-green-400', hClass: 'text-green-400', rClass: 'text-green-400', rwClass: 'text-green-400', dClass: 'text-red-400' },
  { feature: 'GitHub auto-deploy',         basement: '✓', heroku: '✓', render: '✓', railway: '✓', diy: '✗', bClass: 'text-green-400', hClass: 'text-green-400', rClass: 'text-green-400', rwClass: 'text-green-400', dClass: 'text-red-400' },
  { feature: 'Custom domains',             basement: '✓', heroku: '✓', render: '✓', railway: '✓', diy: 'Manual', bClass: 'text-green-400', hClass: 'text-green-400', rClass: 'text-green-400', rwClass: 'text-green-400', dClass: 'text-yellow-400' },
  { feature: 'Automatic SSL',              basement: '✓', heroku: '✓', render: '✓', railway: '✓', diy: 'Manual', bClass: 'text-green-400', hClass: 'text-green-400', rClass: 'text-green-400', rwClass: 'text-green-400', dClass: 'text-yellow-400' },
  { feature: 'One-click database',         basement: '✓', heroku: '✓', render: '✓', railway: '✓', diy: '✗', bClass: 'text-green-400', hClass: 'text-green-400', rClass: 'text-green-400', rwClass: 'text-green-400', dClass: 'text-red-400' },
  { feature: 'Environment variables',      basement: '✓', heroku: '✓', render: '✓', railway: '✓', diy: 'Manual', bClass: 'text-green-400', hClass: 'text-green-400', rClass: 'text-green-400', rwClass: 'text-green-400', dClass: 'text-yellow-400' },
  { feature: 'Managed security updates',   basement: '✓', heroku: '✓', render: '✓', railway: '✓', diy: '✗', bClass: 'text-green-400', hClass: 'text-green-400', rClass: 'text-green-400', rwClass: 'text-green-400', dClass: 'text-red-400' },
  { feature: 'No vendor lock-in',          basement: '✓', heroku: '✗', render: '✗', railway: '✗', diy: '✓', bClass: 'text-green-400', hClass: 'text-red-400', rClass: 'text-red-400', rwClass: 'text-red-400', dClass: 'text-green-400' },
  { feature: 'Predictable pricing',        basement: '✓', heroku: '✓', render: '✓', railway: 'Usage', diy: '✓', bClass: 'text-green-400', hClass: 'text-green-400', rClass: 'text-green-400', rwClass: 'text-yellow-400', dClass: 'text-green-400' },
  { feature: 'Free trial (no card)',       basement: '3 days', heroku: '✗', render: 'Free tier', railway: 'Free trial', diy: '✗', bClass: 'text-green-400', hClass: 'text-red-400', rClass: 'text-green-400', rwClass: 'text-green-400', dClass: 'text-red-400' },
  { feature: 'Run any language/framework', basement: '✓', heroku: 'Buildpacks', render: 'Native + Docker', railway: 'Nixpacks', diy: '✓', bClass: 'text-green-400', hClass: 'text-yellow-400', rClass: 'text-yellow-400', rwClass: 'text-yellow-400', dClass: 'text-green-400' },
  { feature: 'Install system packages',    basement: 'apt-get', heroku: '✗', render: '✗', railway: '✗', diy: 'apt-get', bClass: 'text-green-400', hClass: 'text-red-400', rClass: 'text-red-400', rwClass: 'text-red-400', dClass: 'text-green-400' },
  { feature: 'Persistent filesystem',      basement: '✓', heroku: 'Ephemeral', render: 'Ephemeral', railway: 'Ephemeral', diy: '✓', bClass: 'text-green-400', hClass: 'text-red-400', rClass: 'text-red-400', rwClass: 'text-red-400', dClass: 'text-green-400' },
  { feature: 'Setup time',                 basement: '~2 min', heroku: '~5 min', render: '~5 min', railway: '~3 min', diy: '30–60 min', bClass: 'text-blue-300', hClass: '', rClass: '', rwClass: '', dClass: 'text-yellow-400' },
];

const COMPETITORS = [
  {
    title: 'Clouded Basement vs. DIY VPS',
    subtitle: '(DigitalOcean, Linode, Vultr)',
    body: "A DigitalOcean droplet with similar specs (1GB/1vCPU) is $6/mo — but you'll spend hours setting up everything Basement automates. Your time has value.",
    cols: [
      {
        heading: 'What you skip with Basement',
        color: 'text-blue-400',
        items: ['Setting up Nginx reverse proxy configs', 'Configuring Certbot / SSL certificates', 'Writing deployment scripts', 'Setting up firewall rules (UFW)', 'Installing Node.js, Python, Go, Rust', 'Managing OS security updates', 'Configuring database servers'],
      },
      {
        heading: 'What you still get',
        color: 'text-blue-400',
        items: ['Full root SSH access to your server', 'Install anything with apt-get', 'Your own IP address', 'Persistent filesystem (not containers)', 'Run background processes, cron jobs', 'No vendor lock-in — take your server and leave', 'Full control over everything'],
      },
    ],
  },
  {
    title: 'Clouded Basement vs. Heroku',
    body: "Heroku pioneered push-to-deploy and is well-known, but their free tier was removed in 2022. The cheapest option is the Eco plan at $5/mo (shared pool of 1,000 dyno hours) with 512MB RAM, or the Basic plan at $7/mo per dyno. Add a managed Postgres database and costs climb quickly. You don't get SSH access, you can't install system packages, and your filesystem resets on every deploy.",
    cols: [
      { heading: 'Basement advantages', color: 'text-green-400', items: ['Full SSH & root access', 'Persistent filesystem', 'Install any system package', 'Multiple sites on one server', 'No slug size limits'] },
      { heading: 'Heroku advantages', color: 'text-purple-400', items: ['Larger ecosystem of add-ons', 'Auto-scaling (paid plans)', 'Longer track record', 'Team collaboration features'] },
    ],
  },
  {
    title: 'Clouded Basement vs. Render',
    body: "Render is a solid PaaS with a free tier (512MB, spins down after inactivity). Paid instances start at $7/mo for 512MB RAM (Starter) up to $85/mo for 4GB (Pro). Render supports native runtimes and Docker, and offers SSH access for debugging — but not full root access. You can't install system packages or modify the OS.",
    cols: [
      { heading: 'Basement advantages', color: 'text-green-400', items: ['Full SSH & root access', 'No cold starts — your server is always on', 'Run any language natively (install via apt-get)', 'Multiple sites on one server', 'Persistent disk by default'] },
      { heading: 'Render advantages', color: 'text-purple-400', items: ['Free tier available', 'Static site hosting', 'Managed Redis and Postgres', 'SSH access for debugging', 'Persistent disks available (paid add-on)'] },
    ],
  },
  {
    title: 'Clouded Basement vs. Railway',
    body: "Railway has a great developer experience with usage-based pricing (billed per second). They offer a 30-day free trial with $5 in credits (no card required), then a Hobby plan at $5/mo or Pro at $20/mo — both include credits, but you pay for usage beyond that. Costs can spike unpredictably with traffic, and like other PaaS platforms, you're running on shared infrastructure without root access or OS-level control.",
    cols: [
      { heading: 'Basement advantages', color: 'text-green-400', items: ['Predictable flat pricing (no surprise bills)', 'Full SSH & root access', 'Dedicated resources (not shared)', 'Persistent filesystem', 'No usage caps or metering'] },
      { heading: 'Railway advantages', color: 'text-purple-400', items: ['Pay-per-use (good for low-traffic)', 'Slick dashboard UI', 'Instant project templates', 'Broader community'] },
    ],
  },
];

const BEST_FOR = [
  { icon: '🚀', title: 'Solo developers', body: 'Ship side projects and SaaS apps on your own server without managing infrastructure.' },
  { icon: '💼', title: 'Freelancers', body: 'Host multiple client projects on one server. Custom domains, SSL, and deployments handled for you.' },
  { icon: '🎓', title: 'Developers learning DevOps', body: 'Get a real server with SSH access, but without the hours of setup. Learn on a working system.' },
];

export default function Compare() {
  return (
    <PageLayout>
      <section className="funnel-section">
          <div className="funnel-wide">

            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="funnel-heading-1 mb-4">How We Compare</h1>
              <p className="funnel-body max-w-2xl mx-auto">
                Every platform makes trade-offs. Here's an honest look at where Clouded Basement&nbsp;fits.
              </p>
            </div>

            {/* TL;DR */}
            <div className="funnel-card-featured p-8 mb-16">
              <h2 className="funnel-heading-3 mb-4">The short version</h2>
              <p className="funnel-body mb-4">
                Platforms like Heroku and Render are convenient but give you a managed container — you don't get SSH, root access, or control over the OS. Raw VPS providers like DigitalOcean give you total control but leave setup, deployment, SSL, and security to you.
              </p>
              <p className="funnel-body">
                <strong className="text-white">Clouded Basement gives you both.</strong> A real Ubuntu server with full root access, plus managed Git deployments, automatic SSL, security updates, and a dashboard to control everything.
              </p>
            </div>

            {/* Comparison table */}
            <div className="mb-16">
              <h2 className="funnel-heading-2 text-center mb-8">Feature Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium min-w-[180px]">Feature</th>
                      <th className="text-center py-3 px-4 text-blue-300 font-bold min-w-[120px]">Basement</th>
                      <th className="text-center py-3 px-4 text-gray-300 font-bold min-w-[120px]">Heroku</th>
                      <th className="text-center py-3 px-4 text-gray-300 font-bold min-w-[120px]">Render</th>
                      <th className="text-center py-3 px-4 text-gray-300 font-bold min-w-[120px]">Railway</th>
                      <th className="text-center py-3 px-4 text-gray-300 font-bold min-w-[120px]">DIY VPS</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {TABLE_ROWS.map((row) => (
                      <tr key={row.feature} className="border-b border-gray-800">
                        <td className="py-3 px-4 text-gray-400">{row.feature}</td>
                        <td className={`text-center ${row.bClass}`}>{row.basement}</td>
                        <td className={`text-center ${row.hClass}`}>{row.heroku}</td>
                        <td className={`text-center ${row.rClass}`}>{row.render}</td>
                        <td className={`text-center ${row.rwClass}`}>{row.railway}</td>
                        <td className={`text-center ${row.dClass}`}>{row.diy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Competitor deep-dives */}
            {COMPETITORS.map((c) => (
              <div key={c.title} className="mb-16">
                <h2 className="funnel-heading-2 mb-6">
                  {c.title}
                  {c.subtitle && <span className="funnel-body font-normal"> {c.subtitle}</span>}
                </h2>
                <div className="funnel-card p-6">
                  <p className="funnel-body mb-4">{c.body}</p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {c.cols.map((col) => (
                      <div key={col.heading}>
                        <h4 className={`funnel-body-sm font-bold ${col.color} mb-2`}>{col.heading}</h4>
                        <ul className="space-y-1 funnel-body-sm">
                          {col.items.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Best for */}
            <div className="mb-16">
              <h2 className="funnel-heading-2 text-center mb-8">Who is Basement best&nbsp;for?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {BEST_FOR.map((card) => (
                  <div key={card.title} className="funnel-card p-6 text-center">
                    <div className="text-3xl mb-3">{card.icon}</div>
                    <h3 className="funnel-heading-3 mb-2">{card.title}</h3>
                    <p className="funnel-body-sm">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Not a fit */}
            <div className="funnel-card p-8 mb-16">
              <h2 className="funnel-heading-3 mb-4">When we're not the right&nbsp;fit</h2>
              <ul className="space-y-3 funnel-body-sm">
                {[
                  { label: 'Enterprise teams', desc: 'needing multi-region, auto-scaling, and team RBAC — look at AWS, GCP, or Render Teams.' },
                  { label: 'Static sites only', desc: '— Vercel, Netlify, or Cloudflare Pages are free and purpose-built for that.' },
                  { label: 'Serverless functions', desc: "— if you don't need a persistent server, Lambda or Cloudflare Workers are better suited." },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="text-yellow-400 mt-0.5">→</span>
                    <span><strong className="text-white">{item.label}</strong> {item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center">
              <h2 className="funnel-heading-2 mb-4">Ready to try&nbsp;it?</h2>
              <p className="funnel-body mb-8">3-day free trial. No credit card. Real server in 2 minutes.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="/register" className="funnel-btn funnel-btn-primary">
                  Start Free Trial
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="/pricing" className="funnel-btn funnel-btn-subtle">
                  View Pricing
                </a>
              </div>
            </div>

          </div>
    </section>
    </PageLayout>
  );
}
