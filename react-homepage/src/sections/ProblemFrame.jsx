const CELL_BORDER = '0.5px solid rgba(255,255,255,0.07)';
const TERM_BG = '#0a0a0a';
const TERM_BORDER = '#262626';

const ERROR_LINES = [
    {
        cmd: 'sudo nginx -t', lines: [
            { text: 'nginx: [emerg] unknown directive "proxy_passs"', color: '#f87171' },
            { text: 'nginx: configuration file test failed', color: '#f87171' },
        ]
    },
    {
        cmd: 'sudo certbot --nginx -d myapp.com', lines: [
            { text: 'DNS problem: NXDOMAIN looking up A for myapp.com', color: '#f87171' },
            { text: 'check DNS A record or wait for propagation', color: '#6b7280' },
        ]
    },
    {
        cmd: 'sudo systemctl status myapp', lines: [
            { text: '● myapp.service — failed', color: '#f87171' },
            { text: '  Error: EADDRINUSE: port 3000 already in use', color: '#6b7280' },
        ]
    },
    {
        cmd: 'sudo ufw status', lines: [
            { text: 'Status: inactive  (port 22 open to world)', color: '#facc15' },
        ]
    },
];

function TerminalCard() {
    return (
        <div style={{
            width: '100%', maxWidth: '28rem',
            background: '#111111', border: `1px solid ${TERM_BORDER}`,
            borderRadius: '0.625rem', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
            {/* Title bar */}
            <div style={{
                padding: '0.5rem 0.875rem', background: '#0d0d0d',
                borderBottom: `1px solid ${TERM_BORDER}`,
                display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#eab308', opacity: 0.8 }} />
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', opacity: 0.8 }} />
                <span style={{ marginLeft: '0.5rem', color: '#525252', fontSize: '0.6875rem' }}>
                    deploy@vps:~$
                </span>
            </div>

            {/* Terminal body */}
            <div style={{
                padding: '0.75rem 1rem',
                fontFamily: 'monospace', fontSize: '0.6875rem', lineHeight: 1.7,
                background: TERM_BG,
            }}>
                {ERROR_LINES.map((block, i) => (
                    <div key={i} style={{ marginTop: i > 0 ? '0.5rem' : 0 }}>
                        <p>
                            <span style={{ color: '#4ade80' }}>$</span>{' '}
                            <span style={{ color: '#d1d5db' }}>{block.cmd}</span>
                        </p>
                        {block.lines.map((line, j) => (
                            <p key={j} style={{ color: line.color, paddingLeft: '0.5rem' }}>{line.text}</p>
                        ))}
                    </div>
                ))}
                <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ color: '#4ade80' }}>$</span>
                    <span style={{
                        display: 'inline-block', width: '6px', height: '12px',
                        background: '#d1d5db', marginLeft: '4px', verticalAlign: 'middle',
                        animation: 'pulse 1s ease-in-out infinite',
                    }} />
                </div>
            </div>

            {/* Caption */}
            <div style={{
                borderTop: `1px solid ${TERM_BORDER}`, padding: '0.5rem 1rem',
                textAlign: 'center',
            }}>
                <p style={{ fontSize: '0.6875rem', color: '#525252', fontStyle: 'italic' }}>
                    3 hours in. Still not deployed.
                </p>
            </div>
        </div>
    );
}

export default function ProblemFrame() {
    return (
        <section className="border-b-faint">
            {/* Section title row */}
            <div style={{ padding: '6rem 2.5rem 4rem', borderBottom: CELL_BORDER }}>
                <div className="text-center mb-16 reveal">
                    <p className="funnel-kicker mb-4">The real cost of "simple" hosting</p>
                    <h2 className="funnel-heading-2 mb-5">
                        You didn't start building to fight&nbsp;infrastructure.
                    </h2>
                </div>
            </div>

            {/* Two-column content */}
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Copy */}
                <div className="border-r-faint" style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="reveal" style={{ maxWidth: '32rem' }}>
                        <p className="funnel-body mb-5">
                            You wanted to ship a product — not spend weekends wrestling Nginx configs, debugging SSL renewals, or reverse-engineering why your CI pipeline broke at&nbsp;2&nbsp;AM.
                        </p>
                        <p className="funnel-body mb-5">
                            Serverless platforms promise simplicity but bury you in cold starts, vendor lock-in, and bills that scale faster than your users&nbsp;do. Raw VPS providers hand you a blank terminal and wish you&nbsp;luck.
                        </p>
                        <p className="funnel-body" style={{ color: '#e5e7eb' }}>
                            <strong>You need something in between:</strong> a real server that's already configured, already secured, and already wired to deploy every time you push — so you can stay in your editor, not your&nbsp;terminal.
                        </p>
                    </div>
                </div>

                {/* Terminal error card */}
                <div style={{ padding: '3rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TerminalCard />
                </div>
            </div>
        </section>
    );
}
