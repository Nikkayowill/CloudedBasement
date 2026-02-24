import SectionHeader from './layout/SectionHeader';

const STEPS = [
  {
    n: '01',
    title: 'Choose a plan',
    body: 'No hidden configs. No surprise limits.',
  },
  {
    n: '02',
    title: 'We set up everything',
    body: 'Ubuntu, Nginx, Node, Python, and SSL — provisioned in 2 minutes.',
  },
  {
    n: '03',
    title: "Push and it's live",
    body: 'Connect your repo. Every push deploys automatically.',
  },
];

function Step({ n, title, body }) {
  return (
    <div className="text-center">
      <span
        className="block font-mono text-xs tracking-[0.3em] mb-5"
        style={{ color: '#374151' }}
      >
        {n}
      </span>
      <h3 className="funnel-heading-3 mb-3">{title}</h3>
      <p
        className="funnel-body-sm"
        style={{ maxWidth: '15rem', marginLeft: 'auto', marginRight: 'auto' }}
      >
        {body}
      </p>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="funnel-section funnel-bg-process">
      <div className="funnel-wide">
        <SectionHeader
          kicker="How It Works"
          heading="From idea to live server"
          body="Three steps. No DevOps required."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 reveal-stagger">
          {STEPS.map((step) => (
            <Step key={step.n} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
