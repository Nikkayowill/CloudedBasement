import DocLayout from '../components/DocLayout';

const TOC = [
  { id: 'payment',        label: 'Payment Security' },
  { id: 'platform',       label: 'Platform Security' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'ownership',      label: 'Data Ownership & Portability' },
  { id: 'transparency',   label: 'Transparency' },
  { id: 'support',        label: 'Support' },
];

export default function Safety() {
  return (
    <DocLayout toc={TOC}>
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Security &amp; Trust</h1>
        <p className="text-base lg:text-lg text-gray-400 leading-relaxed">How we protect your data, payments, and infrastructure.</p>
      </header>

      {/* Payment Security */}
      <section id="payment" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Payment Security</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          All payment processing is handled by{' '}
          <a href="https://stripe.com" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 underline">Stripe</a>,
          a PCI DSS Level 1 certified payment processor trusted by millions of businesses worldwide.
        </p>
        <ul className="space-y-3 text-gray-300">
          {[
            { label: 'Card data never touches our servers', desc: '— payment information is transmitted directly to Stripe via their secure Elements SDK' },
            { label: '3D Secure authentication', desc: '— supported automatically for cards that require additional verification' },
            { label: 'Full refund capability', desc: '— cancel anytime, no hidden fees or long-term contracts' },
          ].map(({ label, desc }) => (
            <li key={label} className="flex gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div><strong className="text-white">{label}</strong>{desc}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Platform Security */}
      <section id="platform" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Platform Security</h2>
        <p className="text-gray-300 leading-relaxed mb-6">Clouded Basement is built with industry-standard security practices:</p>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <ul className="space-y-3 text-gray-300">
            {[
              { label: 'Password hashing', desc: '— all passwords are hashed using bcrypt with per-user salts, making them unreadable even in the event of a data breach' },
              { label: 'SQL injection protection', desc: '— all database queries use parameterized statements, preventing malicious input from accessing or modifying data' },
              { label: 'CSRF protection', desc: '— all forms include cross-site request forgery tokens, preventing unauthorized actions on your behalf' },
              { label: 'Rate limiting', desc: '— authentication and sensitive endpoints are rate-limited to prevent brute-force attacks' },
              { label: 'HTTPS everywhere', desc: '— all traffic is encrypted using TLS 1.2+ with valid SSL certificates' },
              { label: 'HTTP security headers', desc: '— we use Helmet.js to set secure headers including Content Security Policy, X-Frame-Options, and more' },
            ].map(({ label, desc }) => (
              <li key={label} className="flex gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <div><strong className="text-white">{label}</strong>{desc}</div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          For a complete overview, see our{' '}
          <a href="/docs" className="text-blue-400 hover:text-blue-300 underline">documentation</a> and{' '}
          <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">privacy policy</a>.
        </p>
      </section>

      {/* Infrastructure */}
      <section id="infrastructure" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Infrastructure</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Your server runs on{' '}
          <a href="https://www.digitalocean.com" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 underline">DigitalOcean</a>{' '}
          infrastructure — the same cloud platform trusted by companies like GitLab, Slack, and Docker.
        </p>
        <ul className="space-y-3 text-gray-300">
          {[
            { label: 'Dedicated VPS', desc: '— each customer gets their own isolated virtual private server, not shared hosting' },
            { label: 'Ubuntu 22.04 LTS', desc: '— long-term support releases with security updates until 2027' },
            { label: 'Automatic SSL', desc: '— Let\'s Encrypt certificates provisioned and renewed automatically' },
            { label: 'Full root access', desc: '— complete control over your server via SSH' },
          ].map(({ label, desc }) => (
            <li key={label} className="flex gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div><strong className="text-white">{label}</strong>{desc}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Data Ownership */}
      <section id="ownership" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Data Ownership &amp; Portability</h2>
        <p className="text-gray-300 leading-relaxed mb-6">Your code and data remain entirely yours. Clouded Basement has no vendor lock-in by design:</p>
        <ul className="space-y-3 text-gray-300">
          {[
            { label: 'Full SSH access', desc: '— export, backup, or migrate your data at any time' },
            { label: 'Standard deployment', desc: '— your server uses standard tools (Node.js, systemd, Nginx) with no proprietary configurations' },
            { label: 'Business continuity', desc: '— even if Clouded Basement ceased operations, your server would continue running on DigitalOcean with your existing credentials' },
          ].map(({ label, desc }) => (
            <li key={label} className="flex gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div><strong className="text-white">{label}</strong>{desc}</div>
            </li>
          ))}
        </ul>
        <p className="text-gray-400 text-sm mt-4">
          See our <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">terms of service</a> for complete details on data ownership and usage rights.
        </p>
      </section>

      {/* Transparency */}
      <section id="transparency" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Transparency</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Clouded Basement is designed for developers and small teams shipping side projects, MVPs, and production applications. We are not positioned as an enterprise compliance platform:
        </p>
        <div className="bg-yellow-950/20 border-l-4 border-yellow-500 rounded-r-lg p-6 mb-6">
          <ul className="space-y-3 text-gray-300">
            {[
              'Not suitable for HIPAA, SOC 2, or regulated data that requires specialized compliance certifications',
              'Operated by a solo founder — support is direct and personal, but not 24/7 SLA-backed',
              'New platform — launched in 2026, with an active development roadmap',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-yellow-400 mt-1">•</span>
                <div>{item}</div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-gray-300 leading-relaxed">
          We believe in being upfront about what we are and aren't. If you have specific compliance requirements, please{' '}
          <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">contact us</a> to discuss whether Clouded Basement is the right fit.
        </p>
      </section>

      {/* Support */}
      <section id="support" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Support</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          When you contact support, you're communicating directly with the founder who built the platform. Response time is typically within 24 hours for all inquiries.
        </p>
        <ul className="space-y-3 text-gray-300">
          {[
            'Email support for provisioning, deployment, and configuration issues',
            'Free migration assistance for early adopters moving from other hosts',
            'Dashboard ticket system for tracking ongoing issues',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>{item}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <div className="mt-4 pt-8 border-t border-gray-800 text-center">
        <a
          href="/pricing"
          className="inline-block px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all font-bold uppercase tracking-wider text-sm"
        >
          View Plans
        </a>
        <p className="text-gray-500 text-sm mt-4">
          Questions?{' '}
          <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact us</a> or review our{' '}
          <a href="/faq" className="text-blue-400 hover:text-blue-300 underline">FAQ</a>.
        </p>
      </div>
    </DocLayout>
  );
}
