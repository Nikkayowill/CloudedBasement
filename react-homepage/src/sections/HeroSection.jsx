import TerminalCard from '../components/TerminalCard';

export default function HeroSection() {
  return (
    <section>
      <div className="cb-split cb-split-2">
        <div className="cb-content-pad py-28 md:py-32 mt-20 md:mt-32 flex flex-col items-center md:items-start text-center md:text-left relative">
          <img
            src="/CB-last-final.svg"
            alt="Clouded Basement Logo"
            className="absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 top-8 md:top-8 w-[14rem] h-[14rem] md:w-[18rem] md:h-[18rem] drop-shadow-lg pointer-events-none select-none"
            draggable="false"
            style={{ userSelect: 'none' }}
          />
          <h1 className="funnel-heading-1 mb-6 relative z-10 mt-22 md:mt-36">
            Managed VPS hosting.{" "}
            <span className="hidden md:inline"> Your code. Fully automated deploys.</span>
            <span className="md:hidden"><br />Your code. Fully automated deploys.</span>
          </h1>
          <p className="funnel-body mb-8 max-w-[30rem]">
            Launch a developer-friendly cloud server with GitHub deploys, WordPress support, free SSL, and full root access in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center md:justify-start md:items-start">
            <a href="/register" className="funnel-btn funnel-btn-primary">Start Free Trial</a>
            <a href="#how-it-works" className="funnel-btn funnel-btn-subtle">See the setup flow -&gt;</a>
          </div>
        </div>

        <div className="cb-content-pad py-28 md:py-32 mt-20 md:mt-28 flex flex-col items-center justify-center gap-4">
          <TerminalCard />
          <p className="funnel-mono text-[11px] text-center text-white/20">
            automate the server work. keep shipping product.
          </p>
        </div>
      </div>

      <div className="border-t-faint cb-content-pad py-5 flex justify-center">
        <ul className="funnel-mono text-[11px] flex flex-row flex-wrap justify-center items-center gap-4 md:gap-10 w-full text-center text-white/30">
          <li>-&gt; GitHub auto-deploy</li>
          <li>-&gt; WordPress-ready VPS</li>
          <li>-&gt; Full SSH and root control</li>
        </ul>
      </div>
    </section>
  );
}
