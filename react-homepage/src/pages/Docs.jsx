import ResponsiveNav from '../components/ResponsiveNav';
import Footer from '../sections/Footer';

const TOC = [
  { id: 'intro',        label: 'Introduction'          },
  { id: 'getting-started', label: 'Getting Started'    },
  { id: 'overview',    label: 'Overview'               },
  { id: 'deployments', label: 'Deployments'            },
  { id: 'domains',     label: 'Domains'                },
  { id: 'env-vars',    label: 'Environment Variables'  },
  { id: 'dev-tools',   label: 'Dev Tools'              },
  { id: 'api-keys',    label: 'API Keys'               },
  { id: 'settings',    label: 'Settings'               },
  { id: 'faq',         label: 'FAQ & Support'          },
];

// Reusable prose styles
const h2Style = { fontSize: '1.0625rem', fontWeight: 700, color: '#f5f5f5', marginBottom: '0.5rem', marginTop: 0 };
const h3Style = { fontSize: '0.9375rem', fontWeight: 600, color: '#e5e7eb', marginBottom: '0.375rem', marginTop: 0 };
const pStyle  = { fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.7, margin: '0 0 0.875rem 0' };
const ulStyle = { fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.7, margin: '0 0 0.875rem 0', paddingLeft: '1.25rem' };
const codeStyle = { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', color: '#7fd6ff', background: 'rgba(45,167,223,0.08)', padding: '0.1rem 0.35rem', borderRadius: '0.2rem' };

function Badge({ children, color = '#60a5fa', bg = 'rgba(59,130,246,0.12)' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '0.25rem',
      fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
      background: bg, color,
    }}>
      {children}
    </span>
  );
}

function InfoBox({ children }) {
  return (
    <div style={{
      padding: '0.875rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem',
      background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)',
      fontSize: '0.875rem', color: '#93c5fd', lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}

function WarnBox({ children }) {
  return (
    <div style={{
      padding: '0.875rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem',
      background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)',
      fontSize: '0.875rem', color: '#fde68a', lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 style={h2Style}>{title}</h2>
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '1.25rem' }} />
      {children}
    </section>
  );
}

export default function Docs() {
  return (
    <div className="funnel">
      <div className="cb-shell">
        <div className="cb-shell-inner" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <ResponsiveNav />
          <div className="flex" style={{ flex: 1 }}>

            {/* Sidebar TOC */}
            <aside className="hidden md:block w-56 shrink-0 sticky top-0 self-start h-screen overflow-y-auto border-r border-gray-800 bg-[#030608]">
              <div className="py-8 px-5">
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#525252', marginBottom: '0.875rem' }}>
                  On This Page
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  {TOC.map(({ id, label }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        style={{
                          display: 'block', padding: '0.3rem 0.625rem',
                          borderLeft: '2px solid transparent',
                          fontSize: '0.8125rem', color: '#6b7280',
                          textDecoration: 'none', transition: 'color 150ms, border-color 150ms',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.borderLeftColor = 'rgba(255,255,255,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, minWidth: 0, paddingTop: '3rem', paddingBottom: '6rem', paddingLeft: '2.5rem', paddingRight: '2.5rem', maxWidth: '52rem', margin: '0 auto' }}>

              {/* ── Introduction ──────────────────────────────────────── */}
              <Section id="intro" title="Welcome to Clouded Basement">
                <p style={pStyle}>
                  Clouded Basement is a managed cloud hosting platform that lets you deploy web apps, manage custom domains, and monitor your server — all from a single dashboard. No DevOps experience required.
                </p>
                <p style={pStyle}>
                  This page documents every section of the user dashboard so you know exactly what each control does.
                </p>
              </Section>

              {/* ── Getting Started ───────────────────────────────────── */}
              <Section id="getting-started" title="Getting Started">
                <p style={pStyle}>Follow these steps to go from sign-up to your first live deployment:</p>
                <ol style={{ ...ulStyle, listStyle: 'decimal' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <b style={{ color: '#e5e7eb' }}>Create an account</b> — visit <a href="/register" style={{ color: '#60a5fa' }}>Start Free Trial</a> and register with your email and password, or continue with Google.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <b style={{ color: '#e5e7eb' }}>Confirm your email</b> — check your inbox for a verification link and click it to activate your account.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <b style={{ color: '#e5e7eb' }}>Choose a plan</b> — select Basic, Pro, or Premium on the <a href="/pricing" style={{ color: '#60a5fa' }}>pricing page</a> and complete checkout via Stripe. Your server begins provisioning immediately.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <b style={{ color: '#e5e7eb' }}>Wait 2–3 minutes</b> — your dedicated Linux VPS is being configured on DigitalOcean. The dashboard will update automatically.
                  </li>
                  <li>
                    <b style={{ color: '#e5e7eb' }}>Deploy your first app</b> — paste a public Git URL and click Deploy. Your app is live within seconds.
                  </li>
                </ol>
                <InfoBox>
                  The <b>Get Started</b> checklist on your Overview page tracks your progress through these steps and highlights the next action.
                </InfoBox>
              </Section>

              {/* ── Overview ──────────────────────────────────────────── */}
              <Section id="overview" title="Overview">
                <p style={pStyle}>
                  The Overview is your dashboard's home screen. It surfaces your server's current state, live resource metrics, uptime status, and a getting-started checklist in one place.
                </p>

                <h3 style={h3Style}>Get Started checklist</h3>
                <p style={pStyle}>
                  A step-by-step card that tracks setup progress: account created → email confirmed → plan chosen → first app deployed → custom domain added. Each step shows a CTA button pointing to the next action. Once all steps are complete the card is replaced with a confirmation banner.
                </p>

                <h3 style={h3Style}>Live metrics</h3>
                <p style={pStyle}>
                  Four real-time tiles — <b>CPU</b>, <b>Memory</b>, <b>Disk</b>, and <b>Uptime</b> — pulled from your server every 30 seconds via the DigitalOcean API. Color coding tells you at a glance whether resources are healthy (green), under load (yellow), or critical (red). Metrics only appear when your server is online.
                </p>

                <h3 style={h3Style}>Uptime summary</h3>
                <p style={pStyle}>
                  A card that shows whether all your deployed sites are responding. If every site is up you'll see a green "All sites operational" banner. If any site goes down, it's listed by URL with a red status. Hover the uptime dot next to a deployment URL for a timestamp of when it went down.
                </p>

                <h3 style={h3Style}>Server card</h3>
                <p style={pStyle}>
                  Displays your server's name, status badge (Online / Provisioning / Offline), IPv4 address, IPv6 address (if assigned), current plan, and how many sites you've used out of your plan's limit.
                </p>
                <p style={pStyle}>Two actions are available:</p>
                <ul style={ulStyle}>
                  <li><b style={{ color: '#e5e7eb' }}>Restart</b> — sends a graceful restart to the server. Use this to pick up config changes or recover from a hung process.</li>
                  <li><b style={{ color: '#ef4444' }}>Cancel Plan</b> — cancels your Stripe subscription and permanently deletes the server and all its data. This is irreversible.</li>
                </ul>
              </Section>

              {/* ── Deployments ───────────────────────────────────────── */}
              <Section id="deployments" title="Deployments">
                <p style={pStyle}>
                  The Deployments section is where you push code to your server. It supports any public repository on GitHub, GitLab, or Bitbucket.
                </p>

                <h3 style={h3Style}>Deploying an app</h3>
                <p style={pStyle}>
                  Paste a public Git URL (e.g. <code style={codeStyle}>https://github.com/you/my-app</code>) into the deploy field and click <b>Deploy</b>. The server clones the repo, installs dependencies, runs your build command, and starts your app — all automatically. Each deployment gets a unique <code style={codeStyle}>*.cloudedbasement.ca</code> subdomain so you can access it immediately without a custom domain.
                </p>
                <InfoBox>
                  Deploying the same Git URL again triggers a <b>redeploy</b> — it pulls the latest commit on the default branch and restarts the app.
                </InfoBox>
                <WarnBox>
                  You can only deploy up to your plan's site limit. Basic = 2 sites, Pro = 5, Premium = 10. The form will show an upgrade prompt if you've reached the limit.
                </WarnBox>

                <h3 style={h3Style}>Deployment list</h3>
                <p style={pStyle}>Each row in the list shows:</p>
                <ul style={ulStyle}>
                  <li><b style={{ color: '#e5e7eb' }}>Repo name</b> — extracted from the Git URL.</li>
                  <li><b style={{ color: '#e5e7eb' }}>Branch</b> — the branch that was deployed.</li>
                  <li><b style={{ color: '#a78bfa' }}>Preview badge</b> — shown on non-default-branch deployments.</li>
                  <li><b style={{ color: '#e5e7eb' }}>Subdomain link</b> — a live link to the deployed app on <code style={codeStyle}>*.cloudedbasement.ca</code>, with an uptime dot.</li>
                  <li><b style={{ color: '#e5e7eb' }}>Status badge</b> — Deployed (green), Deploying (yellow), Failed (red), or Pending (yellow).</li>
                  <li><b style={{ color: '#e5e7eb' }}>Deploy date</b>.</li>
                </ul>

                <h3 style={h3Style}>Actions per deployment</h3>
                <ul style={ulStyle}>
                  <li><b style={{ color: '#e5e7eb' }}>Redeploy</b> — re-runs the deployment pipeline for this repo using the latest commit.</li>
                  <li><b style={{ color: '#fbbf24' }}>Rollback</b> — reverts to the exact commit SHA of a previous successful deployment. Only available on past deployments that aren't the latest.</li>
                  <li><b style={{ color: '#f87171' }}>Delete</b> — removes the deployment from your server and frees up a site slot. A confirmation step prevents accidental deletion.</li>
                </ul>

                <h3 style={h3Style}>Build log</h3>
                <p style={pStyle}>
                  Every deployment has a collapsible <b>Build log</b> showing the raw output from the deployment pipeline. While a deploy is in progress the log streams live and auto-scrolls. Click the log toggle to expand or collapse it.
                </p>

                <h3 style={h3Style}>AI Diagnosis</h3>
                <p style={pStyle}>
                  When a deployment fails, an <Badge color="#fca5a5" bg="rgba(239,68,68,0.08)">AI Diagnosis</Badge> section appears beneath the status badge. Click it to expand a plain-English explanation of what went wrong and how to fix it, generated automatically from your build log.
                </p>
              </Section>

              {/* ── Domains ───────────────────────────────────────────── */}
              <Section id="domains" title="Domains">
                <p style={pStyle}>
                  The Domains section lets you connect custom domains to your server. Once added, your domain will point to your server's IP and SSL will be provisioned automatically.
                </p>

                <h3 style={h3Style}>Adding a domain</h3>
                <p style={pStyle}>
                  Type your domain (e.g. <code style={codeStyle}>yourdomain.com</code>) into the input and click <b>Add Domain</b>. Before adding, point your domain's DNS A record to your server's IPv4 address shown on the Overview. DNS propagation can take a few minutes.
                </p>

                <h3 style={h3Style}>SSL status</h3>
                <p style={pStyle}>
                  Each domain shows a lock icon and an <b style={{ color: '#4ade80' }}>SSL active</b> label once a certificate has been issued, or a warning icon and <b style={{ color: '#facc15' }}>Waiting for SSL</b> if it's still pending. SSL is provisioned via Let's Encrypt and renews automatically.
                </p>
                <p style={pStyle}>
                  If SSL is stuck on "Waiting", use the <b>Enable SSL</b> button to manually retry. Make sure your DNS A record is correctly pointed at your server IP first — SSL provisioning will fail if it can't reach your domain.
                </p>

                <h3 style={h3Style}>Removing a domain</h3>
                <p style={pStyle}>
                  Click <b style={{ color: '#f87171' }}>Remove</b> next to a domain to delete it from your account. The domain will no longer be served by your server.
                </p>
              </Section>

              {/* ── Environment Variables ─────────────────────────────── */}
              <Section id="env-vars" title="Environment Variables">
                <p style={pStyle}>
                  Environment variables are key-value pairs that get injected into your server's <code style={codeStyle}>.env</code> file on every deployment. Use them to store secrets like API keys, database connection strings, and third-party tokens — never hardcode these in your repo.
                </p>

                <h3 style={h3Style}>Adding a variable</h3>
                <p style={pStyle}>
                  Enter a key (e.g. <code style={codeStyle}>DATABASE_URL</code>) and a value, then click <b>Save Variable</b>. Keys are automatically uppercased and must start with a letter or underscore, containing only letters, numbers, and underscores. If a key already exists its value will be updated.
                </p>
                <WarnBox>
                  Changes to environment variables take effect on the <b>next deployment</b>. Redeploy your app after saving a new or updated variable for it to be picked up.
                </WarnBox>

                <h3 style={h3Style}>Viewing values</h3>
                <p style={pStyle}>
                  Values are masked by default (shown as ••••••••). Click <b>Show</b> next to a variable to reveal it in-place.
                </p>

                <h3 style={h3Style}>Removing a variable</h3>
                <p style={pStyle}>
                  Click <b style={{ color: '#f87171' }}>Remove</b> to permanently delete a variable. Redeploy your app afterward — the variable will no longer be present in the next deploy's environment.
                </p>
              </Section>

              {/* ── Dev Tools ─────────────────────────────────────────── */}
              <Section id="dev-tools" title="Dev Tools">
                <p style={pStyle}>
                  Dev Tools gives you direct access to your server's infrastructure credentials — SSH, PostgreSQL, and MongoDB. All credentials are hidden by default and must be explicitly revealed.
                </p>

                <h3 style={h3Style}>Revealing credentials</h3>
                <p style={pStyle}>
                  Click <b>Reveal Credentials</b> to securely fetch your credentials from the server. They are never stored in the browser — refreshing the page hides them again.
                </p>

                <h3 style={h3Style}>SSH access</h3>
                <p style={pStyle}>
                  Connects you directly to your Linux VPS. The card shows your SSH username, server IP, and password (revealed on demand). A ready-to-use <code style={codeStyle}>ssh user@ip</code> command is displayed with a one-click copy button. Use this for manual debugging, file inspection, or running commands directly on the server.
                </p>

                <h3 style={h3Style}>PostgreSQL</h3>
                <p style={pStyle}>
                  Shows your managed PostgreSQL credentials — host, port (<code style={codeStyle}>5432</code>), database name, username, password, and a full connection string. Only visible if PostgreSQL is installed on your server. Copy the connection string directly into your app's <code style={codeStyle}>DATABASE_URL</code> environment variable.
                </p>

                <h3 style={h3Style}>MongoDB</h3>
                <p style={pStyle}>
                  Shows your managed MongoDB credentials — host, port (<code style={codeStyle}>27017</code>), database name, username, password, and connection string. Only visible if MongoDB is installed on your server.
                </p>
              </Section>

              {/* ── API Keys ──────────────────────────────────────────── */}
              <Section id="api-keys" title="API Keys">
                <p style={pStyle}>
                  API keys let you trigger deployments programmatically from CI/CD pipelines, scripts, or automation tools — without needing to log in.
                </p>

                <h3 style={h3Style}>Creating a key</h3>
                <p style={pStyle}>
                  Click <b>+ New key</b>, give it a descriptive name (e.g. <code style={codeStyle}>CI/CD pipeline</code>), and select one or more scopes:
                </p>
                <ul style={ulStyle}>
                  <li><Badge color="#7fd6ff" bg="rgba(45,167,223,0.12)">deploy</Badge> — allows triggering deployments via the API.</li>
                  <li><Badge color="#86efac" bg="rgba(34,197,94,0.10)">read</Badge> — allows reading deployment status and server info.</li>
                </ul>
                <WarnBox>
                  Copy your key immediately after creation — it is shown <b>only once</b> and cannot be recovered. If you lose it, revoke the old key and create a new one.
                </WarnBox>

                <h3 style={h3Style}>Using a key</h3>
                <p style={pStyle}>
                  Send requests with an <code style={codeStyle}>Authorization: Bearer cbk_&lt;your_key&gt;</code> header. Example — trigger a deployment:
                </p>
                <pre style={{
                  margin: '0 0 1rem', padding: '0.875rem 1rem',
                  background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '0.5rem', fontSize: '0.75rem',
                  color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'pre-wrap', lineHeight: 1.6, overflowX: 'auto',
                }}>
{`curl -X POST https://cloudedbasement.ca/api/deploy \\
  -H "Authorization: Bearer cbk_<your_key>" \\
  -H "Content-Type: application/json" \\
  -d '{"git_url":"https://github.com/you/your-repo"}'`}
                </pre>

                <h3 style={h3Style}>Managing keys</h3>
                <p style={pStyle}>
                  Each key in the list shows its name, a prefix of the key value, its scopes, creation date, and last-used date. To permanently disable a key, click <b style={{ color: '#f87171' }}>Revoke</b>. Revoked keys stop working immediately and cannot be un-revoked.
                </p>
              </Section>

              {/* ── Settings ──────────────────────────────────────────── */}
              <Section id="settings" title="Settings">
                <p style={pStyle}>
                  The Settings section covers plan management, password changes, and support.
                </p>

                <h3 style={h3Style}>Plan</h3>
                <p style={pStyle}>
                  Displays your current plan and site usage, with cards for Basic ($15/mo), Pro ($35/mo), and Premium ($65/mo). Click <b>Upgrade</b> or <b>Downgrade</b> to switch plans instantly. Changes are prorated — you're only charged or credited the difference for the remaining billing period.
                </p>
                <p style={pStyle}>Plan specs at a glance:</p>
                <ul style={ulStyle}>
                  <li><b style={{ color: '#e5e7eb' }}>Basic</b> — 1 vCPU · 1 GB RAM · 25 GB storage · 2 sites</li>
                  <li><b style={{ color: '#e5e7eb' }}>Pro</b> — 2 vCPU · 2 GB RAM · 60 GB storage · 5 sites</li>
                  <li><b style={{ color: '#e5e7eb' }}>Premium</b> — 2 vCPU · 4 GB RAM · 80 GB storage · 10 sites</li>
                </ul>
                <InfoBox>
                  You can't downgrade to a plan whose site limit is lower than your current site count. Delete unused deployments first.
                </InfoBox>

                <h3 style={h3Style}>Change Password</h3>
                <p style={pStyle}>
                  Enter your current password and a new password (minimum 8 characters) to update your login credentials. This does not affect your session — you stay logged in after changing your password.
                </p>

                <h3 style={h3Style}>Submit Support Ticket</h3>
                <p style={pStyle}>
                  Fill in a subject, a description of your issue, and a priority (Normal, High, or Urgent). Our team will respond by email. For fastest response, include any error messages and the steps to reproduce the problem.
                </p>
              </Section>

              {/* ── FAQ ───────────────────────────────────────────────── */}
              <Section id="faq" title="FAQ & Support">
                {[
                  {
                    q: 'How do I deploy my first app?',
                    a: 'Go to the Deployments section, paste a public GitHub/GitLab/Bitbucket URL, and click Deploy. Your app is live within seconds on a *.cloudedbasement.ca subdomain.',
                  },
                  {
                    q: 'My deployment failed — what do I do?',
                    a: 'Expand the Build log on the failed deployment row to see the raw output. If AI Diagnosis is available, read its suggestion first. Common causes are missing environment variables, an incorrect build command, or a dependency that requires a native library.',
                  },
                  {
                    q: 'How do I use my own domain?',
                    a: 'First, point your domain\'s DNS A record to your server\'s IPv4 address (shown on the Overview). Then go to Domains, type your domain, and click Add Domain. SSL is provisioned automatically within a few minutes.',
                  },
                  {
                    q: 'How do I pass secrets to my app?',
                    a: 'Add them as Environment Variables in the dashboard. They are injected into your server\'s .env file on every deploy. Never commit secrets to your Git repo.',
                  },
                  {
                    q: 'My server metrics show high CPU/memory — what should I do?',
                    a: 'Check the Build log for a runaway deploy process. If the issue persists, try restarting the server from the Overview page. If resources are consistently under pressure, consider upgrading your plan in Settings.',
                  },
                  {
                    q: 'Can I roll back a broken deployment?',
                    a: 'Yes. In the Deployments section, find a previous successful deployment in the list and click Rollback. This re-deploys the exact commit SHA from that deployment.',
                  },
                  {
                    q: 'How do I connect to my database externally?',
                    a: 'Go to Dev Tools, click Reveal Credentials, and copy the connection string for PostgreSQL or MongoDB. Use it as your DATABASE_URL environment variable, or paste it into your local database client.',
                  },
                  {
                    q: 'How is my server secured?',
                    a: 'All servers are protected with a UFW firewall, automatic OS security updates, and HTTPS by default. SSH access requires a password that is only visible through the Dev Tools panel.',
                  },
                  {
                    q: 'How do I get support?',
                    a: 'Submit a ticket from the Settings section of your dashboard. For urgent issues, set the priority to Urgent — we respond to those first.',
                  },
                ].map(({ q, a }) => (
                  <div key={q} style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ ...h3Style, marginBottom: '0.25rem' }}>{q}</h3>
                    <p style={{ ...pStyle, marginBottom: 0 }}>{a}</p>
                  </div>
                ))}
              </Section>

            </main>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
