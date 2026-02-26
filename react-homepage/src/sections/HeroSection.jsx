import TerminalCard from '../components/TerminalCard';

export default function HeroSection() {
  return (
    <section className="border-b-faint">
      {/* Two-column hero grid */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left — headline + CTAs */}
        <div className="border-r-faint px-8 md:px-12 py-28 md:py-32 flex flex-col items-center md:items-start text-center md:text-left hero-text-block">
          <p className="funnel-kicker mb-5">Clouded Basement</p>
          <h1 className="funnel-heading-1 mb-6">
            Ship Faster.{" "}
            <span className="hidden md:inline"> No Infrastructure Headaches.</span>
            <span className="md:hidden"><br />No Infrastructure Headaches.</span>
          </h1>
          <p className="funnel-body mb-8" style={{ maxWidth: '30rem' }}>
            Your server is already set up. Connect your repo, push code, and it's live.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-3 hero-cta-group"
            style={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <a href="/register" className="funnel-btn funnel-btn-primary">Get Started Free</a>
            <a href="/docs"     className="funnel-btn funnel-btn-subtle">Read Docs →</a>
          </div>
        </div>

        {/* Right — terminal card */}
        <div className="px-8 md:px-12 py-20 md:py-28 flex flex-col items-center justify-center gap-4">
          <TerminalCard />
          <p
            className="funnel-mono text-[11px] text-center"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            skip hours of server config — this just works
          </p>
        </div>
      </div>

      {/* Bottom social-proof strip */}
      <div className="border-t-faint px-8 py-5 flex justify-center">
        <ul
          className="funnel-mono text-[11px] flex flex-row flex-wrap justify-center items-center gap-4 md:gap-10 w-full text-center"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <li>→ Push to deploy</li>
          <li>→ Live in &lt; 2 min</li>
          <li>→ No card required</li>
        </ul>
      </div>
    </section>
  );
}
