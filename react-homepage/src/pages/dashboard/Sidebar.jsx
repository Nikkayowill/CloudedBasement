const PLAN_COLORS = {
  premium: { bg: 'rgba(45,167,223,0.22)', color: '#7fd6ff' },
  pro: { bg: 'rgba(45,167,223,0.16)', color: '#5cc8f3' },
  basic: { bg: 'rgba(255,255,255,0.06)', color: '#a1a1a1' },
};

export default function Sidebar({ nav, active, onNav, userEmail, plan, open, onToggle, csrfToken }) {
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  const planStyle = PLAN_COLORS[plan?.toLowerCase()] ?? PLAN_COLORS.basic;

  return (
    <aside
      className="dash-sidebar"
      id="dash-sidebar"
      data-open={open ? 'true' : 'false'}
    >
      <button
        id="dash-sidebar-hamburger"
        onClick={onToggle}
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-controls="dash-sidebar-inner"
        aria-expanded={open}
        className="dash-sidebar-hamburger w-full shrink-0 items-center justify-start px-3.5 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div id="dash-sidebar-inner" className="dash-sidebar-inner flex min-h-0 flex-1 flex-col">
        <SidebarInner
          nav={nav}
          active={active}
          onNav={onNav}
          userEmail={userEmail}
          initial={initial}
          plan={plan}
          planStyle={planStyle}
          csrfToken={csrfToken}
        />
      </div>
    </aside>
  );
}

function SidebarInner({ nav, active, onNav, userEmail, initial, plan, planStyle, csrfToken }) {
  return (
    <>
      <nav className="flex-1 px-0 py-1.5">
        {nav.map((item) => {
          const isActive = item.id === active;
          let label = item.label;
          if (item.id === 'sites') label = 'Domains';
          if (item.id === 'deploy') label = 'Deployments';

          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`group flex w-full items-center gap-2.5 whitespace-nowrap border-l-2 px-4 py-[0.58rem] text-left text-[0.8125rem] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                isActive
                  ? 'border-white bg-black text-white'
                  : 'border-transparent text-[rgba(161,161,161,0.85)] hover:bg-white/4 hover:text-white'
              }`}
            >
              <span
                className={`flex shrink-0 items-center justify-center transition-opacity duration-150 ${
                  isActive
                    ? 'opacity-100 text-white'
                    : 'opacity-60 text-[rgba(161,161,161,0.9)] group-hover:opacity-100 group-hover:text-white'
                }`}
              >
                {item.icon}
              </span>
              <span className={isActive ? 'font-medium' : 'font-normal'}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t-faint px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center text-[0.6875rem] font-bold text-black"
            style={{ background: '#2DA7DF' }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[0.6875rem] text-[rgba(250,250,250,0.85)]">{userEmail}</div>
            <span
              className="inline-block px-1.5 py-[0.12rem] text-[0.56rem] font-semibold uppercase tracking-[0.06em]"
              style={{ background: planStyle.bg, color: planStyle.color }}
            >
              {plan ?? 'basic'}
            </span>
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-[0.6875rem]">
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[rgba(120,120,120,1)] no-underline transition-colors duration-150 hover:text-[#2DA7DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DA7DF]/70"
          >
            Docs
          </a>
          <form method="POST" action="/logout" style={{ display: 'inline' }}>
            <input type="hidden" name="_csrf" value={csrfToken || ''} />
            <button
              type="submit"
              className="text-red-500 no-underline bg-transparent border-none p-0 m-0"
              style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
