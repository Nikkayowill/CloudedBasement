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
        <span className="funnel-heading-3" style={{ fontWeight: 500 }}>{q}</span>
        <ChevronDownIcon
          size={18}
          className="shrink-0 text-gray-500"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 250ms ease',
          }}
        />
      </button>
      {/* maxHeight trick: only way to CSS-animate from 0 to auto height */}
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
    <section id="faq" className="border-b-faint">
      {/* Section title row */}
      <div className="pt-28 pb-20 px-10 border-b-dim">
        <SectionTitle
          text1="FAQ"
          text2="Common questions"
          text3="Everything you need to know before you commit."
        />
      </div>

      {/* FAQ accordion — prose-width centered */}
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
