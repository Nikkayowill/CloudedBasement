import SectionTitle from '../components/SectionTitle';

const CELL_BORDER = '0.5px solid rgba(255,255,255,0.07)';

const ROWS = [
  { label: 'Your own server', us: true, vercel: false, render: '~', raw: 'check*' },
  { label: 'Deploy from Git', us: true, vercel: true, render: true, raw: false },
  { label: 'Full SSH / root', us: true, vercel: false, render: false, raw: true },
  { label: 'SSL & domains', us: true, vercel: true, render: true, raw: false },
  { label: 'Databases included', us: true, vercel: false, render: '~', raw: false },
  { label: 'Multi-site hosting', us: true, vercel: false, render: false, raw: false },
  { label: 'Predictable pricing', us: true, vercel: false, render: '~', raw: true },
  { label: 'No vendor lock-in', us: true, vercel: false, render: '~', raw: true },
];

function CellValue({ val }) {
  if (val === true) return <span style={{ color: '#4ade80', fontWeight: 700 }}>&#10003;</span>;
  if (val === false) return <span style={{ color: '#525252' }}>&#10007;</span>;
  if (val === '~') return <span style={{ color: '#facc15' }}>~</span>;
  if (val === 'check*') return <span style={{ color: '#a1a1a1' }}>&#10003;*</span>;
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
          {ROWS.map((row) => (
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
    <section id="compare">
      <div className="cb-title-row" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="/Images/chess-example.png"
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
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle
            text1="Why teams choose Clouded Basement"
            text2="Managed VPS automation with real server ownership."
          />
        </div>
      </div>

      <div className="cb-content-pad py-10">
        <ComparisonTable />
      </div>

      <div className="border-t-dim cb-content-pad py-8 text-center">
        <p className="funnel-body reveal max-w-[40rem] mx-auto text-[#9ca3af]">
          Your apps run on a real Ubuntu VPS with tools developers already trust:
          Nginx, PM2, SSH, and Let&apos;s Encrypt. You get managed operations, but keep full control and portability.
        </p>
        <p className="funnel-body-sm reveal mt-5 text-[#6b7280]">
          Plans start at <strong className="text-[#e5e7eb]">$15/month</strong> with a <strong className="text-[#e5e7eb]">3-day free trial</strong> and no credit card required.
        </p>
      </div>
    </section>
  );
}
