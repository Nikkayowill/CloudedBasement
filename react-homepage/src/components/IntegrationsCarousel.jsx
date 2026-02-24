const LOGOS = [
  { name: 'Stripe',       color: '#635BFF' },
  { name: 'DigitalOcean', color: '#0080FF' },
  { name: 'SendGrid',     color: '#1A82E2' },
  { name: 'Gmail',        color: '#EA4335' },
  { name: 'Google',       color: '#4285F4' },
  { name: 'React',        color: '#61DAFB' },
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
          </div>
        ))}
      </div>
    </div>
  );
}
