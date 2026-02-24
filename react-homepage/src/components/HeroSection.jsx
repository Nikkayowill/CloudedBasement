import TerminalCard from "./TerminalCard";


export default function HeroSection() {
  return (
    <>
      <section>
        <div className="cb">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Kicker, Heading, Subheading, CTAs */}
            <div className="md:border-r-faint px-8 md:px-12 py-30 md:py-28 md:pl-12 flex flex-col items-center md:items-start text-center md:text-left w-full">
              <h1 className="funnel-heading-1 mb-6">
                Ship Faster.<br />
                No Infrastructure Headaches.
              </h1>
              <p className="funnel-body mb-4">
                Your server is set up. Push code and it's live.<br />
                We handle configuration so you can focus on building.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center md:justify-start">
                <a href="/register" className="funnel-btn funnel-btn-primary">
                  Get Started
                  </a>
                <a href="/docs" className="funnel-btn funnel-btn-subtle">
                  Read Docs
                </a>
              </div>
            </div>
            {/* Right: Animation and Integrations Carousel */}
            <div className="px-8 md:px-12 py-20 md:py-28 flex flex-col items-center justify-center md:justify-end w-full gap-3">
              <TerminalCard />
              <p className="funnel-mono text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                skip hours of server config
              </p>
            </div>
          </div>
          {/* Trust signals: always horizontal, responsive font and wrapping */}
          <div className="px-0 pt-2 pb-8 flex justify-center w-full">
            <ul className="funnel-mono text-[11px] xs:text-xs md:text-sm flex flex-row flex-wrap justify-center items-center gap-2 xs:gap-4 md:gap-8 w-full text-center">
              <li className="flex-1 min-w-[90px]">→ Push to deploy</li>
              <li className="flex-1 min-w-[90px]">→ Live in minutes</li>
              <li className="flex-1 min-w-[90px]">→ No card required</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
