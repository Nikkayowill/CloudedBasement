
export default function CTASection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[32rem] overflow-hidden bg-transparent">
      <img
        src="/Images/chess-example.png"
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
          zIndex: 0,
        }}
      />
      {/* CTA content block with blur overlay */}
      <div className="flex items-center justify-center relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl p-10 backdrop-blur-md bg-opacity-40 rounded-xl z-0" />
        <div className="relative z-10 p-10 w-full max-w-xl text-center">
          <p className="funnel-kicker mb-5">Deploy now</p>
          <h2 className="funnel-heading-2 mb-6">Get your server running today.</h2>
          <p className="mb-10">
            GitHub deploys, WordPress, full root access — ready in minutes. First 3 days are free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/register" className="funnel-btn funnel-btn-primary">Start Free Trial</a>
            <a href="/docs" className="funnel-btn funnel-btn-subtle">Read Documentation</a>
          </div>
        </div>
      </div>
    </section>
  );
}
