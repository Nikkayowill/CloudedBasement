import DocLayout from '../components/DocLayout';

const TOC = [
  { id: 'section-1',  label: '1. Acceptance of Terms' },
  { id: 'section-2',  label: '2. Service Description' },
  { id: 'section-3',  label: '3. Account Registration & Security' },
  { id: 'section-4',  label: '4. Payment Terms' },
  { id: 'section-5',  label: '5. Refund Policy' },
  { id: 'section-6',  label: '6. Acceptable Use & Resource Limits' },
  { id: 'section-7',  label: '7. Intellectual Property' },
  { id: 'section-8',  label: '8. Data Privacy & Security' },
  { id: 'section-9',  label: '9. Service Level and Uptime' },
  { id: 'section-10', label: '10. Limitation of Liability' },
  { id: 'section-11', label: '11. Indemnification' },
  { id: 'section-12', label: '12. Termination' },
  { id: 'section-13', label: '13. Modifications to Terms' },
  { id: 'section-14', label: '14. Governing Law and Jurisdiction' },
  { id: 'section-15', label: '15. Dispute Resolution' },
  { id: 'section-16', label: '16. Severability' },
  { id: 'section-17', label: '17. Entire Agreement' },
  { id: 'section-18', label: '18. Contact Information' },
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

export default function Terms() {
  return (
    <DocLayout toc={TOC}>
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-base lg:text-lg text-gray-400 leading-relaxed">Last Updated: January 26, 2026</p>
        <p className="text-gray-400 leading-relaxed mt-4">
          Welcome to <strong className="text-white">Clouded Basement Hosting</strong> ("we," "us," "our," or "the Company"). These Terms of Service ("Terms") govern your access to and use of our cloud hosting services, including virtual private servers (VPS), domain management, and related services (collectively, the "Services"). By creating an account or using our Services, you agree to be bound by these Terms.
        </p>
      </header>

      {/* 1 */}
      <section id="section-1" className="mb-16 scroll-mt-24">
        <H2 id="section-1">1. Acceptance of Terms</H2>
        <p className="text-gray-300 leading-relaxed mb-4">By accessing or using our Services, you represent that you:</p>
        <ul className="space-y-3">
          <Dot>Are at least 18 years of age or the age of majority in your jurisdiction</Dot>
          <Dot>Have the legal capacity to enter into a binding contract</Dot>
          <Dot>Agree to comply with all applicable laws and regulations</Dot>
          <Dot>Have read, understood, and accepted these Terms in their entirety</Dot>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">If you do not agree to these Terms, you must not use our Services.</p>
      </section>

      {/* 2 */}
      <section id="section-2" className="mb-16 scroll-mt-24">
        <H2 id="section-2">2. Service Description</H2>
        <p className="text-gray-300 leading-relaxed mb-4">Clouded Basement Hosting provides cloud infrastructure services including:</p>
        <ul className="space-y-3">
          <Dot><strong className="text-white">Virtual Private Servers (VPS):</strong> Ubuntu 22.04 server instances with full SSH root access</Dot>
          <Dot><strong className="text-white">Custom Domain Support:</strong> Point your domains to your server IP with DNS configuration guidance</Dot>
          <Dot><strong className="text-white">SSL Certificates:</strong> One-click Let's Encrypt SSL installation for HTTPS</Dot>
          <Dot><strong className="text-white">Git Deployment:</strong> Automated code deployment from GitHub, GitLab, or Bitbucket repositories</Dot>
          <Dot><strong className="text-white">Support Services:</strong> Technical assistance via ticketing system</Dot>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">Services are provided on a subscription basis with monthly billing cycles. We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time with reasonable notice.</p>
      </section>

      {/* 3 */}
      <section id="section-3" className="mb-16 scroll-mt-24">
        <H2 id="section-3">3. Account Registration and Security</H2>
        <div className="space-y-8">
          <div>
            <H3>3.1 Account Creation</H3>
            <p className="text-gray-300 leading-relaxed mb-4">To use our Services, you must create an account by providing accurate, current, and complete information. You agree to:</p>
            <ul className="space-y-3">
              <Dot>Provide a valid email address for account verification</Dot>
              <Dot>Create a secure password (minimum 8 characters)</Dot>
              <Dot>Keep your account information up to date</Dot>
              <Dot>Accept these Terms of Service during registration</Dot>
            </ul>
          </div>
          <div>
            <H3>3.2 Account Security</H3>
            <p className="text-gray-300 leading-relaxed mb-4">You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:</p>
            <ul className="space-y-3">
              <Dot>Immediately notify us of any unauthorized use of your account</Dot>
              <Dot>Not share your account credentials with any third party</Dot>
              <Dot>Use strong, unique passwords and enable two-factor authentication when available</Dot>
              <Dot>Log out of your account at the end of each session when using shared devices</Dot>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">We are not liable for any loss or damage arising from your failure to protect your account credentials.</p>
          </div>
        </div>
      </section>

      {/* 4 */}
      <section id="section-4" className="mb-16 scroll-mt-24">
        <H2 id="section-4">4. Payment Terms</H2>
        <div className="space-y-8">
          <div>
            <H3>4.1 Pricing and Billing</H3>
            <p className="text-gray-300 leading-relaxed mb-4">Our Services are offered on a subscription basis with the following terms:</p>
            <ul className="space-y-3">
              <Dot><strong className="text-white">Billing Cycle:</strong> Monthly recurring charges</Dot>
              <Dot><strong className="text-white">Payment Methods:</strong> Credit card, debit card, and other methods accepted through Stripe</Dot>
              <Dot><strong className="text-white">Currency:</strong> All prices are in Canadian Dollars (CAD) unless otherwise stated</Dot>
              <Dot><strong className="text-white">Automatic Renewal:</strong> Subscriptions automatically renew at the end of each billing period</Dot>
              <Dot><strong className="text-white">Price Changes:</strong> We reserve the right to modify pricing with 30 days' advance notice</Dot>
            </ul>
          </div>
          <div>
            <H3>4.2 Free Trial</H3>
            <p className="text-gray-300 leading-relaxed mb-4">New users may be eligible for a <strong className="text-white">3-day free trial</strong> of our Basic plan:</p>
            <ul className="space-y-3">
              <Dot>Trial includes a fully functional server with all Basic plan features</Dot>
              <Dot>No credit card required to start the trial</Dot>
              <Dot>One free trial per user (determined by email address)</Dot>
              <Dot>At the end of 3 days, your server will be suspended unless you subscribe</Dot>
              <Dot>You can upgrade to a paid plan at any time during the trial</Dot>
            </ul>
          </div>
          <div>
            <H3>4.3 Payment Processing</H3>
            <p className="text-gray-300 leading-relaxed mb-4">All payments are processed securely through Stripe, Inc. By providing payment information, you:</p>
            <ul className="space-y-3">
              <Dot>Authorize us to charge your payment method for all fees incurred</Dot>
              <Dot>Agree to Stripe's terms of service and privacy policy</Dot>
              <Dot>Represent that you have the legal right to use the payment method provided</Dot>
              <Dot>Understand that we do not store your complete payment card information</Dot>
            </ul>
          </div>
          <div>
            <H3>4.4 Taxes</H3>
            <Body>Prices do not include applicable taxes, duties, or fees. You are responsible for paying all taxes associated with your use of the Services, including but not limited to sales tax, GST/HST, and VAT as required by your jurisdiction.</Body>
          </div>
        </div>
      </section>

      {/* 5 */}
      <section id="section-5" className="mb-16 scroll-mt-24">
        <H2 id="section-5">5. Refund Policy</H2>
        <p className="text-gray-300 leading-relaxed mb-4">All sales are final. Subscriptions are <strong className="text-white">non-refundable</strong> except in the following circumstances:</p>
        <ul className="space-y-3">
          <Dot><strong className="text-white">Service Failure:</strong> If we are unable to provision your server within 24 hours of payment, you will receive a full automatic refund</Dot>
          <Dot><strong className="text-white">Billing Errors:</strong> Duplicate charges or billing mistakes will be refunded promptly</Dot>
          <Dot><strong className="text-white">Extraordinary Circumstances:</strong> Refunds may be issued at our sole discretion for exceptional situations</Dot>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">You may cancel your subscription at any time via support ticket. Your service will remain active until the end of your current billing period, but no refund will be issued for unused time.</p>
      </section>

      {/* 6 */}
      <section id="section-6" className="mb-16 scroll-mt-24">
        <H2 id="section-6">6. Acceptable Use &amp; Resource Limits</H2>
        <div className="space-y-8">
          <div>
            <H3>6.1 Prohibited Activities</H3>
            <p className="text-gray-300 leading-relaxed mb-4">You agree to use our Services only for lawful purposes and in compliance with these Terms. Prohibited activities include but are not limited to:</p>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <ul className="space-y-3">
                <Dot><strong className="text-white">Illegal Activities:</strong> Hosting, distributing, or linking to illegal content or engaging in criminal activity</Dot>
                <Dot><strong className="text-white">Malicious Software:</strong> Distributing viruses, malware, ransomware, or other harmful code</Dot>
                <Dot><strong className="text-white">Spam and Abuse:</strong> Sending unsolicited bulk email, phishing attempts, or fraudulent communications</Dot>
                <Dot><strong className="text-white">Network Attacks:</strong> Port scanning, DDoS attacks, or attempts to compromise other systems</Dot>
                <Dot><strong className="text-white">Resource Abuse:</strong> Excessive CPU usage (including cryptocurrency mining), bandwidth abuse, or activities that degrade service performance for other users</Dot>
                <Dot><strong className="text-white">Intellectual Property Infringement:</strong> Hosting pirated software, copyrighted content without authorization, or counterfeit materials</Dot>
                <Dot><strong className="text-white">Illegal Adult Content:</strong> Child sexual abuse material (CSAM), revenge porn, or other illegal pornographic content</Dot>
                <Dot><strong className="text-white">Harassment:</strong> Using Services to harass, threaten, stalk, or defame individuals or organizations</Dot>
              </ul>
            </div>
          </div>
          <div>
            <H3>6.2 Resource Limits</H3>
            <Body>Each plan includes a dedicated virtual private server with defined resource limits (CPU, memory, storage, bandwidth). Customers are responsible for activity occurring on their server, including usage via SSH or deployed applications.</Body>
          </div>
          <div>
            <H3>6.3 Enforcement &amp; Safeguards</H3>
            <p className="text-gray-300 leading-relaxed mb-4">Usage that intentionally or unintentionally exceeds plan limits, violates provider policies, or risks unexpected infrastructure costs may be limited, paused, or suspended at our discretion. When possible, we will attempt to notify customers before taking action.</p>
            <Body>We reserve the right to enforce reasonable safeguards to ensure platform stability, cost predictability, and continued service availability.</Body>
          </div>
        </div>
      </section>

      {/* 7 */}
      <section id="section-7" className="mb-16 scroll-mt-24">
        <H2 id="section-7">7. Intellectual Property</H2>
        <div className="space-y-8">
          <div>
            <H3>7.1 Our Intellectual Property</H3>
            <Body>The Clouded Basement Hosting brand, including our name, logo, website design, and trademarks, are owned by the Company and protected by copyright and trademark laws. You may not use our branding without written permission.</Body>
          </div>
          <div>
            <H3>7.2 Source Code Availability</H3>
            <p className="text-gray-300 leading-relaxed mb-4">The source code for this platform is publicly viewable for educational and transparency purposes. However:</p>
            <ul className="space-y-3">
              <Dot>Viewing and studying the code for learning purposes is permitted</Dot>
              <Dot>The "Clouded Basement Hosting" brand name, logo, and associated trademarks remain proprietary</Dot>
              <Dot>Deploying a competing commercial service using this codebase requires explicit written permission</Dot>
              <Dot>Contributions to the project may be accepted via GitHub pull requests</Dot>
            </ul>
          </div>
          <div>
            <H3>7.3 User Content</H3>
            <Body>You retain full ownership of all content, data, and applications you deploy on our Services. By using our Services, you grant us a limited license to host, store, and transmit your content solely for the purpose of providing the Services to you.</Body>
          </div>
        </div>
      </section>

      {/* 8 */}
      <section id="section-8" className="mb-16 scroll-mt-24">
        <H2 id="section-8">8. Data Privacy and Security</H2>
        <div className="space-y-8">
          <div>
            <H3>8.1 Data Collection</H3>
            <p className="text-gray-300 leading-relaxed mb-4">We collect and process personal information as described in our Privacy Policy, including:</p>
            <ul className="space-y-3">
              <Dot>Account information (email address, password hash)</Dot>
              <Dot>Payment information (processed securely through Stripe)</Dot>
              <Dot>Server deployment details and usage logs</Dot>
              <Dot>Support ticket communications</Dot>
            </ul>
          </div>
          <div>
            <H3>8.2 Data Security</H3>
            <p className="text-gray-300 leading-relaxed mb-4">We implement industry-standard security measures to protect your data, including:</p>
            <ul className="space-y-3">
              <Dot>HTTPS encryption for all web traffic</Dot>
              <Dot>Secure session management with CSRF protection</Dot>
              <Dot>Encrypted password storage using bcrypt</Dot>
              <Dot>Regular security audits and updates</Dot>
            </ul>
          </div>
          <div>
            <H3>8.3 Data Retention</H3>
            <Body>We retain your account data for the duration of your active subscription and for a reasonable period thereafter as required by law or for legitimate business purposes. You may request data deletion by contacting support.</Body>
          </div>
        </div>
      </section>

      {/* 9 */}
      <section id="section-9" className="mb-16 scroll-mt-24">
        <H2 id="section-9">9. Service Level and Uptime</H2>
        <p className="text-gray-300 leading-relaxed mb-4">While we strive to provide reliable service, we do not guarantee uninterrupted availability. Our Services are provided on an "as-is" and "as-available" basis. We do not warrant that:</p>
        <ul className="space-y-3">
          <Dot>Services will be available 100% of the time without interruption</Dot>
          <Dot>Services will be error-free or meet your specific requirements</Dot>
          <Dot>Data transmission will be secure or free from interception</Dot>
          <Dot>Servers will be immune from attacks, hardware failures, or network issues</Dot>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">Scheduled maintenance will be announced in advance when possible. We are not liable for downtime, data loss, or service interruptions.</p>
      </section>

      {/* 10 */}
      <section id="section-10" className="mb-16 scroll-mt-24">
        <H2 id="section-10">10. Limitation of Liability</H2>
        <p className="text-gray-300 leading-relaxed mb-4">To the maximum extent permitted by law:</p>
        <ul className="space-y-3">
          <Dot>We are not liable for any indirect, incidental, special, consequential, or punitive damages</Dot>
          <Dot>Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim</Dot>
          <Dot>We are not responsible for losses resulting from unauthorized access to your account</Dot>
          <Dot>We are not liable for third-party services, content, or links provided through our platform</Dot>
          <Dot>We do not guarantee backup or recovery of your data — regular backups are your responsibility</Dot>
        </ul>
      </section>

      {/* 11 */}
      <section id="section-11" className="mb-16 scroll-mt-24">
        <H2 id="section-11">11. Indemnification</H2>
        <p className="text-gray-300 leading-relaxed mb-4">You agree to indemnify, defend, and hold harmless the Company, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from:</p>
        <ul className="space-y-3">
          <Dot>Your use of the Services</Dot>
          <Dot>Your violation of these Terms</Dot>
          <Dot>Your violation of any third-party rights, including intellectual property rights</Dot>
          <Dot>Content or applications you deploy on our infrastructure</Dot>
        </ul>
      </section>

      {/* 12 */}
      <section id="section-12" className="mb-16 scroll-mt-24">
        <H2 id="section-12">12. Termination</H2>
        <div className="space-y-8">
          <div>
            <H3>12.1 Termination by You</H3>
            <p className="text-gray-300 leading-relaxed mb-4">You may cancel your subscription at any time through your account dashboard. Upon cancellation:</p>
            <ul className="space-y-3">
              <Dot>You will continue to have access until the end of your current billing period</Dot>
              <Dot>No further charges will be made after the current period ends</Dot>
              <Dot>Your servers and data may be deleted after 30 days</Dot>
            </ul>
          </div>
          <div>
            <H3>12.2 Termination by Us</H3>
            <p className="text-gray-300 leading-relaxed mb-4">We reserve the right to suspend or terminate your account immediately without notice if:</p>
            <ul className="space-y-3">
              <Dot>You violate these Terms or our Acceptable Use Policy</Dot>
              <Dot>Your account is used for fraudulent or illegal activities</Dot>
              <Dot>Payment fails and remains outstanding after 7 days</Dot>
              <Dot>You engage in abusive behavior toward our staff or other users</Dot>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">Termination for cause does not entitle you to a refund. We may delete your data immediately upon termination for violations.</p>
          </div>
        </div>
      </section>

      {/* 13 */}
      <section id="section-13" className="mb-16 scroll-mt-24">
        <H2 id="section-13">13. Modifications to Terms</H2>
        <Body>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website. Continued use of the Services after changes constitutes acceptance of the modified Terms. Material changes will be communicated via email when possible.</Body>
      </section>

      {/* 14 */}
      <section id="section-14" className="mb-16 scroll-mt-24">
        <H2 id="section-14">14. Governing Law and Jurisdiction</H2>
        <p className="text-gray-300 leading-relaxed">These Terms are governed by the laws of the Province of Nova Scotia and the federal laws of Canada applicable therein, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Services shall be subject to the exclusive jurisdiction of the courts located in <strong className="text-white">Halifax, Nova Scotia, Canada</strong>.</p>
      </section>

      {/* 15 */}
      <section id="section-15" className="mb-16 scroll-mt-24">
        <H2 id="section-15">15. Dispute Resolution</H2>
        <Body>In the event of a dispute, you agree to first attempt to resolve the matter informally by contacting our support team. If the dispute cannot be resolved within 30 days, either party may pursue legal remedies in accordance with Section 14.</Body>
      </section>

      {/* 16 */}
      <section id="section-16" className="mb-16 scroll-mt-24">
        <H2 id="section-16">16. Severability</H2>
        <Body>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.</Body>
      </section>

      {/* 17 */}
      <section id="section-17" className="mb-16 scroll-mt-24">
        <H2 id="section-17">17. Entire Agreement</H2>
        <Body>These Terms, together with our Privacy Policy and any supplemental terms for specific Services, constitute the entire agreement between you and Clouded Basement Hosting regarding your use of the Services.</Body>
      </section>

      {/* 18 */}
      <section id="section-18" className="mb-16 scroll-mt-24">
        <H2 id="section-18">18. Contact Information</H2>
        <p className="text-gray-300 leading-relaxed mb-4">If you have questions about these Terms or need to contact us regarding your account, please reach out:</p>
        <ul className="space-y-3">
          <Dot>
            <strong className="text-white">Email:</strong>{' '}
            <a href="mailto:support@cloudedbasement.ca" className="text-blue-400 hover:text-blue-300 underline">support@cloudedbasement.ca</a>
          </Dot>
          <Dot><strong className="text-white">Support Tickets:</strong> Available through your account dashboard</Dot>
          <Dot><strong className="text-white">Company Name:</strong> Clouded Basement Hosting</Dot>
          <Dot><strong className="text-white">Location:</strong> Halifax, Nova Scotia, Canada</Dot>
        </ul>
        <p className="mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm">
          By creating an account or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
      </section>
    </DocLayout>
  );
}
