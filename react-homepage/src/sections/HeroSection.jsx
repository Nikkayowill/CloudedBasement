import ServerStack from '../components/ServerStack';

export default function HeroSection() {
  return (
    <section className="cb-section">
      <div className="cb-split cb-split-2 relative">
        {/* Left: copy */}
        <div className="cb-content-pad pt-20 pb-28 md:pt-32 md:pb-32 flex flex-col items-center md:items-start text-center md:text-left relative z-10">
          <h1 className="funnel-heading-1 mb-6 relative z-10 mt-18 md:mt-24">
            {(() => {
              const t = { background: 'linear-gradient(90deg, #ffffff 0%, #60a5fa 55%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' };
              return <>Managed Hos<span style={t}>ting</span>. Automated Dep<span style={t}>loys</span>.</>;
            })()}
          </h1>
          <p
            className="funnel-body mb-8 max-w-120"
            style={{ color: '#94a3b8' }}
          >
            Launch a developer-friendly cloud server with GitHub deploys,
            WordPress support, free SSL, and full root access in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center md:justify-start md:items-start">
            <a href="/register" className="funnel-btn funnel-btn-primary">
              Get Started
            </a>
            <a href="/docs" className="funnel-btn funnel-btn-subtle">
              Documentation
            </a>
          </div>
        </div>

        {/* Right: ServerStack animation */}
        <div
          className="cb-content-pad pt-34 md:pt-40 pb-28 md:pb-32 flex items-center justify-center relative z-10"
          style={{ overflow: 'visible' }}
        >
          <ServerStack />
        </div>
      </div>

      {/* Feature strip */}
      <div
        className="cb-content-pad py-5 flex justify-center"
        style={{ borderTop: '1px solid var(--cb-line)' }}
      >
        <ul
          className="funnel-mono text-[11px] flex flex-row flex-wrap justify-center items-center gap-4 md:gap-10 w-full text-center"
          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'ui-monospace, monospace' }}
        >
          <li>-&gt; GitHub auto-deploy</li>
          <li>-&gt; WordPress-ready VPS</li>
          <li>-&gt; Full SSH and root control</li>
        </ul>
      </div>
    </section>
  );
}

