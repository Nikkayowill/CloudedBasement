export default function CTASection() {
  return (
    <section>
      <div
        className="reveal"
        style={{
          padding: '8rem 2.5rem',
          textAlign: 'center',
          maxWidth: '36rem',
          margin: '0 auto',
        }}
      >
        <p className="funnel-kicker mb-5">Deploy now</p>
        <h2 className="funnel-heading-2 mb-6">Ready to deploy?</h2>
        <p className="funnel-body mb-10">
          Your server is ready. Start your 3-day free trial — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="/register" className="funnel-btn funnel-btn-primary">Start free trial</a>
          <a href="/docs"     className="funnel-btn funnel-btn-subtle">Read the docs →</a>
        </div>
      </div>
    </section>
  );
}
