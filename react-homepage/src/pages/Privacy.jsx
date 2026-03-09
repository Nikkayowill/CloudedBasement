import DocLayout from '../components/DocLayout';

const TOC = [
  { id: 'section-1',  label: '1. Information We Collect' },
  { id: 'section-2',  label: '2. How We Use Your Information' },
  { id: 'section-3',  label: '3. Information Sharing and Disclosure' },
  { id: 'section-4',  label: '4. Data Security' },
  { id: 'section-5',  label: '5. Your Rights and Choices' },
  { id: 'section-6',  label: '6. Data Retention' },
  { id: 'section-7',  label: '7. Cookies and Tracking' },
  { id: 'section-8',  label: '8. Third-Party Links' },
  { id: 'section-9',  label: "9. Children's Privacy" },
  { id: 'section-10', label: '10. International Data Transfers' },
  { id: 'section-11', label: '11. Changes to This Privacy Policy' },
  { id: 'section-12', label: '12. California Privacy Rights' },
  { id: 'section-13', label: '13. European Privacy Rights' },
  { id: 'section-14', label: '14. Contact Information' },
];

function H2({ children }) {
  return (
    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4 scroll-mt-24">
      {children}
    </h2>
  );
}
function H3({ children }) {
  return <h3 className="text-xl font-semibold text-white mb-4">{children}</h3>;
}
function Body({ children }) {
  return <p className="text-gray-300 leading-relaxed">{children}</p>;
}
function Dot({ children }) {
  return (
    <li className="flex gap-3">
      <span className="text-blue-400 mt-1">•</span>
      <div className="text-gray-300">{children}</div>
    </li>
  );
}

export default function Privacy() {
  return (
    <DocLayout toc={TOC}>
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-base lg:text-lg text-gray-400 leading-relaxed">Last Updated: January 26, 2026</p>
        <p className="text-gray-400 leading-relaxed mt-4">
          Clouded Basement Hosting ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>
      </header>

      {/* 1 */}
      <section id="section-1" className="mb-16 scroll-mt-24">
        <H2 id="section-1">1. Information We Collect</H2>
        <div className="space-y-8">
          <div>
            <H3>1.1 Personal Information You Provide</H3>
            <p className="text-gray-300 leading-relaxed mb-4">We collect information that you voluntarily provide to us when you:</p>
            <ul className="space-y-3">
              <Dot><strong className="text-white">Register for an account:</strong> Email address and encrypted password</Dot>
              <Dot><strong className="text-white">Submit inquiries:</strong> Name, email address, phone number (if provided), and message content through our contact form</Dot>
              <Dot><strong className="text-white">Make purchases:</strong> Billing information including name, address, and payment card details (processed securely by our payment processor, Stripe)</Dot>
            </ul>
          </div>
          <div>
            <H3>1.2 Automatically Collected Information</H3>
            <p className="text-gray-300 leading-relaxed mb-4">When you access our website, we may automatically collect certain information, including:</p>
            <ul className="space-y-3">
              <Dot><strong className="text-white">Log data:</strong> IP address, browser type, operating system, referring URLs, pages viewed, and timestamps</Dot>
              <Dot><strong className="text-white">Session data:</strong> Authentication tokens stored in cookies to maintain your logged-in state</Dot>
              <Dot><strong className="text-white">Device information:</strong> Screen resolution, device type, and browser capabilities</Dot>
            </ul>
          </div>
        </div>
      </section>

      {/* 2 */}
      <section id="section-2" className="mb-16 scroll-mt-24">
        <H2 id="section-2">2. How We Use Your Information</H2>
        <p className="text-gray-300 leading-relaxed mb-4">We use the information we collect for legitimate business purposes, including:</p>
        <ul className="space-y-3">
          <Dot><strong className="text-white">Service Delivery:</strong> To create and manage your account, process transactions, and deliver the services you request</Dot>
          <Dot><strong className="text-white">Communication:</strong> To respond to your inquiries, provide customer support, and send transactional emails regarding your account or purchases</Dot>
          <Dot><strong className="text-white">Security:</strong> To monitor and prevent fraudulent activity, unauthorized access, and other illegal activities</Dot>
          <Dot><strong className="text-white">Improvement:</strong> To analyze usage patterns, diagnose technical problems, and improve our website functionality and user experience</Dot>
          <Dot><strong className="text-white">Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests</Dot>
          <Dot><strong className="text-white">Business Operations:</strong> To maintain records for accounting, auditing, and business continuity purposes</Dot>
        </ul>
      </section>

      {/* 3 */}
      <section id="section-3" className="mb-16 scroll-mt-24">
        <H2 id="section-3">3. Information Sharing and Disclosure</H2>
        <div className="space-y-8">
          <div>
            <H3>3.1 Service Providers</H3>
            <ul className="space-y-3">
              <Dot>
                <strong className="text-white">Stripe, Inc.:</strong> We use Stripe to process payments. Your payment information is transmitted directly to Stripe and is subject to{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 underline">Stripe's Privacy Policy</a>.
                We never store complete payment card information on our servers.
              </Dot>
              <Dot>
                <strong className="text-white">DigitalOcean, LLC:</strong> Your servers are hosted on DigitalOcean infrastructure. Server IP addresses and usage data may be processed by DigitalOcean in accordance with{' '}
                <a href="https://www.digitalocean.com/legal/privacy-policy" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 underline">DigitalOcean's Privacy Policy</a>.
              </Dot>
            </ul>
          </div>
          <div>
            <H3>3.2 Legal Requirements</H3>
            <Body>We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court order, subpoena, or government investigation).</Body>
          </div>
          <div>
            <H3>3.3 Business Transfers</H3>
            <Body>In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. You will be notified via email and/or prominent notice on our website of any such change in ownership or control.</Body>
          </div>
          <div>
            <H3>3.4 Protection of Rights</H3>
            <Body>We may disclose information when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a legal request.</Body>
          </div>
        </div>
      </section>

      {/* 4 */}
      <section id="section-4" className="mb-16 scroll-mt-24">
        <H2 id="section-4">4. Data Security</H2>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
          <ul className="space-y-3">
            <Dot><strong className="text-white">Encryption:</strong> All passwords are hashed using bcrypt with a salt factor of 10, making them irreversible and secure against brute-force attacks</Dot>
            <Dot><strong className="text-white">Secure Transmission:</strong> We use HTTPS/TLS encryption to protect all data transmitted between your browser and our servers</Dot>
            <Dot><strong className="text-white">Session Security:</strong> Session cookies are HTTP-only to prevent client-side script access and are configured with secure flags in production</Dot>
            <Dot><strong className="text-white">Payment Security:</strong> All payment processing is handled by Stripe, a PCI-DSS Level 1 certified service provider. We never store complete payment card information</Dot>
            <Dot><strong className="text-white">Database Security:</strong> User data is stored in a secured PostgreSQL database with restricted access and regular backups</Dot>
            <Dot><strong className="text-white">Access Controls:</strong> Administrative access to user data is restricted to authorized personnel only</Dot>
          </ul>
        </div>
        <Body>However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.</Body>
      </section>

      {/* 5 */}
      <section id="section-5" className="mb-16 scroll-mt-24">
        <H2 id="section-5">5. Your Rights and Choices</H2>
        <div className="space-y-8">
          <div><H3>5.1 Access and Portability</H3><Body>You have the right to request access to the personal information we hold about you and to receive that information in a portable format.</Body></div>
          <div><H3>5.2 Correction</H3><Body>You have the right to request correction of inaccurate or incomplete personal information.</Body></div>
          <div><H3>5.3 Deletion</H3><Body>You have the right to request deletion of your personal information, subject to certain legal exceptions (e.g., completion of transactions, legal compliance, fraud prevention).</Body></div>
          <div><H3>5.4 Objection and Restriction</H3><Body>You have the right to object to or request restriction of certain processing of your personal information.</Body></div>
          <div><H3>5.5 Withdrawal of Consent</H3><Body>Where processing is based on consent, you have the right to withdraw that consent at any time.</Body></div>
        </div>
        <div className="bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg p-6 mt-8">
          <p className="text-gray-300 leading-relaxed">
            To exercise any of these rights, please contact us through our{' '}
            <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">contact form</a>. We will respond to your request within 30 days.
          </p>
        </div>
      </section>

      {/* 6 */}
      <section id="section-6" className="mb-16 scroll-mt-24">
        <H2 id="section-6">6. Data Retention</H2>
        <Body>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Account information is retained until you request deletion. Transaction records may be retained for accounting and legal compliance purposes for up to 7 years.</Body>
      </section>

      {/* 7 */}
      <section id="section-7" className="mb-16 scroll-mt-24">
        <H2 id="section-7">7. Cookies and Tracking Technologies</H2>
        <div className="space-y-8">
          <div>
            <H3>7.1 Essential Cookies</H3>
            <p className="text-gray-300 leading-relaxed mb-4">We use session cookies that are essential for the operation of our website. These cookies:</p>
            <ul className="space-y-3">
              <Dot>Maintain your login state across pages</Dot>
              <Dot>Provide CSRF protection for form submissions</Dot>
              <Dot>Enable secure authentication</Dot>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">These cookies are strictly necessary for the website to function and cannot be disabled without affecting core functionality.</p>
          </div>
          <div>
            <H3>7.2 Cookie Management</H3>
            <Body>You can configure your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.</Body>
          </div>
        </div>
      </section>

      {/* 8 */}
      <section id="section-8" className="mb-16 scroll-mt-24">
        <H2 id="section-8">8. Third-Party Links</H2>
        <Body>Our website may contain links to third-party websites or services that are not owned or controlled by Clouded Basement Hosting. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of every website you visit.</Body>
      </section>

      {/* 9 */}
      <section id="section-9" className="mb-16 scroll-mt-24">
        <H2 id="section-9">9. Children's Privacy</H2>
        <Body>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately, and we will take steps to delete such information.</Body>
      </section>

      {/* 10 */}
      <section id="section-10" className="mb-16 scroll-mt-24">
        <H2 id="section-10">10. International Data Transfers</H2>
        <Body>Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those of your country. By using our services, you consent to the transfer of your information to these countries.</Body>
      </section>

      {/* 11 */}
      <section id="section-11" className="mb-16 scroll-mt-24">
        <H2 id="section-11">11. Changes to This Privacy Policy</H2>
        <p className="text-gray-300 leading-relaxed mb-4">We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by:</p>
        <ul className="space-y-3">
          <Dot>Posting the updated policy on this page with a new "Last Updated" date</Dot>
          <Dot>Sending an email notification to the address associated with your account (for material changes)</Dot>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">Your continued use of our services after any changes indicates your acceptance of the updated policy.</p>
      </section>

      {/* 12 */}
      <section id="section-12" className="mb-16 scroll-mt-24">
        <H2 id="section-12">12. California Privacy Rights</H2>
        <p className="text-gray-300 leading-relaxed mb-4">If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):</p>
        <ul className="space-y-3">
          <Dot>Right to know what personal information is collected, used, shared, or sold</Dot>
          <Dot>Right to delete personal information held by businesses</Dot>
          <Dot>Right to opt-out of sale of personal information (note: we do not sell personal information)</Dot>
          <Dot>Right to non-discrimination for exercising your CCPA rights</Dot>
        </ul>
      </section>

      {/* 13 */}
      <section id="section-13" className="mb-16 scroll-mt-24">
        <H2 id="section-13">13. European Privacy Rights</H2>
        <Body>If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with a supervisory authority if you believe our processing of your personal information violates applicable law.</Body>
      </section>

      {/* 14 */}
      <section id="section-14" className="mb-16 scroll-mt-24">
        <H2 id="section-14">14. Contact Information</H2>
        <p className="text-gray-300 leading-relaxed mb-4">If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
        <ul className="space-y-3">
          <Dot>
            <strong className="text-white">Email:</strong> Via our{' '}
            <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">contact form</a>
          </Dot>
          <Dot><strong className="text-white">Response Time:</strong> We aim to respond to all inquiries within 48 hours</Dot>
        </ul>
        <p className="mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm">
          By using Clouded Basement Hosting services, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
        </p>
      </section>
    </DocLayout>
  );
}
