import { useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import { pricingData } from '../data/pricingData';

function PricingCell({ id, name, desc, monthly, yearly, features, adds, popular, interval }) {
  const active = interval === 'yearly' ? yearly : monthly;

  return (
    <div
      className="py-12 px-8 flex flex-col relative"
      style={{ background: popular ? 'rgba(37,99,235,0.04)' : 'transparent' }}
    >
      {popular && <span className="funnel-badge">Most Popular</span>}

      <h3 className="funnel-heading-3 mb-1">{name}</h3>
      <p className="funnel-body-sm mb-5 text-gray-500">{desc}</p>

      <p className="mb-1">
        <span className="text-[2.5rem] font-bold tracking-[-0.03em] leading-none text-white">
          {active.price}
        </span>
        <span className="funnel-body-sm text-gray-500 ml-1">{active.period}</span>
      </p>
      <p className="text-xs text-gray-600 mb-6 min-h-5">
        {interval === 'yearly'
          ? <span className="text-green-400">{active.perMonth}/mo - 2 months free</span>
          : '3-day free trial'}
      </p>

      <ul className="flex flex-col gap-2 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className={`funnel-body-sm flex items-center gap-2${popular ? ' text-gray-300' : ''}`}>
            <span className="text-green-400 text-[9px] shrink-0">&#9679;</span>
            {f}
          </li>
        ))}

        {adds && adds.length > 0 && (
          <>
            <li className="flex items-center gap-2 pt-1.5 pb-0.5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[0.625rem] font-semibold tracking-[0.08em] uppercase text-white/20 whitespace-nowrap">
                also includes
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </li>
            {adds.map((f) => (
              <li key={f} className="funnel-body-sm flex items-center gap-2 text-blue-300">
                <span className="text-blue-400 text-[9px] shrink-0">&#9679;</span>
                {f}
              </li>
            ))}
          </>
        )}
      </ul>

      <a
        href={`/checkout?plan=${id}&interval=${interval}`}
        className={`funnel-btn ${popular ? 'funnel-btn-primary' : 'funnel-btn-subtle'} w-full text-center`}
      >
        {name}
      </a>
    </div>
  );
}

export default function NewPricing() {
  const [interval, setInterval] = useState('monthly');

  return (
    <section id="pricing">
      <div className="cb-title-row">
        <SectionTitle
          text1="Pricing"
          text2="Managed VPS plans with predictable pricing."
          text3="Choose automated cloud hosting built for developers, startups, and small business websites."
        />

        <div className="flex justify-center mt-8">
          <div className="inline-flex items-center rounded-lg overflow-hidden border-dim bg-white/[0.02]">
            {['monthly', 'yearly'].map((opt) => (
              <button
                key={opt}
                onClick={() => setInterval(opt)}
                className="py-2 px-5 text-[0.8125rem] font-medium border-none cursor-pointer flex items-center gap-2"
                style={{
                  background: interval === opt ? 'rgba(255,255,255,0.07)' : 'transparent',
                  color: interval === opt ? '#fff' : '#6b7280',
                  transition: 'background 150ms ease, color 150ms ease',
                }}
              >
                {opt === 'monthly' ? 'Monthly' : (
                  <>
                    Yearly
                    <span className="text-[0.625rem] font-bold tracking-[0.05em] py-0.5 px-1.5 rounded text-green-400 bg-green-400/15">
                      SAVE 10%
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cb-grid-cells cb-grid-cells--pricing">
        {pricingData.map((plan) => (
          <PricingCell
            key={plan.id}
            {...plan}
            interval={interval}
          />
        ))}
      </div>

      <div className="border-t-dim py-4 px-10 text-center">
        <p className="funnel-body-sm text-gray-600">
          No contracts. Keep full server control.{' '}
          <a href="/pricing" className="text-blue-400 underline">Compare all managed VPS features -&gt;</a>
        </p>
      </div>
    </section>
  );
}
