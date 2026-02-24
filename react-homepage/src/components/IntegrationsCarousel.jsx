const LOGOS = [
  { name: 'Stripe',       color: '#635BFF', svg: '/stripe-svgrepo-com.svg' },
  { name: 'DigitalOcean', color: '#0080FF', svg: '/digital-ocean-svgrepo-com.svg' },
  { name: 'SendGrid',     color: '#1A82E2', svg: '/sendgrid-icon-svgrepo-com.svg' },
  { name: 'Gmail',        color: '#EA4335', svg: '/google-gmail-svgrepo-com.svg' },
  { name: 'Google',       color: '#4285F4', svg: '/google-icon-logo-svgrepo-com.svg' },
  { name: 'React',        color: '#61DAFB', svg: '/react-javascript-js-framework-facebook-svgrepo-com.svg' },
];

// Duplicate so the loop is seamless (CSS translates -50%)
const TRACK = [...LOGOS, ...LOGOS];

export default function IntegrationsCarousel() {
  return (
    <div
      style={{
        overflow: 'hidden',
        width: '100%',
        maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'cb-carousel 20s linear infinite',
        }}
      >
        {TRACK.map((logo, i) => (
          <div
            key={i}
            style={{ padding: '0 2.5rem', flexShrink: 0, display: 'flex', alignItems: 'center' }}
          >
            {logo.svg ? (
              <img
                src={logo.svg}
                alt={logo.name}
                style={{ height: '1.5rem', width: 'auto', opacity: 0.55, filter: 'brightness(0) invert(1)' }}
              />
            ) : (
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: logo.color,
                  opacity: 0.65,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                {logo.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
