const { getHTMLHead, getScripts, getFooter, getResponsiveNav } = require('../../src/utils/helpers');

exports.showSafety = (req, res) => {
  res.send(`
${getHTMLHead('Security & Trust - Clouded Basement')}
    <link rel="stylesheet" href="/css/docs.css">
    ${getResponsiveNav(req)}

    <!-- Mobile TOC toggle -->
    <button class="docs-toc-toggle" id="docsTocToggle" aria-label="Table of contents">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h10M4 18h16"/></svg>
    </button>
    <button class="scroll-to-top" id="scrollToTop" aria-label="Scroll to top">
      <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
    </button>
    <div class="docs-sidebar-backdrop" id="docsSidebarBackdrop"></div>

    <div class="docs-layout">
      <!-- Sidebar TOC -->
      <aside class="docs-sidebar" id="docsSidebar">
        <div class="px-5 py-8">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-6">On This Page</h2>
          <nav>
            <ul class="space-y-1">
              <li><a href="#payment" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">Payment Security</a></li>
              <li><a href="#platform" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">Platform Security</a></li>
              <li><a href="#infrastructure" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">Infrastructure</a></li>
              <li><a href="#ownership" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">Data Ownership & Portability</a></li>
              <li><a href="#transparency" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">Transparency</a></li>
              <li><a href="#support" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">Support</a></li>
            </ul>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="docs-content">
        <div class="docs-content-inner">
          <!-- Page Header -->
          <header class="mb-12">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Security &amp; Trust</h1>
            <p class="text-base lg:text-lg text-gray-400 leading-relaxed">How we protect your data, payments, and infrastructure.</p>
          </header>

          <!-- Payment Security -->
          <section id="payment" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Payment Security</h2>
            <p class="text-gray-300 leading-relaxed mb-6">All payment processing is handled by <a href="https://stripe.com" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 underline">Stripe</a>, a PCI DSS Level 1 certified payment processor trusted by millions of businesses worldwide.</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Card data never touches our servers</strong> — payment information is transmitted directly to Stripe via their secure Elements SDK</div></li>
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">3D Secure authentication</strong> — supported automatically for cards that require additional verification</div></li>
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Full refund capability</strong> — cancel anytime, no hidden fees or long-term contracts</div></li>
            </ul>
          </section>

          <!-- Platform Security -->
          <section id="platform" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Platform Security</h2>
            <p class="text-gray-300 leading-relaxed mb-6">Clouded Basement is built with industry-standard security practices:</p>
            <div class="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <ul class="space-y-3 text-gray-300">
                <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Password hashing</strong> — all passwords are hashed using bcrypt with per-user salts, making them unreadable even in the event of a data breach</div></li>
                <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">SQL injection protection</strong> — all database queries use parameterized statements, preventing malicious input from accessing or modifying data</div></li>
                <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">CSRF protection</strong> — all forms include cross-site request forgery tokens, preventing unauthorized actions on your behalf</div></li>
                <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Rate limiting</strong> — authentication and sensitive endpoints are rate-limited to prevent brute-force attacks</div></li>
                <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">HTTPS everywhere</strong> — all traffic is encrypted using TLS 1.2+ with valid SSL certificates</div></li>
                <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">HTTP security headers</strong> — we use Helmet.js to set secure headers including Content Security Policy, X-Frame-Options, and more</div></li>
              </ul>
            </div>
            <p class="text-gray-400 text-sm mt-4">For a complete overview, see our <a href="/docs" class="text-blue-400 hover:text-blue-300 underline">documentation</a> and <a href="/privacy" class="text-blue-400 hover:text-blue-300 underline">privacy policy</a>.</p>
          </section>

          <!-- Infrastructure -->
          <section id="infrastructure" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Infrastructure</h2>
            <p class="text-gray-300 leading-relaxed mb-6">Your server runs on <a href="https://www.digitalocean.com" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 underline">DigitalOcean</a> infrastructure — the same cloud platform trusted by companies like GitLab, Slack, and Docker.</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Dedicated VPS</strong> — each customer gets their own isolated virtual private server, not shared hosting</div></li>
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Ubuntu 22.04 LTS</strong> — long-term support releases with security updates until 2027</div></li>
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Automatic SSL</strong> — Let's Encrypt certificates provisioned and renewed automatically</div></li>
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Full root access</strong> — complete control over your server via SSH</div></li>
            </ul>
          </section>

          <!-- Data Ownership -->
          <section id="ownership" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Data Ownership &amp; Portability</h2>
            <p class="text-gray-300 leading-relaxed mb-6">Your code and data remain entirely yours. Clouded Basement has no vendor lock-in by design:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Full SSH access</strong> — export, backup, or migrate your data at any time</div></li>
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Standard deployment</strong> — your server uses standard tools (Node.js, systemd, Nginx) with no proprietary configurations</div></li>
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div><strong class="text-white">Business continuity</strong> — even if Clouded Basement ceased operations, your server would continue running on DigitalOcean with your existing credentials</div></li>
            </ul>
            <p class="text-gray-400 text-sm mt-4">See our <a href="/terms" class="text-blue-400 hover:text-blue-300 underline">terms of service</a> for complete details on data ownership and usage rights.</p>
          </section>

          <!-- Transparency -->
          <section id="transparency" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Transparency</h2>
            <p class="text-gray-300 leading-relaxed mb-6">Clouded Basement is designed for developers and small teams shipping side projects, MVPs, and production applications. We are not positioned as an enterprise compliance platform:</p>
            <div class="bg-yellow-950/20 border-l-4 border-yellow-500 rounded-r-lg p-6 mb-6">
              <ul class="space-y-3 text-gray-300">
                <li class="flex gap-3"><span class="text-yellow-400 mt-1">•</span><div>Not suitable for HIPAA, SOC 2, or regulated data that requires specialized compliance certifications</div></li>
                <li class="flex gap-3"><span class="text-yellow-400 mt-1">•</span><div>Operated by a solo founder — support is direct and personal, but not 24/7 SLA-backed</div></li>
                <li class="flex gap-3"><span class="text-yellow-400 mt-1">•</span><div>New platform — launched in 2026, with an active development roadmap</div></li>
              </ul>
            </div>
            <p class="text-gray-300 leading-relaxed">We believe in being upfront about what we are and aren't. If you have specific compliance requirements, please <a href="/contact" class="text-blue-400 hover:text-blue-300 underline">contact us</a> to discuss whether Clouded Basement is the right fit.</p>
          </section>

          <!-- Support -->
          <section id="support" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">Support</h2>
            <p class="text-gray-300 leading-relaxed mb-6">When you contact support, you're communicating directly with the founder who built the platform. Response time is typically within 24 hours for all inquiries.</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div>Email support for provisioning, deployment, and configuration issues</div></li>
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div>Free migration assistance for early adopters moving from other hosts</div></li>
              <li class="flex gap-3"><span class="text-green-400 mt-1">✓</span><div>Dashboard ticket system for tracking ongoing issues</div></li>
            </ul>
          </section>

          <!-- CTA -->
          <div class="mt-4 pt-8 border-t border-gray-800 text-center">
            <a href="/pricing" class="inline-block px-8 py-4 text-white bg-brand rounded-lg hover:bg-cyan-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(45,167,223,0.6)] transition-all font-bold uppercase tracking-wider text-sm">View Plans</a>
            <p class="text-gray-500 text-sm mt-4">Questions? <a href="/contact" class="text-blue-400 hover:text-blue-300 underline">Contact us</a> or review our <a href="/faq" class="text-blue-400 hover:text-blue-300 underline">FAQ</a>.</p>
          </div>

        </div>
      </main>
    </div>

    ${getFooter()}
    ${getScripts('nav.js', 'docs-toc.js')}
  `);
};