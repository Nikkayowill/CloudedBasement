export default function ProblemSection() {
  return (
    <section className="funnel-section funnel-bg-problem">
      <div className="funnel-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT COLUMN: Copy */}
          <div className="funnel-problem-copy space-y-5">
            <p className="funnel-kicker reveal">The Problem</p>
            <h2 className="funnel-heading-2 reveal">
              Every hour on config<br className="hidden sm:inline" /> is an hour not&nbsp;shipping.
            </h2>
            <div className="space-y-4 text-gray-400">
              <p className="funnel-body reveal">
                You want to push and see it live. Instead you're debugging Nginx configs, chasing SSL errors, and fixing deploy scripts that fail without&nbsp;a&nbsp;trace.
              </p>
              <p className="funnel-body reveal">
                You didn't sign up to be a sysadmin. That part should already be&nbsp;handled.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Terminal Card */}
          <div className="reveal">
            <div className="w-full max-w-lg mx-auto lg:max-w-none lg:ml-auto">

              {/* Terminal window */}
              <div className="rounded-lg border bg-[#0d0d15] shadow-xl overflow-hidden max-h-[400px]">

                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                  <span className="text-[10px] text-gray-600 ml-2 font-mono">deploy@vps:~$</span>
                </div>

                {/* Terminal content */}
                <div className="px-4 py-3.5 space-y-2 font-mono text-[10.5px] leading-[1.5] text-gray-400">

                  {/* Command 1: nginx config error */}
                  <div className="space-y-0.5">
                    <p>
                      <span className="text-green-400">$</span>{' '}
                      <span className="text-gray-300">sudo nginx -t</span>
                    </p>
                    <p className="text-red-400 pl-2">nginx: [emerg] unknown directive &quot;proxy_passs&quot;</p>
                    <p className="text-red-400 pl-2">nginx: configuration file test failed</p>
                  </div>

                  {/* Command 2: SSL / DNS failure */}
                  <div className="space-y-0.5 pt-1">
                    <p>
                      <span className="text-green-400">$</span>{' '}
                      <span className="text-gray-300">sudo certbot --nginx -d myapp.com</span>
                    </p>
                    <p className="text-red-400 pl-2">DNS problem: NXDOMAIN looking up A for myapp.com</p>
                    <p className="text-gray-500 pl-2">check DNS A record or wait for propagation</p>
                  </div>

                  {/* Command 3: Service failed */}
                  <div className="space-y-0.5 pt-1">
                    <p>
                      <span className="text-green-400">$</span>{' '}
                      <span className="text-gray-300">sudo systemctl status myapp</span>
                    </p>
                    <p>
                      <span className="text-red-500">●</span>{' '}
                      <span className="text-gray-300">myapp.service</span>
                      {' '}-{' '}
                      <span className="text-red-400">failed</span>
                    </p>
                    <p className="text-gray-500 pl-4">Error: EADDRINUSE: port 3000 already in use</p>
                  </div>

                  {/* Command 4: Firewall check */}
                  <div className="space-y-0.5 pt-1">
                    <p>
                      <span className="text-green-400">$</span>{' '}
                      <span className="text-gray-300">sudo ufw status</span>
                    </p>
                    <p>
                      <span className="text-gray-400">Status:</span>{' '}
                      <span className="text-yellow-400">inactive</span>
                      <span className="text-gray-600 text-[9px]"> (port 22 open to world)</span>
                    </p>
                  </div>

                  {/* Command 5: Blinking cursor */}
                  <div className="pt-1.5">
                    <span className="text-green-400">$</span>
                    <span className="inline-block w-1.5 h-3 bg-gray-300 ml-1 animate-pulse align-middle"></span>
                  </div>

                </div>
              </div>

              {/* Caption */}
              <p className="text-center mt-3 text-[11px] text-gray-600 italic font-light">
                3 hours in. Still not deployed.
              </p>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
