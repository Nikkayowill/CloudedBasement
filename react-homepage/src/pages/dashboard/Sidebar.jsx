const PLAN_COLORS = {
  premium: { bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  pro:     { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  basic:   { bg: 'rgba(255,255,255,0.06)', color: '#a1a1a1' },
};

export default function Sidebar({ nav, active, onNav, userEmail, plan, open, onToggle }) {
  const initial   = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  const planStyle = PLAN_COLORS[plan?.toLowerCase()] ?? PLAN_COLORS.basic;

  return (
    <>
      <aside
        className="border-r-faint"
        id="dash-sidebar"
        data-open={open ? 'true' : 'false'}
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: '3.5rem',
          height: 'calc(100vh - 3.5rem)',
          overflowX: 'hidden',
        }}
      >
        {/* Hamburger — above Overview, visible on tablet/mobile only */}
        <button
          id="dash-sidebar-hamburger"
          onClick={onToggle}
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            background: 'none',
            border: 'none',
            borderLeft: '2px solid transparent',
            cursor: 'pointer',
            color: 'rgba(161,161,161,0.7)',
            padding: '0.5625rem 1rem',
            display: 'none',          // shown on tablet/mobile via CSS below
            alignItems: 'center',
            flexShrink: 0,
            width: '100%',
          }}
        >
          <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        {/* Sidebar content — CSS controls visibility on mobile/tablet */}
        <div id="dash-sidebar-inner" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <SidebarInner
            nav={nav} active={active} onNav={onNav}
            userEmail={userEmail} initial={initial}
            plan={plan} planStyle={planStyle}
          />
        </div>
      </aside>

      <style>{`
        /* Desktop: always full width, hamburger hidden */
        @media (min-width: 1025px) {
          #dash-sidebar { width: 14rem; overflow-y: auto; }
          #dash-sidebar-hamburger { display: none !important; }
          #dash-sidebar-inner { display: flex !important; }
        }

        /* Tablet/mobile: collapsed by default, expands when open */
        @media (max-width: 1024px) {
          #dash-sidebar { width: 2.75rem; overflow-y: hidden; transition: width 0.2s ease; }
          #dash-sidebar[data-open="true"] { width: 14rem; overflow-y: auto; }
          #dash-sidebar-hamburger { display: flex !important; }
          #dash-sidebar-inner { display: none !important; }
          #dash-sidebar[data-open="true"] #dash-sidebar-inner { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function SidebarInner({ nav, active, onNav, userEmail, initial, plan, planStyle }) {
  return (
    <>
      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.375rem 0' }}>
        {nav.map((item) => {
          const isActive = item.id === active;
          // Update label for 'sites' to 'Domains' and 'deploy' to 'Deployments'
          let label = item.label;
          if (item.id === 'sites') label = 'Domains';
          if (item.id === 'deploy') label = 'Deployments';
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                width: '100%', padding: '0.5625rem 1rem',
                background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer', textAlign: 'left',
                color: isActive ? '#60a5fa' : 'rgba(161,161,161,0.85)',
                fontSize: '0.8125rem', fontWeight: isActive ? 500 : 400,
                transition: 'color 0.12s, background 0.12s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#fafafa'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(161,161,161,0.85)'; }}
            >
              <span style={{ opacity: isActive ? 1 : 0.55, flexShrink: 0, display: 'flex' }}>
                {item.icon}
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* User identity + footer links */}
      <div className="border-t-faint" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '1.75rem', height: '1.75rem', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6875rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '0.6875rem', color: 'rgba(250,250,250,0.8)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {userEmail}
            </div>
            <span style={{
              fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '0.1rem 0.35rem',
              borderRadius: '0.2rem',
              background: planStyle.bg, color: planStyle.color,
            }}>
              {plan ?? 'basic'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/docs" style={{ fontSize: '0.6875rem', color: 'rgba(82,82,82,1)', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#a1a1a1'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(82,82,82,1)'}
          >Docs</a>
          <a href="/logout" style={{ fontSize: '0.6875rem', color: 'rgba(82,82,82,1)', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(82,82,82,1)'}
          >Logout</a>
        </div>
      </div>
    </>
  );
}
