const LINKS = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Docs', href: '/docs' },
    { label: 'Compare', href: '/compare' },
    { label: 'Is this safe?', href: '/is-this-safe' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="funnel-footer cb-section">
      {/* .cb parent handles max-width - no inner wrapper needed */}
      <div className="funnel-footer-grid mb-10">
        {/* Brand */}
        <div>
          <a href="/" style={{ display: 'inline-block', marginBottom: '0.875rem' }}>
            <img
              src="/Minimalist%20Logo%20Suite%20for%20Clouded%20Basement.png"
              alt="Clouded Basement"
              style={{ height: '1.75rem', width: 'auto' }}
            />
          </a>
          <p className="funnel-body-sm" style={{ maxWidth: '16rem' }}>
            Cloud servers, fully managed.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([group, links]) => (
          <div key={group}>
            <p style={{
              fontSize: '0.75rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#4b5563', marginBottom: '1rem',
            }}>
              {group}
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="funnel-body-sm" style={{ color: '#6b7280', textDecoration: 'none' }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingTop: '1.5rem',
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
      }}>
        <p className="funnel-body-sm" style={{ color: '#4b5563' }}>
          &copy; {new Date().getFullYear()} Clouded Basement. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="/privacy" className="funnel-body-sm" style={{ color: '#4b5563', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" className="funnel-body-sm" style={{ color: '#4b5563', textDecoration: 'none' }}>Terms</a>
        </div>
      </div>
    </footer>
  );
}
