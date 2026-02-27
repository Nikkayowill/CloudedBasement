import SectionTitle from '../components/SectionTitle';

const CELL_BORDER = '0.5px solid rgba(255,255,255,0.07)';

const ROWS = [
    { label: 'Your own server', us: true, vercel: false, render: '~', raw: '✓*' },
    { label: 'Deploy from Git', us: true, vercel: true, render: true, raw: false },
    { label: 'Full SSH / root', us: true, vercel: false, render: false, raw: true },
    { label: 'SSL & domains', us: true, vercel: true, render: true, raw: false },
    { label: 'Databases included', us: true, vercel: false, render: '~', raw: false },
    { label: 'Multi-site hosting', us: true, vercel: false, render: false, raw: false },
    { label: 'Predictable pricing', us: true, vercel: false, render: '~', raw: true },
    { label: 'No vendor lock-in', us: true, vercel: false, render: '~', raw: true },
];

function CellValue({ val }) {
    if (val === true) return <span style={{ color: '#4ade80', fontWeight: 700 }}>✓</span>;
    if (val === false) return <span style={{ color: '#525252' }}>✗</span>;
    if (val === '~') return <span style={{ color: '#facc15' }}>~</span>;
    // e.g. "✓*"
    return <span style={{ color: '#a1a1a1' }}>{val}</span>;
}

function ComparisonTable() {
    const headerStyle = {
        padding: '0.75rem 1rem',
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textAlign: 'center',
        color: '#a1a1a1',
    };
    const cellStyle = {
        padding: '0.75rem 1rem',
        fontSize: '0.8125rem',
        textAlign: 'center',
        borderTop: CELL_BORDER,
    };

    return (
        <div className="reveal" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', maxWidth: '52rem', margin: '0 auto', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ ...headerStyle, textAlign: 'left', minWidth: '10rem' }} />
                        <th style={{ ...headerStyle, background: 'rgba(59,130,246,0.06)', borderRadius: '0.5rem 0.5rem 0 0', minWidth: '7rem' }}>
                            Clouded<br />Basement
                        </th>
                        <th style={{ ...headerStyle, minWidth: '7rem' }}>Vercel /<br />Netlify</th>
                        <th style={{ ...headerStyle, minWidth: '5rem' }}>Render</th>
                        <th style={{ ...headerStyle, minWidth: '5rem' }}>Raw<br />VPS</th>
                    </tr>
                </thead>
                <tbody>
                    {ROWS.map((row, i) => (
                        <tr key={row.label}>
                            <td style={{
                                ...cellStyle, textAlign: 'left', fontWeight: 500,
                                color: '#d1d5db', fontSize: '0.8125rem',
                            }}>
                                {row.label}
                            </td>
                            <td style={{ ...cellStyle, background: 'rgba(59,130,246,0.06)' }}>
                                <CellValue val={row.us} />
                            </td>
                            <td style={cellStyle}><CellValue val={row.vercel} /></td>
                            <td style={cellStyle}><CellValue val={row.render} /></td>
                            <td style={cellStyle}><CellValue val={row.raw} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function WhyChooseUs() {
    return (
        <section id="compare" className="border-b-faint">
            {/* Section title */}
            <div style={{ padding: '6rem 2.5rem 4rem', borderBottom: CELL_BORDER }}>
                <SectionTitle
                    text1="Why Clouded Basement"
                    text2="Real servers. Real control. None of the busywork."
                />
            </div>

            {/* Comparison grid */}
            <div style={{ padding: '2.5rem' }}>
                <ComparisonTable />
            </div>

            {/* Trust footer */}
            <div style={{ borderTop: CELL_BORDER, padding: '2rem 2.5rem', textAlign: 'center' }}>
                <p className="funnel-body reveal" style={{ maxWidth: '40rem', margin: '0 auto', color: '#9ca3af' }}>
                    We don't abstract your server into a black box. You get a real machine running a stack you already know — Nginx, Ubuntu, PM2, Let's Encrypt. If you leave, your app runs anywhere Linux does. No migration. No rewrite. No&nbsp;lock-in.
                </p>
                <p className="funnel-body-sm reveal" style={{ marginTop: '1.25rem', color: '#6b7280' }}>
                    Plans start at <strong style={{ color: '#e5e7eb' }}>$15/month</strong> with a <strong style={{ color: '#e5e7eb' }}>3-day free trial</strong>, no credit card required.
                </p>
            </div>
        </section>
    );
}
