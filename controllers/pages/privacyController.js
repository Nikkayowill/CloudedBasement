const { getHTMLHead, getScripts, getFooter, getResponsiveNav } = require('../../helpers');

exports.showPrivacy = (req, res) => {
    res.send(`
${getHTMLHead('Privacy Policy - Basement')}
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
              <li><a href="#section-1" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">1. Information We Collect</a></li>
              <li><a href="#section-2" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">2. How We Use Your Information</a></li>
              <li><a href="#section-3" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">3. Information Sharing and Disclosure</a></li>
              <li><a href="#section-4" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">4. Data Security</a></li>
              <li><a href="#section-5" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">5. Your Rights and Choices</a></li>
              <li><a href="#section-6" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">6. Data Retention</a></li>
              <li><a href="#section-7" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">7. Cookies and Tracking</a></li>
              <li><a href="#section-8" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">8. Third-Party Links</a></li>
              <li><a href="#section-9" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">9. Children's Privacy</a></li>
              <li><a href="#section-10" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">10. International Data Transfers</a></li>
              <li><a href="#section-11" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">11. Changes to This Policy</a></li>
              <li><a href="#section-12" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">12. California Privacy Rights</a></li>
              <li><a href="#section-13" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">13. European Privacy Rights</a></li>
              <li><a href="#section-14" class="toc-link block py-2 px-3 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors border-l-2 border-transparent">14. Contact Information</a></li>
            </ul>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="docs-content">
        <div class="docs-content-inner">
          <!-- Page Header -->
          <header class="mb-12">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
            <p class="text-base lg:text-lg text-gray-400 leading-relaxed">Last Updated: January 26, 2026</p>
            <p class="text-gray-400 leading-relaxed mt-4">Clouded Basement Hosting ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.</p>
          </header>

          <!-- Section 1 -->
          <section id="section-1" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">1. Information We Collect</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">1.1 Personal Information You Provide</h3>
                <p class="text-gray-300 leading-relaxed mb-4">We collect information that you voluntarily provide to us when you:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Register for an account:</strong> Email address and encrypted password</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Submit inquiries:</strong> Name, email address, phone number (if provided), and message content through our contact form</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Make purchases:</strong> Billing information including name, address, and payment card details (processed securely by our payment processor, Stripe)</div></li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">1.2 Automatically Collected Information</h3>
                <p class="text-gray-300 leading-relaxed mb-4">When you access our website, we may automatically collect certain information, including:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Log data:</strong> IP address, browser type, operating system, referring URLs, pages viewed, and timestamps</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Session data:</strong> Authentication tokens stored in cookies to maintain your logged-in state</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Device information:</strong> Screen resolution, device type, and browser capabilities</div></li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Section 2 -->
          <section id="section-2" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">2. How We Use Your Information</h2>
            <p class="text-gray-300 leading-relaxed mb-4">We use the information we collect for legitimate business purposes, including:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Service Delivery:</strong> To create and manage your account, process transactions, and deliver the services you request</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Communication:</strong> To respond to your inquiries, provide customer support, and send transactional emails regarding your account or purchases</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Security:</strong> To monitor and prevent fraudulent activity, unauthorized access, and other illegal activities</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Improvement:</strong> To analyze usage patterns, diagnose technical problems, and improve our website functionality and user experience</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Business Operations:</strong> To maintain records for accounting, auditing, and business continuity purposes</div></li>
            </ul>
          </section>

          <!-- Section 3 -->
          <section id="section-3" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">3. Information Sharing and Disclosure</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">3.1 Service Providers</h3>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Stripe, Inc.:</strong> We use Stripe to process payments. Your payment information is transmitted directly to Stripe and is subject to <a href="https://stripe.com/privacy" target="_blank" class="text-blue-400 hover:text-blue-300 underline">Stripe's Privacy Policy</a>. We never store complete payment card information on our servers.</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">DigitalOcean, LLC:</strong> Your servers are hosted on DigitalOcean infrastructure. Server IP addresses and usage data may be processed by DigitalOcean in accordance with <a href="https://www.digitalocean.com/legal/privacy-policy" target="_blank" class="text-blue-400 hover:text-blue-300 underline">DigitalOcean's Privacy Policy</a>.</div></li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">3.2 Legal Requirements</h3>
                <p class="text-gray-300 leading-relaxed">We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court order, subpoena, or government investigation).</p>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">3.3 Business Transfers</h3>
                <p class="text-gray-300 leading-relaxed">In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. You will be notified via email and/or prominent notice on our website of any such change in ownership or control.</p>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-white mb-4">3.4 Protection of Rights</h3>
                <p class="text-gray-300 leading-relaxed">We may disclose information when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a legal request.</p>
              </div>
            </div>
          </section>

          <!-- Section 4 -->
          <section id="section-4" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">4. Data Security</h2>
            <div class="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
              <ul class="space-y-3 text-gray-300">
                <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Encryption:</strong> All passwords are hashed using bcrypt with a salt factor of 10, making them irreversible and secure against brute-force attacks</div></li>
                <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Secure Transmission:</strong> We use HTTPS/TLS encryption to protect all data transmitted between your browser and our servers</div></li>
                <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Session Security:</strong> Session cookies are HTTP-only to prevent client-side script access and are configured with secure flags in production</div></li>
                <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Payment Security:</strong> All payment processing is handled by Stripe, a PCI-DSS Level 1 certified service provider. We never store complete payment card information</div></li>
                <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Database Security:</strong> User data is stored in a secured PostgreSQL database with restricted access and regular backups</div></li>
                <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Access Controls:</strong> Administrative access to user data is restricted to authorized personnel only</div></li>
              </ul>
            </div>
            <p class="text-gray-300 leading-relaxed">However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.</p>
          </section>

          <!-- Section 5 -->
          <section id="section-5" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">5. Your Rights and Choices</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">5.1 Access and Portability</h3>
                <p class="text-gray-300 leading-relaxed">You have the right to request access to the personal information we hold about you and to receive that information in a portable format.</p>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">5.2 Correction</h3>
                <p class="text-gray-300 leading-relaxed">You have the right to request correction of inaccurate or incomplete personal information.</p>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">5.3 Deletion</h3>
                <p class="text-gray-300 leading-relaxed">You have the right to request deletion of your personal information, subject to certain legal exceptions (e.g., completion of transactions, legal compliance, fraud prevention).</p>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">5.4 Objection and Restriction</h3>
                <p class="text-gray-300 leading-relaxed">You have the right to object to or request restriction of certain processing of your personal information.</p>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">5.5 Withdrawal of Consent</h3>
                <p class="text-gray-300 leading-relaxed">Where processing is based on consent, you have the right to withdraw that consent at any time.</p>
              </div>
            </div>

            <div class="bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg p-6 mt-8">
              <p class="text-gray-300 leading-relaxed">To exercise any of these rights, please contact us through our <a href="/contact" class="text-blue-400 hover:text-blue-300 underline">contact form</a>. We will respond to your request within 30 days.</p>
            </div>
          </section>

          <!-- Section 6 -->
          <section id="section-6" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">6. Data Retention</h2>
            <p class="text-gray-300 leading-relaxed">We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Account information is retained until you request deletion. Transaction records may be retained for accounting and legal compliance purposes for up to 7 years.</p>
          </section>

          <!-- Section 7 -->
          <section id="section-7" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">7. Cookies and Tracking Technologies</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">7.1 Essential Cookies</h3>
                <p class="text-gray-300 leading-relaxed mb-4">We use session cookies that are essential for the operation of our website. These cookies:</p>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Maintain your login state across pages</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Provide CSRF protection for form submissions</div></li>
                  <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Enable secure authentication</div></li>
                </ul>
                <p class="text-gray-300 leading-relaxed mt-4">These cookies are strictly necessary for the website to function and cannot be disabled without affecting core functionality.</p>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-4">7.2 Cookie Management</h3>
                <p class="text-gray-300 leading-relaxed">You can configure your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.</p>
              </div>
            </div>
          </section>

          <!-- Section 8 -->
          <section id="section-8" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">8. Third-Party Links</h2>
            <p class="text-gray-300 leading-relaxed">Our website may contain links to third-party websites or services that are not owned or controlled by Clouded Basement Hosting. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of every website you visit.</p>
          </section>

          <!-- Section 9 -->
          <section id="section-9" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">9. Children's Privacy</h2>
            <p class="text-gray-300 leading-relaxed">Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately, and we will take steps to delete such information.</p>
          </section>

          <!-- Section 10 -->
          <section id="section-10" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">10. International Data Transfers</h2>
            <p class="text-gray-300 leading-relaxed">Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those of your country. By using our services, you consent to the transfer of your information to these countries.</p>
          </section>

          <!-- Section 11 -->
          <section id="section-11" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">11. Changes to This Privacy Policy</h2>
            <p class="text-gray-300 leading-relaxed mb-4">We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Posting the updated policy on this page with a new "Last Updated" date</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Sending an email notification to the address associated with your account (for material changes)</div></li>
            </ul>
            <p class="text-gray-300 leading-relaxed mt-4">Your continued use of our services after any changes indicates your acceptance of the updated policy.</p>
          </section>

          <!-- Section 12 -->
          <section id="section-12" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">12. California Privacy Rights</h2>
            <p class="text-gray-300 leading-relaxed mb-4">If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Right to know what personal information is collected, used, shared, or sold</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Right to delete personal information held by businesses</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Right to opt-out of sale of personal information (note: we do not sell personal information)</div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div>Right to non-discrimination for exercising your CCPA rights</div></li>
            </ul>
          </section>

          <!-- Section 13 -->
          <section id="section-13" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">13. European Privacy Rights</h2>
            <p class="text-gray-300 leading-relaxed">If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with a supervisory authority if you believe our processing of your personal information violates applicable law.</p>
          </section>

          <!-- Section 14 -->
          <section id="section-14" class="mb-16 scroll-mt-24">
            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4">14. Contact Information</h2>
            <p class="text-gray-300 leading-relaxed mb-4">If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Email:</strong> Via our <a href="/contact" class="text-blue-400 hover:text-blue-300 underline">contact form</a></div></li>
              <li class="flex gap-3"><span class="text-blue-400 mt-1">•</span><div><strong class="text-white">Response Time:</strong> We aim to respond to all inquiries within 48 hours</div></li>
            </ul>

            <p class="mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm">By using Clouded Basement Hosting services, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.</p>
          </section>

        </div>
      </main>
    </div>

    ${getFooter()}
    ${getScripts('nav.js', 'docs-toc.js')}
`);
};