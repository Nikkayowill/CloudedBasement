import PageLayout from '../components/PageLayout';

export default function About() {
  return (
    <PageLayout>
      <section className="funnel-section">
          <div className="funnel-prose">

            {/* Header */}
            <h1 className="funnel-heading-1 mb-4">
              About Clouded&nbsp;Basement
            </h1>
            <p className="funnel-body mb-16 lg:mb-20">
              Reliable VPS hosting made simple. Full server control without&nbsp;the&nbsp;hassle.
            </p>

            {/* What it is */}
            <div className="mb-16 lg:mb-20">
              <p className="funnel-body">
                Clouded Basement provides developers with full VPS control without the hassle. Deploy your applications quickly, with automated setup and monitoring, while keeping access to the underlying system.
              </p>
              <p className="funnel-body mt-5">
                Whether you want a testing environment or a production deployment, Clouded Basement handles the hard parts so you can focus on building.
              </p>
            </div>

            <div className="h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent mb-16 lg:mb-20" />

            {/* Founder */}
            <div className="mb-16 lg:mb-20">
              <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 mb-8">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-1 ring-white/10 shrink-0">
                  <img
                    src="/hero%20personal%20portfolio.jpg"
                    alt="Kayo Williams"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pt-1">
                  <h2 className="funnel-heading-2 mb-1">Kayo Williams</h2>
                  <p className="funnel-kicker">Founder &amp; Developer</p>
                </div>
              </div>
              <p className="funnel-body">
                Before tech, I worked in the trades for an oil and heating company. Diagnosing complex systems, troubleshooting under pressure, and solving problems methodically were part of the job — skills I now apply to building and maintaining infrastructure.
              </p>
              <p className="funnel-body mt-5">
                Clouded Basement is my way of creating a platform that's both reliable and usable, designed from the ground up with real-world developer needs in mind.
              </p>
            </div>

            <div className="h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent mb-16 lg:mb-20" />

            {/* Why it exists */}
            <div className="mb-16 lg:mb-20">
              <h2 className="funnel-heading-2 mb-6">Why Clouded Basement&nbsp;exists</h2>
              <p className="funnel-body mb-8">
                Deploying apps shouldn't be this painful. Most platforms hide too much of the system, and managing a raw VPS means hours of manual configuration. Clouded Basement sits in the middle.
              </p>
              <div className="space-y-3 pl-1">
                {[
                  'A real VPS with full SSH and root access',
                  'Automated provisioning, updates, and monitoring',
                  'GitHub integration — connect your repo, click deploy, your site is live',
                  'Free subdomain included with every server',
                  "Custom domains with automatic SSL via Let's Encrypt",
                  'Nginx, Node.js, and Python pre-installed and ready',
                  'Hardened security out of the box — firewall, rate limiting, security headers',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1.5 text-xs">&#9679;</span>
                    <p className="funnel-body-sm" style={{ color: '#d1d5db' }}>{item}</p>
                  </div>
                ))}
              </div>
              <p className="funnel-body-sm mt-8 italic" style={{ color: '#6b7280' }}>
                You retain control, but without spending hours on setup.
              </p>
            </div>

            <div className="h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent mb-16 lg:mb-20" />

            {/* Technology */}
            <div className="mb-16 lg:mb-20">
              <h2 className="funnel-heading-2 mb-6">Technology &amp;&nbsp;reliability</h2>
              <p className="funnel-body mb-6">
                Built with stability and maintainability as priorities. Automation ensures smooth operations, while critical tasks are monitored to guarantee predictable performance.
              </p>
              <p className="funnel-body-sm" style={{ color: '#6b7280' }}>
                Node.js &middot; Express &middot; PostgreSQL &middot; Stripe &middot; DigitalOcean &middot; Ubuntu LTS &middot; Let's Encrypt &middot; Nginx &middot; Helmet &middot; bcrypt
              </p>
            </div>

            <div className="h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent mb-16 lg:mb-20" />

            {/* Approach */}
            <div className="mb-16 lg:mb-20">
              <h2 className="funnel-heading-2 mb-6">Our approach</h2>
              <p className="funnel-body">
                We're not competing with hyperscale providers. The goal is simple: a hosting platform that works reliably and reduces friction, letting developers focus on their projects.
              </p>
              <p className="funnel-body mt-5">
                New features are added gradually, guided by real user needs and practical considerations — not arbitrary checklists.
              </p>
            </div>

            <div className="h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent mb-16 lg:mb-20" />

            {/* Links */}
            <div className="mb-16 lg:mb-20">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
                {[
                  { label: 'GitHub', href: 'https://github.com/Nikkayowill/CloudedBasement', external: true },
                  { label: 'Documentation', href: '/docs', external: false },
                  { label: 'Pricing', href: '/pricing', external: false },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="funnel-body-sm group"
                    style={{ color: '#9ca3af', textDecoration: 'none' }}
                  >
                    {link.label}{' '}
                    <span className="inline-block transition-transform group-hover:translate-x-0.5">&rarr;</span>
                  </a>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-12 funnel-divider">
              <h3 className="funnel-heading-3 mb-3">Get in touch</h3>
              <p className="funnel-body-sm mb-6">
                Questions about the platform, tech details, or just want to connect? Clouded Basement is maintained steadily with reliability and clarity as priorities.
              </p>
              <a href="/contact" className="funnel-body-sm" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                Contact us &rarr;
              </a>
            </div>

          </div>
    </section>
    </PageLayout>
  );
}
