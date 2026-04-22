import { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import { faqsData } from '../data/faqsData';

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t-dim">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 bg-transparent border-none cursor-pointer text-left"
      >
        <span className="funnel-heading-3 font-medium">{q}</span>
        <ChevronDownIcon
          size={18}
          className="shrink-0 text-gray-500"
          style={{
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
        <p className="funnel-body pb-5">{a}</p>
      </div>
    </div>
  );
}

export default function FaqSection() {
  return (
    <section id="faq">
      <div className="cb-title-row" style={{ position: 'relative', overflow: 'hidden' }}>
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
            zIndex: 1,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle
            text1="FAQ"
            text2="Managed VPS hosting questions"
            text3="Clear answers for developers, startups, and small businesses moving to automated cloud hosting."
          />
        </div>
      </div>

      <div className="pt-16 px-10 pb-28 max-w-2xl mx-auto">
        <div className="reveal">
          {faqsData.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
          <div className="border-t-dim" />
        </div>
      </div>
    </section>
  );
}
