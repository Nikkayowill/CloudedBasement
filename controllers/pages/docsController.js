const { getHTMLHead, getScripts, getFooter, getResponsiveNav } = require('../../src/utils/helpers');

exports.showDocs = (_req, res) => {
  res.send(`
${getHTMLHead('Documentation - Clouded Basement')}
    ${getResponsiveNav(_req)}
    <main class="bg-gray-950 min-h-screen py-16 px-4">
      <section class="max-w-5xl mx-auto">
        <h1 class="text-4xl font-bold text-white mb-4">Documentation</h1>
        <p class="text-gray-300 text-lg mb-10">
          Clouded Basement documentation is maintained in-repo and aligned to the current implementation.
        </p>

        <div class="grid gap-4 md:grid-cols-2">
          <a class="block border border-gray-800 rounded-lg p-6 bg-gray-900 hover:border-blue-500 transition-colors" href="https://github.com/Nikkayowill/server-ui/blob/main/docs/README.md" target="_blank" rel="noopener noreferrer">
            <h2 class="text-white font-semibold mb-2">Docs Index</h2>
            <p class="text-gray-400 text-sm">Start here for architecture, API, deployment, security, operations, and testing docs.</p>
          </a>
          <a class="block border border-gray-800 rounded-lg p-6 bg-gray-900 hover:border-blue-500 transition-colors" href="https://github.com/Nikkayowill/server-ui/blob/main/docs/QUICKSTART.md" target="_blank" rel="noopener noreferrer">
            <h2 class="text-white font-semibold mb-2">Quickstart</h2>
            <p class="text-gray-400 text-sm">Local onboarding for developers.</p>
          </a>
          <a class="block border border-gray-800 rounded-lg p-6 bg-gray-900 hover:border-blue-500 transition-colors" href="https://github.com/Nikkayowill/server-ui/blob/main/docs/API-REFERENCE.md" target="_blank" rel="noopener noreferrer">
            <h2 class="text-white font-semibold mb-2">API Reference</h2>
            <p class="text-gray-400 text-sm">Routes, webhook endpoints, and guard middleware summary.</p>
          </a>
          <a class="block border border-gray-800 rounded-lg p-6 bg-gray-900 hover:border-blue-500 transition-colors" href="https://github.com/Nikkayowill/server-ui/blob/main/docs/DEPLOYMENT.md" target="_blank" rel="noopener noreferrer">
            <h2 class="text-white font-semibold mb-2">Deployment</h2>
            <p class="text-gray-400 text-sm">Production deployment runbook and verification checklist.</p>
          </a>
        </div>

        <div class="mt-10 border border-yellow-700/40 bg-yellow-950/20 rounded-lg p-5">
          <h3 class="text-yellow-200 font-semibold mb-2">Important</h3>
          <p class="text-yellow-100 text-sm">
            Documentation files in this project are source-of-truth. If a feature is not documented there, treat it as unsupported until verified in code.
          </p>
        </div>
      </section>
    </main>
    ${getFooter()}
    ${getScripts('nav.js')}
  `);
};
