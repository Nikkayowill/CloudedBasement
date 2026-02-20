const { getHTMLHead, getScripts, getFooter, getResponsiveNav } = require('../../helpers');

exports.showTerms = (req, res) => {
  res.send(`
${getHTMLHead('Terms of Service - Basement')}
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
              <li><a href="#section-1" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">1. Acceptance of Terms</a></li>
              <li><a href="#section-2" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">2. Service Description</a></li>
              <li><a href="#section-3" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">3. Account Registration & Security</a></li>
              <li><a href="#section-4" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">4. Payment Terms</a></li>
              <li><a href="#section-5" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">5. Refund Policy</a></li>
              <li><a href="#section-6" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">6. Acceptable Use & Resource Limits</a></li>
              <li><a href="#section-7" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">7. Intellectual Property</a></li>
              <li><a href="#section-8" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">8. Data Privacy & Security</a></li>
              <li><a href="#section-9" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">9. Service Level and Uptime</a></li>
              <li><a href="#section-10" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">10. Limitation of Liability</a></li>
              <li><a href="#section-11" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">11. Indemnification</a></li>
              <li><a href="#section-12" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">12. Termination</a></li>
              <li><a href="#section-13" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">13. Modifications to Terms</a></li>
              <li><a href="#section-14" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">14. Governing Law and Jurisdiction</a></li>
              <li><a href="#section-15" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">15. Dispute Resolution</a></li>
              <li><a href="#section-16" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">16. Severability</a></li>
              <li><a href="#section-17" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">17. Entire Agreement</a></li>
              <li><a href="#section-18" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">18. Contact Information</a></li>
            </ul>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="docs-content">
        <div class="docs-content-inner">
          <!-- Page Header -->
          <header class="mb-12">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Terms of Service</h1>
            <p class="text-base lg:text-lg text-gray-400 leading-relaxed">Last Updated: January 26, 2026</p>
            <p class="text-gray-400 leading-relaxed mt-4">Welcome to <strong class="text-white">Clouded Basement Hosting</strong> ("we," "us," "our," or "the Company"). These Terms of Service ("Terms") govern your access to and use of our cloud hosting services, including virtual private servers (VPS), domain management, and related services (collectively, the "Services"). By creating an account or using our Services, you agree to be bound by these Terms.</p>
          </header>

          <!-- Section 1 -->
          <section id="section-1" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">1. Acceptance of Terms</h2>
            <p class="text-gray-300 leading-relaxed mb-4">By accessing or using our Services, you represent that you:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Are at least 18 years of age or the age of majority in your jurisdiction</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Have the legal capacity to enter into a binding contract</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Agree to comply with all applicable laws and regulations</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Have read, understood, and accepted these Terms in their entirety</div></li>
            </ul>
            <p class="text-gray-300 leading-relaxed mt-4">If you do not agree to these Terms, you must not use our Services.</p>
          </section>

          <!-- Section 2 -->
          <section id="section-2" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">2. Service Description</h2>
            <p class="text-gray-300 leading-relaxed mb-4">Clouded Basement Hosting provides cloud infrastructure services including:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Virtual Private Servers (VPS):</strong> Ubuntu 22.04 server instances with full SSH root access</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Custom Domain Support:</strong> Point your domains to your server IP with DNS configuration guidance</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">SSL Certificates:</strong> One-click Let's Encrypt SSL installation for HTTPS</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Git Deployment:</strong> Automated code deployment from GitHub, GitLab, or Bitbucket repositories</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Support Services:</strong> Technical assistance via ticketing system</div></li>
            </ul>
            <p class="text-gray-300 leading-relaxed mt-4">Services are provided on a subscription basis with monthly billing cycles. We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time with reasonable notice.</p>
          </section>

          <!-- Section 3 -->
          <section id="section-3" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">3. Account Registration and Security</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">3.1 Account Creation</h3>
                <p class="text-gray-300 leading-relaxed mb-4">To use our Services, you must create an account by providing accurate, current, and complete information. You agree to:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Provide a valid email address for account verification</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Create a secure password (minimum 8 characters)</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Keep your account information up to date</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Accept these Terms of Service during registration</div></li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">3.2 Account Security</h3>
                <p class="text-gray-300 leading-relaxed mb-4">You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Immediately notify us of any unauthorized use of your account</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Not share your account credentials with any third party</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Use strong, unique passwords and enable two-factor authentication when available</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Log out of your account at the end of each session when using shared devices</div></li>
                </ul>
                <p class="text-gray-300 leading-relaxed mt-4">We are not liable for any loss or damage arising from your failure to protect your account credentials.</p>
              </div>
            </div>
          </section>

          <!-- Section 4 -->
          <section id="section-4" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">4. Payment Terms</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">4.1 Pricing and Billing</h3>
                <p class="text-gray-300 leading-relaxed mb-4">Our Services are offered on a subscription basis with the following terms:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Billing Cycle:</strong> Monthly recurring charges</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Payment Methods:</strong> Credit card, debit card, and other methods accepted through Stripe</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Currency:</strong> All prices are in Canadian Dollars (CAD) unless otherwise stated</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Automatic Renewal:</strong> Subscriptions automatically renew at the end of each billing period</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Price Changes:</strong> We reserve the right to modify pricing with 30 days' advance notice</div></li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">4.2 Free Trial</h3>
                <p class="text-gray-300 leading-relaxed mb-4">New users may be eligible for a <strong class="text-white">3-day free trial</strong> of our Basic plan:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Trial includes a fully functional server with all Basic plan features</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>No credit card required to start the trial</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>One free trial per user (determined by email address)</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>At the end of 3 days, your server will be suspended unless you subscribe</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>You can upgrade to a paid plan at any time during the trial</div></li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">4.3 Payment Processing</h3>
                <p class="text-gray-300 leading-relaxed mb-4">All payments are processed securely through Stripe, Inc. By providing payment information, you:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Authorize us to charge your payment method for all fees incurred</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Agree to Stripe's terms of service and privacy policy</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Represent that you have the legal right to use the payment method provided</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Understand that we do not store your complete payment card information</div></li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">4.4 Taxes</h3>
                <p class="text-gray-300 leading-relaxed">Prices do not include applicable taxes, duties, or fees. You are responsible for paying all taxes associated with your use of the Services, including but not limited to sales tax, GST/HST, and VAT as required by your jurisdiction.</p>
              </div>
            </div>
          </section>

          <!-- Section 5 -->
          <section id="section-5" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">5. Refund Policy</h2>
            <p class="text-gray-300 leading-relaxed mb-4">All sales are final. Subscriptions are <strong class="text-white">non-refundable</strong> except in the following circumstances:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Service Failure:</strong> If we are unable to provision your server within 24 hours of payment, you will receive a full automatic refund</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Billing Errors:</strong> Duplicate charges or billing mistakes will be refunded promptly</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Extraordinary Circumstances:</strong> Refunds may be issued at our sole discretion for exceptional situations</div></li>
            </ul>
            <p class="text-gray-300 leading-relaxed mt-4">You may cancel your subscription at any time via support ticket. Your service will remain active until the end of your current billing period, but no refund will be issued for unused time.</p>
          </section>

          <!-- Section 6 -->
          <section id="section-6" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">6. Acceptable Use &amp; Resource Limits</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">6.1 Prohibited Activities</h3>
                <p class="text-gray-300 leading-relaxed mb-4">You agree to use our Services only for lawful purposes and in compliance with these Terms. Prohibited activities include but are not limited to:</p>
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <ul class="space-y-3 text-gray-300">
                    <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Illegal Activities:</strong> Hosting, distributing, or linking to illegal content or engaging in criminal activity</div></li>
                    <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Malicious Software:</strong> Distributing viruses, malware, ransomware, or other harmful code</div></li>
                    <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Spam and Abuse:</strong> Sending unsolicited bulk email, phishing attempts, or fraudulent communications</div></li>
                    <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Network Attacks:</strong> Port scanning, DDoS attacks, or attempts to compromise other systems</div></li>
                    <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Resource Abuse:</strong> Excessive CPU usage (including cryptocurrency mining), bandwidth abuse, or activities that degrade service performance for other users</div></li>
                    <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Intellectual Property Infringement:</strong> Hosting pirated software, copyrighted content without authorization, or counterfeit materials</div></li>
                    <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Illegal Adult Content:</strong> Child sexual abuse material (CSAM), revenge porn, or other illegal pornographic content</div></li>
                    <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Harassment:</strong> Using Services to harass, threaten, stalk, or defame individuals or organizations</div></li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">6.2 Resource Limits</h3>
                <p class="text-gray-300 leading-relaxed">Each plan includes a dedicated virtual private server with defined resource limits (CPU, memory, storage, bandwidth). Customers are responsible for activity occurring on their server, including usage via SSH or deployed applications.</p>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">6.3 Enforcement &amp; Safeguards</h3>
                <p class="text-gray-300 leading-relaxed mb-4">Usage that intentionally or unintentionally exceeds plan limits, violates provider policies, or risks unexpected infrastructure costs may be limited, paused, or suspended at our discretion. When possible, we will attempt to notify customers before taking action.</p>
                <p class="text-gray-300 leading-relaxed">We reserve the right to enforce reasonable safeguards to ensure platform stability, cost predictability, and continued service availability.</p>
              </div>
            </div>
          </section>

          <!-- Section 7 -->
          <section id="section-7" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">7. Intellectual Property</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">7.1 Our Intellectual Property</h3>
                <p class="text-gray-300 leading-relaxed">The Clouded Basement Hosting brand, including our name, logo, website design, and trademarks, are owned by the Company and protected by copyright and trademark laws. You may not use our branding without written permission.</p>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">7.2 Source Code Availability</h3>
                <p class="text-gray-300 leading-relaxed mb-4">The source code for this platform is publicly viewable for educational and transparency purposes. However:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Viewing and studying the code for learning purposes is permitted</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>The "Clouded Basement Hosting" brand name, logo, and associated trademarks remain proprietary</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Deploying a competing commercial service using this codebase requires explicit written permission</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Contributions to the project may be accepted via GitHub pull requests</div></li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">7.3 User Content</h3>
                <p class="text-gray-300 leading-relaxed">You retain full ownership of all content, data, and applications you deploy on our Services. By using our Services, you grant us a limited license to host, store, and transmit your content solely for the purpose of providing the Services to you.</p>
              </div>
            </div>
          </section>

          <!-- Section 8 -->
          <section id="section-8" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">8. Data Privacy and Security</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">8.1 Data Collection</h3>
                <p class="text-gray-300 leading-relaxed mb-4">We collect and process personal information as described in our Privacy Policy, including:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Account information (email address, password hash)</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Payment information (processed securely through Stripe)</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Server deployment details and usage logs</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Support ticket communications</div></li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">8.2 Data Security</h3>
                <p class="text-gray-300 leading-relaxed mb-4">We implement industry-standard security measures to protect your data, including:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>HTTPS encryption for all web traffic</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Secure session management with CSRF protection</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Encrypted password storage using bcrypt</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Regular security audits and updates</div></li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">8.3 Data Retention</h3>
                <p class="text-gray-300 leading-relaxed">We retain your account data for the duration of your active subscription and for a reasonable period thereafter as required by law or for legitimate business purposes. You may request data deletion by contacting support.</p>
              </div>
            </div>
          </section>

          <!-- Section 9 -->
          <section id="section-9" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">9. Service Level and Uptime</h2>
            <p class="text-gray-300 leading-relaxed mb-4">While we strive to provide reliable service, we do not guarantee uninterrupted availability. Our Services are provided on an "as-is" and "as-available" basis. We do not warrant that:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Services will be available 100% of the time without interruption</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Services will be error-free or meet your specific requirements</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Data transmission will be secure or free from interception</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Servers will be immune from attacks, hardware failures, or network issues</div></li>
            </ul>
            <p class="text-gray-300 leading-relaxed mt-4">Scheduled maintenance will be announced in advance when possible. We are not liable for downtime, data loss, or service interruptions.</p>
          </section>

          <!-- Section 10 -->
          <section id="section-10" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">10. Limitation of Liability</h2>
            <p class="text-gray-300 leading-relaxed mb-4">To the maximum extent permitted by law:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>We are not liable for any indirect, incidental, special, consequential, or punitive damages</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>We are not responsible for losses resulting from unauthorized access to your account</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>We are not liable for third-party services, content, or links provided through our platform</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>We do not guarantee backup or recovery of your data — regular backups are your responsibility</div></li>
            </ul>
          </section>

          <!-- Section 11 -->
          <section id="section-11" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">11. Indemnification</h2>
            <p class="text-gray-300 leading-relaxed mb-4">You agree to indemnify, defend, and hold harmless the Company, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Your use of the Services</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Your violation of these Terms</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Your violation of any third-party rights, including intellectual property rights</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Content or applications you deploy on our infrastructure</div></li>
            </ul>
          </section>

          <!-- Section 12 -->
          <section id="section-12" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">12. Termination</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">12.1 Termination by You</h3>
                <p class="text-gray-300 leading-relaxed mb-4">You may cancel your subscription at any time through your account dashboard. Upon cancellation:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>You will continue to have access until the end of your current billing period</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>No further charges will be made after the current period ends</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Your servers and data may be deleted after 30 days</div></li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">12.2 Termination by Us</h3>
                <p class="text-gray-300 leading-relaxed mb-4">We reserve the right to suspend or terminate your account immediately without notice if:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>You violate these Terms or our Acceptable Use Policy</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Your account is used for fraudulent or illegal activities</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Payment fails and remains outstanding after 7 days</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>You engage in abusive behavior toward our staff or other users</div></li>
                </ul>
                <p class="text-gray-300 leading-relaxed mt-4">Termination for cause does not entitle you to a refund. We may delete your data immediately upon termination for violations.</p>
              </div>
            </div>
          </section>

          <!-- Section 13 -->
          <section id="section-13" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">13. Modifications to Terms</h2>
            <p class="text-gray-300 leading-relaxed">We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website. Continued use of the Services after changes constitutes acceptance of the modified Terms. Material changes will be communicated via email when possible.</p>
          </section>

          <!-- Section 14 -->
          <section id="section-14" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">14. Governing Law and Jurisdiction</h2>
            <p class="text-gray-300 leading-relaxed">These Terms are governed by the laws of the Province of Nova Scotia and the federal laws of Canada applicable therein, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Services shall be subject to the exclusive jurisdiction of the courts located in <strong class="text-white">Halifax, Nova Scotia, Canada</strong>.</p>
          </section>

          <!-- Section 15 -->
          <section id="section-15" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">15. Dispute Resolution</h2>
            <p class="text-gray-300 leading-relaxed">In the event of a dispute, you agree to first attempt to resolve the matter informally by contacting our support team. If the dispute cannot be resolved within 30 days, either party may pursue legal remedies in accordance with Section 14.</p>
          </section>

          <!-- Section 16 -->
          <section id="section-16" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">16. Severability</h2>
            <p class="text-gray-300 leading-relaxed">If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.</p>
          </section>

          <!-- Section 17 -->
          <section id="section-17" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">17. Entire Agreement</h2>
            <p class="text-gray-300 leading-relaxed">These Terms, together with our Privacy Policy and any supplemental terms for specific Services, constitute the entire agreement between you and Clouded Basement Hosting regarding your use of the Services.</p>
          </section>

          <!-- Section 18 -->
          <section id="section-18" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">18. Contact Information</h2>
            <p class="text-gray-300 leading-relaxed mb-4">If you have questions about these Terms or need to contact us regarding your account, please reach out:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Email:</strong> <a href="mailto:support@cloudedbasement.ca" class="text-blue-400 hover:text-blue-300 underline">support@cloudedbasement.ca</a></div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Support Tickets:</strong> Available through your account dashboard</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Company Name:</strong> Clouded Basement Hosting</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Location:</strong> Halifax, Nova Scotia, Canada</div></li>
            </ul>

            <p class="mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm">By creating an account or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
          </section>

        </div>
      </main>
    </div>

    ${getFooter()}
    ${getScripts('nav.js', 'docs-toc.js')}
  `);
};