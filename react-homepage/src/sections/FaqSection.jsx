import { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import { faqsData } from '../data/faqsData';

const CELL_BORDER = '0.5px solid rgba(255,255,255,0.07)';

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderTop: CELL_BORDER }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem',
          padding: '1.25rem 0',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span className="funnel-heading-3" style={{ fontWeight: 500 }}>{q}</span>
        <ChevronDownIcon
          size={18}
          style={{
            color: '#6b7280', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 250ms ease',
          }}
        />
      </button>
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '20rem' : '0',
        transition: 'max-height 300ms ease',
      }}>
        <p className="funnel-body" style={{ paddingBottom: '1.25rem' }}>{a}</p>
      </div>
    </div>
  );
}

export default function FaqSection() {
  return (
    <section id="faq" className="border-b-faint">
      {/* Section title row */}
      <div style={{ padding: '4rem 2.5rem 3rem', borderBottom: CELL_BORDER }}>
        <SectionTitle
          text1="FAQ"
          text2="Common questions"
          text3="Everything you need to know before you commit."
        />
      </div>

      {/* FAQ accordion — prose-width centered */}
      <div style={{ padding: '2.5rem', maxWidth: '42rem', margin: '0 auto' }}>
        <div className="reveal">
          {faqsData.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
          <div style={{ borderTop: CELL_BORDER }} />
        </div>
      </div>
    </section>
  );
}
