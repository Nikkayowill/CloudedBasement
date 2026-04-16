import { useState } from 'react';
import Sidebar from './Sidebar';
import OverviewSection from './sections/OverviewSection';
import SitesSection from './sections/SitesSection';
import DeploySection from './sections/DeploySection';
import DevToolsSection from './sections/DevToolsSection';
import EnvSection from './sections/EnvSection';
import SettingsSection from './sections/SettingsSection';
import ApiKeysSection from './sections/ApiKeysSection';
import LogsSection from './sections/LogsSection';

const NAV = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-1a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" />
      </svg>
    ),
  },
  {
    id: 'sites',
    label: 'Sites',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    id: 'deploy',
    label: 'Deploy',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    id: 'dev-tools',
    label: 'Dev Tools',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'env',
    label: 'Env Vars',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 21l10-18M3 9h18M3 15h18" />
      </svg>
    ),
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    id: 'logs',
    label: 'Logs',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 6h16M4 10h16M4 14h10M4 18h6" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const SECTIONS = {
  overview: OverviewSection,
  sites: SitesSection,
  deploy: DeploySection,
  'dev-tools': DevToolsSection,
  env: EnvSection,
  logs: LogsSection,
  settings: SettingsSection,
  'api-keys': ApiKeysSection,
};

export default function DashboardLayout({ data, flashSuccess, flashError }) {
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localFlashSuccess, setLocalFlashSuccess] = useState(flashSuccess || null);
  const [localFlashError, setLocalFlashError] = useState(flashError || null);
  const ActiveSection = SECTIONS[active] ?? OverviewSection;

  const handleDismissSuccess = () => {
    setLocalFlashSuccess(null);
    window.history.replaceState({}, '', '/dashboard');
  };
  const handleDismissError = () => {
    setLocalFlashError(null);
    window.history.replaceState({}, '', '/dashboard');
  };

  return (
    <div className="cb-dashboard-root">
      <div className="cb-shell">
        <div className="cb-shell-inner min-h-screen flex flex-col">
          <header className="cb-dashboard-header">
            <a href="/dashboard" aria-label="Clouded Basement Home" className="flex items-center">
              <img src="/CB-logo-icon.svg" alt="Clouded Basement Logo" className="h-12 w-auto max-w-[220px]" />
            </a>
          </header>

          <div className="cb-dashboard-body">
            <Sidebar
              nav={NAV}
              active={active}
              onNav={setActive}
              userEmail={data.userEmail}
              plan={data.plan}
              open={sidebarOpen}
              onToggle={() => setSidebarOpen((o) => !o)}
              csrfToken={data.csrfToken}
            />

            <main className="cb-dashboard-main">
              {(localFlashSuccess || localFlashError) && (
                <div className="cb-flash-wrap">
                  {localFlashSuccess && (
                    <div style={{
                      background: 'rgba(34,197,94,0.07)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.625rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#86efac',
                      fontSize: '0.8125rem',
                      marginBottom: '0.5rem',
                    }}>
                      <span style={{ flex: 1 }}>{localFlashSuccess}</span>
                      <button
                        onClick={handleDismissSuccess}
                        aria-label="Dismiss notification"
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                      >x</button>
                    </div>
                  )}
                  {localFlashError && (
                    <div style={{
                      background: 'rgba(239,68,68,0.07)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.625rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#fca5a5',
                      fontSize: '0.8125rem',
                      marginBottom: '0.5rem',
                    }}>
                      <span style={{ flex: 1 }}>{localFlashError}</span>
                      <button
                        onClick={handleDismissError}
                        aria-label="Dismiss notification"
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                      >x</button>
                    </div>
                  )}
                </div>
              )}
              <ActiveSection data={data} onNav={setActive} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
