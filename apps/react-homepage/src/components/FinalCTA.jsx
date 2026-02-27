export default function FinalCTA() {
  return (
    <section className="funnel-section funnel-bg-cta">
      <div className="funnel-prose text-center">
        <h2 className="funnel-heading-2 mb-6 reveal">Try it for 3&nbsp;days. Free.</h2>
        <p className="funnel-body mb-10 reveal">
          Live in minutes.<br />No card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 reveal">
          <a href="/register" className="funnel-btn funnel-btn-primary">
            Sign up free
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="/is-this-safe" className="funnel-btn funnel-btn-ghost">Is this safe? →</a>
        </div>
        <p className="mt-2 funnel-body-sm reveal">
          <a href="/docs" className="underline hover:text-white transition-colors" style={{ color: '#60a5fa' }}>See how it works? →</a>
        </p>
      </div>
    </section>
  );
}
