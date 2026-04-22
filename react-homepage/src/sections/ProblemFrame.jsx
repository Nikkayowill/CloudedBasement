const TERM_BG = '#0a0a0a';
const TERM_BORDER = '#262626';

const ERROR_LINES = [
  {
    cmd: 'sudo nginx -t',
    lines: [
      { text: 'nginx: [emerg] unknown directive "proxy_passs"', color: '#f87171' },
      { text: 'nginx: configuration file test failed', color: '#f87171' },
    ],
  },
  {
    cmd: 'sudo certbot --nginx -d myapp.com',
    lines: [
      { text: 'DNS problem: NXDOMAIN looking up A for myapp.com', color: '#f87171' },
      { text: 'check DNS A record or wait for propagation', color: '#6b7280' },
    ],
  },
  {
    cmd: 'sudo systemctl status myapp',
    lines: [
      { text: '- myapp.service - failed', color: '#f87171' },
      { text: 'Error: EADDRINUSE: port 3000 already in use', color: '#6b7280' },
    ],
  },
  {
    cmd: 'sudo ufw status',
    lines: [{ text: 'Status: inactive  (port 22 open to world)', color: '#facc15' }],
  },
];

function TerminalCard() {
  return (
    <div style={{
      width: '100%',
      maxWidth: '28rem',
      background: '#111111',
      border: `1px solid ${TERM_BORDER}`,
      borderRadius: '0.625rem',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        padding: '0.5rem 0.875rem',
        background: '#0d0d0d',
        borderBottom: `1px solid ${TERM_BORDER}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
      }}>
        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#eab308', opacity: 0.8 }} />
        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', opacity: 0.8 }} />
        <span style={{ marginLeft: '0.5rem', color: '#525252', fontSize: '0.6875rem' }}>
          deploy@vps:~$
        </span>
      </div>

      <div style={{
        padding: '0.75rem 1rem',
        fontFamily: 'monospace',
        fontSize: '0.6875rem',
        lineHeight: 1.7,
        background: TERM_BG,
      }}>
        {ERROR_LINES.map((block, i) => (
          <div key={block.cmd} style={{ marginTop: i > 0 ? '0.5rem' : 0 }}>
            <p>
              <span style={{ color: '#4ade80' }}>$</span>{' '}
              <span style={{ color: '#d1d5db' }}>{block.cmd}</span>
            </p>
            {block.lines.map((line) => (
              <p key={line.text} style={{ color: line.color, paddingLeft: '0.5rem' }}>{line.text}</p>
            ))}
          </div>
        ))}
        <div style={{ marginTop: '0.5rem' }}>
          <span style={{ color: '#4ade80' }}>$</span>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '12px',
            background: '#d1d5db',
            marginLeft: '4px',
            verticalAlign: 'middle',
            animation: 'pulse 1s ease-in-out infinite',
          }} />
        </div>
      </div>

      <div style={{
        borderTop: `1px solid ${TERM_BORDER}`,
        padding: '0.5rem 1rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.6875rem', color: '#525252', fontStyle: 'italic' }}>
          Shipping should not require weekend DevOps work.
        </p>
      </div>
    </div>
  );
}

export default function ProblemFrame() {
  return (
    <section>
      <div className="cb-title-row" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Chess background image */}
        <img
          src="/Images/chess.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.12,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div className="text-center mb-10" style={{ position: 'relative', zIndex: 1 }}>
          <p className="text-brand text-lg font-semibold mb-4">The hidden cost of DIY cloud hosting</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-white">
            Build your product, not your server stack.
          </h2>
        </div>
      </div>

      <div className="cb-split cb-split-2">
        <div className="cb-content-pad py-12 flex flex-col justify-center items-center">
          <div className="max-w-xl w-full">
            <p className="text-base md:text-lg text-gray-200 mb-4 lg:text-left text-center">
              Most launches slow down on infrastructure tasks, not product work.<br />
              SSL setup, reverse proxies, deploy pipelines, and server patching can drain weeks from small teams.
            </p>
            <p className="text-base md:text-lg text-gray-300 mb-4 lg:text-left text-center">
              Serverless can be limiting for full-stack apps and WordPress.<br />
              Raw VPS hosting gives control, but leaves setup and maintenance on you.
            </p>
            <p className="text-base md:text-lg text-gray-400 lg:text-left text-center">
              <span className="font-semibold text-brand">Clouded Basement gives you both:</span> managed VPS automation with full server control, so startups and developers can ship faster.
            </p>
          </div>
        </div>

        <div className="cb-content-pad py-12 flex items-center justify-center">
          <TerminalCard />
        </div>
      </div>
    </section>
  );
}
