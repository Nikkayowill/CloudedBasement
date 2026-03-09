import ResponsiveNav from '../components/ResponsiveNav';
import Footer from '../sections/Footer';

const DOC_LINKS = [
  {
    title: 'Docs Index',
    body: 'Start here for architecture, API, deployment, security, operations, and testing docs.',
    href: 'https://github.com/Nikkayowill/server-ui/blob/main/docs/README.md',
  },
  {
    title: 'Quickstart',
    body: 'Local onboarding for developers.',
    href: 'https://github.com/Nikkayowill/server-ui/blob/main/docs/QUICKSTART.md',
  },
  {
    title: 'API Reference',
    body: 'Routes, webhook endpoints, and guard middleware summary.',
    href: 'https://github.com/Nikkayowill/server-ui/blob/main/docs/API-REFERENCE.md',
  },
  {
    title: 'Deployment',
    body: 'Production deployment runbook and verification checklist.',
    href: 'https://github.com/Nikkayowill/server-ui/blob/main/docs/DEPLOYMENT.md',
  },
];

export default function Docs() {
  return (
    <div className="funnel">
      <ResponsiveNav />

      <main className="pt-14">
        <section className="funnel-section">
          <div className="funnel-wide">
            <h1 className="funnel-heading-1 mb-4">Documentation</h1>
            <p className="funnel-body mb-10">
              Clouded Basement documentation is maintained in-repo and aligned to the current implementation.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {DOC_LINKS.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="funnel-card block p-6"
                  style={{ textDecoration: 'none' }}
                >
                  <h2 className="funnel-heading-3 mb-2">{link.title}</h2>
                  <p className="funnel-body-sm">{link.body}</p>
                </a>
              ))}
            </div>

            <div className="mt-10 border border-yellow-700/40 bg-yellow-950/20 rounded-xl p-5">
              <h3 className="funnel-heading-3 mb-2" style={{ color: '#fef08a' }}>Important</h3>
              <p className="funnel-body-sm" style={{ color: '#fef9c3' }}>
                Documentation files in this project are source-of-truth. If a feature is not documented there, treat it as unsupported until verified in code.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
