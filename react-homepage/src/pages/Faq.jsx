import { useState } from 'react';
import PageLayout from '../components/PageLayout';

const FAQS = [
  {
    q: "Why wouldn't I just use DigitalOcean directly?",
    a: "DigitalOcean gives you raw infrastructure (Droplets) or a managed app platform. Droplets require you to install and maintain everything yourself — Ubuntu, Nginx, SSL, runtimes, and deployments. The App Platform automates deployments but does not give full server control. Clouded Basement automates provisioning and deployment while giving you full root access to your own server, saving you setup time without losing control.",
  },
  {
    q: 'Do I actually own my server?',
    a: 'Yes. Every VPS is fully yours, with root access and a dedicated IP. You can install anything, modify the configuration, or migrate it elsewhere at any time. Clouded Basement just handles the initial setup and deployment automation.',
  },
  {
    q: 'What happens if I cancel?',
    a: 'You can cancel anytime. Your server stays active until the end of your billing period so you can back up your data or migrate. After that, the server is shut down. No contracts, no cancellation fees.',
  },
  {
    q: 'How is Clouded Basement different from Heroku or Vercel?',
    a: 'Unlike PaaS platforms, Clouded Basement gives you full server control with automated setup and deployment. You avoid vendor lock-in while still enjoying one-click provisioning, SSL, and GitHub deployments.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="funnel-card overflow-hidden">
      <button
        className="w-full p-6 cursor-pointer hover:bg-white/3 transition-all flex justify-between items-center text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <h3 className="funnel-heading-3">{q}</h3>
        <span className={`text-2xl text-blue-400 transition-transform duration-300 shrink-0 ml-4 ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6">
          <p className="funnel-body">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  return (
    <PageLayout>
      <section className="funnel-section funnel-bg-process">
          <div className="funnel-prose">
            <h1 className="funnel-heading-1 text-center mb-4">Frequently Asked&nbsp;Questions</h1>
            <p className="funnel-body text-center mb-16">Quick answers to common questions</p>

            <div className="space-y-4">
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>

            <div className="funnel-card p-12 text-center mt-8">
              <h2 className="funnel-heading-2 mb-4">Still Have&nbsp;Questions?</h2>
              <p className="funnel-body mb-8">Can't find the answer you're looking for? Our support team is here to help.</p>
              <a href="/contact" className="funnel-btn funnel-btn-primary uppercase tracking-wider text-sm">
                Contact Support
              </a>
            </div>
          </div>
    </section>
    </PageLayout>
  );
}
