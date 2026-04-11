import ResponsiveNav from '../components/ResponsiveNav';
import Footer from '../sections/Footer';
import { DashboardMockup, DeployMockup, DomainsMockup, BillingMockup, SupportMockup } from '../components/DocsMockups';
// Note: ResponsiveNav + Footer are still used inline below (Docs has its own sidebar layout)

// --- Docs structure: TOC ---
const TOC = [
  { id: 'intro', label: 'Introduction' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'dashboard', label: 'Dashboard Overview' },
  { id: 'features', label: 'Key Features' },
  { id: 'faq', label: 'FAQ & Support' },
];


export default function Docs() {
  return (
    <div className="funnel">
      <div className="cb-shell">
        <div className="cb-shell-inner" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <ResponsiveNav />
          <div className="flex" style={{ flex: 1 }}>
            {/* Sidebar TOC */}
            <aside className="hidden md:block w-64 shrink-0 sticky top-0 self-start h-screen overflow-y-auto border-r border-gray-800 bg-[#030608]">
              <div className="py-8 px-5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6">On This Page</h2>
                <ul className="space-y-1">
                  {TOC.map(({ id, label }) => (
                    <li key={id}>
                      <a href={`#${id}`} className="block py-2 px-3 rounded-sm border-l-2 text-sm no-underline transition-all duration-150 border-transparent text-gray-300 hover:text-white hover:bg-gray-800/30">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0 pt-12 px-8 pb-24 max-w-4xl mx-auto">
              {/* --- Docs Sections (structure only, fill in later) --- */}

              <section id="intro" className="mb-16 scroll-mt-24">
                <h1 className="text-2xl font-semibold text-white mb-2">Welcome to Clouded Basement</h1>
                <p className="text-base text-gray-300 mb-0">{/* Intro content goes here */}</p>
              </section>
              <section id="getting-started" className="mb-16 scroll-mt-24">
                <h2 className="text-lg font-bold text-white mb-2">Getting Started</h2>
                <ol className="list-decimal list-inside text-base text-gray-300 mb-0 space-y-2">
                  <li>
                    <b>Sign up:</b> Click <a href="/register" className="text-blue-400 underline">Start Free Trial</a> and create your account with your email and password.
                  </li>
                  <li>
                    <b>Verify your email:</b> Check your inbox for a confirmation link and follow the instructions to activate your account.
                  </li>
                  <li>
                    <b>Log in:</b> Visit <a href="/login" className="text-blue-400 underline">the login page</a> and enter your credentials.
                  </li>
                  <li>
                    <b>Access your dashboard:</b> After logging in, you’ll be taken to your personal dashboard where you can deploy servers, manage domains, and more.
                  </li>
                </ol>
              </section>
              <section id="dashboard" className="mb-16 scroll-mt-24" style={{ background: 'rgba(30,41,59,0.18)', borderTop: '2px solid #334155', borderRadius: 12, padding: '2.5rem 2rem 2rem 2rem' }}>
                <h2 className="text-lg font-bold text-white mb-2">Dashboard Overview</h2>
                <p className="text-base text-gray-300 mb-2">
                  After logging in, you’ll land on your dashboard. This is your control center for all product features:
                </p>
                <ul className="list-disc list-inside text-base text-gray-300 mb-6 space-y-1 pl-4">
                  <li>View and manage your active servers</li>
                  <li>Deploy a new server with one click</li>
                  <li>Manage domains and SSL certificates</li>
                  <li>Monitor usage and billing</li>
                  <li>Access support and account settings</li>
                </ul>
                <div className="flex justify-center mb-2">
                  <DashboardMockup />
                </div>
              </section>
              <section id="features" className="mb-16 scroll-mt-24" style={{ background: 'rgba(17,24,39,0.13)', borderTop: '2px solid #2563eb', borderRadius: 12, padding: '2.5rem 2rem 2rem 2rem' }}>
                <h2 className="text-lg font-bold text-white mb-2">Key Features</h2>

                {/* Deploy Server */}
                <div className="mb-10">
                  <h3 className="text-base font-semibold text-white mb-1">Deploy a Server</h3>
                  <p className="text-base text-gray-300 mb-4">
                    Click <b>Deploy Server</b> on your dashboard. In seconds, your new cloud server is online—fully configured and secured.
                  </p>
                  <ul className="list-disc list-inside text-base text-gray-300 mb-4 pl-4">
                    <li>Instant provisioning on DigitalOcean</li>
                    <li>Automatic OS, web, and database setup</li>
                    <li>Firewall and SSL applied by default</li>
                  </ul>
                  <p className="text-base text-gray-300 mb-4">
                    Each server is a dedicated Linux VPS. Access SSH, logs, and advanced controls anytime from your dashboard.
                  </p>
                  <div className="flex justify-center mb-2">
                    <DeployMockup />
                  </div>
                </div>

                {/* Manage Domains & SSL */}
                <div className="mb-10">
                  <h3 className="text-base font-semibold text-white mb-1">Manage Domains & SSL</h3>
                  <p className="text-base text-gray-300 mb-4">
                    Connect your custom domains in seconds. Add, verify, and launch with automatic SSL—no manual setup required.
                  </p>
                  <ul className="list-disc list-inside text-base text-gray-300 mb-4 pl-4">
                    <li>Add unlimited domains to your account</li>
                    <li>Automatic SSL certificate provisioning and renewal</li>
                    <li>DNS verification and status at a glance</li>
                  </ul>
                  <p className="text-base text-gray-300 mb-4">
                    All domains are secured with HTTPS by default. No extra steps, no extra cost.
                  </p>
                  <div className="flex justify-center mb-2">
                    <DomainsMockup />
                  </div>
                </div>

                {/* Billing & Plans */}
                <div className="mb-10">
                  <h3 className="text-base font-semibold text-white mb-1">Billing & Plans</h3>
                  <p className="text-base text-gray-300 mb-4">
                    All plans are flat-rate and billed monthly. Select a plan on the pricing page, then complete checkout securely via Stripe — your server is activated instantly after payment.
                  </p>
                  <ul className="list-disc list-inside text-base text-gray-300 mb-4 pl-4">
                    <li>Basic · $15/mo — 1 vCPU, 1GB RAM, 2 sites</li>
                    <li>Pro · $35/mo — 2 vCPU, 2GB RAM, 5 sites</li>
                    <li>Premium · $65/mo — 2 vCPU, 4GB RAM, 10 sites</li>
                  </ul>
                  <div className="flex justify-center mb-2">
                    <BillingMockup />
                  </div>
                </div>

                {/* Support & Settings */}
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-white mb-1">Support & Settings</h3>
                  <p className="text-base text-gray-300 mb-4">
                    Need help or want to update your account? Everything is accessible from your dashboard.
                  </p>
                  <ul className="list-disc list-inside text-base text-gray-300 mb-4 pl-4">
                    <li>Contact support directly from the help menu</li>
                    <li>Update your email, password, and profile details</li>
                    <li>Review security settings and recent activity</li>
                  </ul>
                  <div className="flex justify-center mb-2">
                    <SupportMockup />
                  </div>
                </div>
              </section>
              <section id="faq" className="mb-16 scroll-mt-24" style={{ background: 'rgba(30,41,59,0.10)', borderTop: '2px solid #f59e42', borderRadius: 12, padding: '2.5rem 2rem 2rem 2rem' }}>
                <h2 className="text-lg font-bold text-white mb-2">FAQ & Support</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">How do I deploy my first server?</h3>
                    <p className="text-base text-gray-300 mb-0">Log in, click <b>Deploy Server</b>, and follow the prompts. Your server will be ready in seconds—no technical setup required.</p>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Can I use my own domain?</h3>
                    <p className="text-base text-gray-300 mb-0">Yes. Add your custom domain in the dashboard. SSL is provisioned automatically for every domain you connect.</p>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">How is my server secured?</h3>
                    <p className="text-base text-gray-300 mb-0">All servers are protected with firewalls, automatic security updates, and SSL by default. You can review and adjust security settings in your dashboard.</p>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">How do I get support?</h3>
                    <p className="text-base text-gray-300 mb-0">Open the help menu in your dashboard to contact support. Our team responds quickly to all inquiries.</p>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Can I upgrade or downgrade my plan?</h3>
                    <p className="text-base text-gray-300 mb-0">You can change your plan at any time from the Billing & Plans section. Changes take effect immediately on your next billing cycle.</p>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Where can I find my invoices?</h3>
                    <p className="text-base text-gray-300 mb-0">Invoices are securely generated and stored by Stripe. You can view and download your invoices through the Stripe billing portal or from Stripe-generated links sent to your email after each payment. For direct access, use the <b>View Invoices</b> link in the Billing & Plans section.</p>
                  </div>
                </div>
              </section>

              {/* Scroll-to-top button */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Scroll to top"
                className="fixed bottom-6 right-6 z-50 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-gray-400 cursor-pointer"
                style={{ display: 'none' }} // TODO: Add show-on-scroll logic
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </main>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
