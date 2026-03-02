
export default function CTASection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[32rem] overflow-hidden bg-transparent">
    
      {/* CTA content block with blur overlay */}
      <div className="flex items-center justify-center relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl p-10 backdrop-blur-md bg-opacity-40 rounded-xl z-0" />
        <div className="relative z-10 p-10 w-full max-w-xl text-center">
          <p className="funnel-kicker mb-5">Deploy now</p>
          <h2 className="funnel-heading-2 mb-6">Launch your managed VPS today.</h2>
          <p className="mb-10">
            Get automated cloud hosting with GitHub deploys, WordPress support, and full server control. Start your 3-day free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/register" className="funnel-btn funnel-btn-primary">Start Free Trial</a>
            <a href="/docs" className="funnel-btn funnel-btn-subtle">Read deployment docs -&gt;</a>
          </div>
        </div>
      </div>
    </section>
  );
}
