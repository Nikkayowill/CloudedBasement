import SectionHeader from './layout/SectionHeader';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    desc: 'Side projects & experiments',
    price: '$15',
    features: ['1 GB RAM · 1 vCPU', '25 GB SSD', '2 sites', 'GitHub auto-deploy'],
  },
  {
    id: 'pro',
    name: 'Pro',
    desc: 'Production apps & growing projects',
    price: '$35',
    features: ['2 GB RAM · 2 vCPUs', '50 GB SSD', '5 sites', 'GitHub auto-deploy'],
    featured: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    desc: 'Established apps & high traffic',
    price: '$55',
    features: ['4 GB RAM · 2 vCPUs', '80 GB SSD', '10 sites', 'GitHub auto-deploy'],
  },
];

function PricingCard({ id, name, desc, price, features, featured }) {
  return (
    <div className={`${featured ? 'funnel-card-featured md:-my-3' : 'funnel-card'} p-8 md:p-10 flex flex-col relative`}>
      {featured && <span className="funnel-badge">Most Popular</span>}
      <h3 className={`funnel-heading-3 mb-1${featured ? ' mt-2' : ''}`}>{name}</h3>
      <p className="funnel-body-sm mb-4" style={{ color: '#6b7280' }}>{desc}</p>
      <p className="text-4xl font-bold text-white mb-1">
        {price}<span className="text-base font-normal" style={{ color: '#6b7280' }}>/mo</span>
      </p>
      <p className="text-xs mb-6" style={{ color: '#4b5563' }}>3-day free trial included</p>
      <ul
        className="space-y-2 funnel-body-sm mb-8 flex-1"
        style={featured ? { color: '#d1d5db' } : {}}
      >
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span style={{ color: '#4ade80', fontSize: '10px' }}>●</span> {f}
          </li>
        ))}
      </ul>
      <a
        href={`/pay?plan=${id}&interval=monthly`}
        className={`funnel-btn ${featured ? 'funnel-btn-primary' : 'funnel-btn-subtle'} w-full`}
      >
        Deploy {name}
      </a>
    </div>
  );
}

export default function PricingSection() {
  return (
    <section className="funnel-section funnel-bg-trust">
      <div className="funnel-wide" style={{ maxWidth: '52rem' }}>

        <SectionHeader
          kicker="Pricing"
          heading="One price. No surprises."
          body="Cancel anytime. Every plan includes direct developer support."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch reveal-stagger">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} {...plan} />
          ))}
        </div>

        <p className="text-center mt-10 funnel-body-sm" style={{ color: '#6b7280' }}>
          No contracts. Cancel anytime.{' '}
          <a href="/pricing" className="underline" style={{ color: '#60a5fa' }}>Full pricing details →</a>
        </p>

      </div>
    </section>
  );
}
