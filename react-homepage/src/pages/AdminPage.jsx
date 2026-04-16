import { useState, useEffect, useCallback } from 'react';

// ── Shared primitives ─────────────────────────────────────────────────────────

const MONO = { fontFamily: 'JetBrains Mono, monospace' };

function fmt(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function Badge({ children, color = '#a1a1a1', bg = 'rgba(255,255,255,0.06)' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '0.25rem',
      fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      background: bg, color, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

const STATUS_BADGE = {
  running:      <Badge color="#22c55e" bg="rgba(34,197,94,0.10)">running</Badge>,
  provisioning: <Badge color="#eab308" bg="rgba(234,179,8,0.10)">provisioning</Badge>,
  deleted:      <Badge color="#525252" bg="rgba(255,255,255,0.04)">deleted</Badge>,
  failed:       <Badge color="#ef4444" bg="rgba(239,68,68,0.10)">failed</Badge>,
  success:      <Badge color="#22c55e" bg="rgba(34,197,94,0.10)">deployed</Badge>,
  deploying:    <Badge color="#eab308" bg="rgba(234,179,8,0.10)">deploying</Badge>,
  pending:      <Badge color="#eab308" bg="rgba(234,179,8,0.10)">pending</Badge>,
  succeeded:    <Badge color="#22c55e" bg="rgba(34,197,94,0.10)">succeeded</Badge>,
  admin:        <Badge color="#f87171" bg="rgba(239,68,68,0.10)">admin</Badge>,
  user:         <Badge color="#525252" bg="rgba(255,255,255,0.06)">user</Badge>,
};

function statusBadge(val) {
  return STATUS_BADGE[val] ?? <Badge>{val ?? '—'}</Badge>;
}

function SectionHeader({ title }) {
  return (
    <div className="border-b-faint" style={{ padding: '1.5rem 1.5rem 1rem' }}>
      <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dash-text-muted, #525252)' }}>
        {title}
      </h2>
    </div>
  );
}

function Table({ cols, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c} style={{
                padding: '0.5rem 0.75rem', textAlign: 'left',
                fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                color: 'var(--dash-text-muted, #525252)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {cells.map((cell, j) => (
                <td key={j} style={{ padding: '0.625rem 0.75rem', verticalAlign: 'middle', color: 'var(--dash-text-secondary, #a1a1a1)' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionBtn({ label, onClick, danger, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.25rem 0.625rem', borderRadius: '0.3125rem',
        background: 'transparent',
        border: danger ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.12)',
        color: danger ? '#f87171' : 'var(--dash-text-secondary, #a1a1a1)',
        fontSize: '0.6875rem', cursor: disabled ? 'wait' : 'pointer', whiteSpace: 'nowrap',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#111111', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '0.625rem', padding: '1rem 1.25rem',
    }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#525252', marginBottom: '0.375rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color || '#fafafa', ...MONO }}>
        {value}
      </div>
    </div>
  );
}

// ── Sections ──────────────────────────────────────────────────────────────────

function StatsSection({ data }) {
  const { users, servers, domains, payments } = data;
  const running = servers.filter(s => s.status === 'running').length;
  const revenue = (payments.filter(p => p.status === 'succeeded').reduce((s, p) => s + (p.amount || 0), 0) / 100).toFixed(0);

  return (
    <section>
      <SectionHeader title="Stats" />
      <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: '0.75rem' }}>
        <StatCard label="Users"      value={users.length}                    color="#7fd6ff" />
        <StatCard label="Servers"    value={`${running} / ${servers.length}`} color="#4ade80" />
        <StatCard label="Domains"    value={domains.length}                   color="#c084fc" />
        <StatCard label="Revenue"    value={`$${revenue}`}                    color="#fbbf24" />
      </div>
    </section>
  );
}

function PendingSection({ data }) {
  const { pendingRequests } = data;
  if (!pendingRequests.length) {
    return (
      <section>
        <SectionHeader title="Pending Requests" />
        <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--dash-text-muted, #525252)' }}>No pending requests.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title={`Pending Requests (${pendingRequests.length})`} />
      <div style={{ padding: '1rem 1.5rem' }}>
        <div style={{ border: '1px solid rgba(249,115,22,0.25)', borderRadius: '0.625rem', overflow: 'hidden' }}>
          <Table
            cols={['Customer', 'Details', 'Status', 'Date', 'Action']}
            rows={pendingRequests.map(r => {
              const details = (r.description || '').split('\n').reduce((acc, line) => {
                const [k, v] = line.split(': ');
                if (k && v) acc[k] = v;
                return acc;
              }, {});
              return [
                <span style={{ color: 'var(--dash-text-primary, #fafafa)', ...MONO, fontSize: '0.75rem' }}>{r.customer_email}</span>,
                <span style={{ color: 'var(--dash-text-muted, #525252)', fontSize: '0.75rem' }}>
                  <span style={{ color: '#7fd6ff' }}>{details.Region || 'N/A'}</span> · {details['Server Name'] || 'Default'}
                </span>,
                <Badge color="#fb923c" bg="rgba(249,115,22,0.1)">{r.status}</Badge>,
                <span style={{ color: 'var(--dash-text-muted, #525252)', fontSize: '0.6875rem' }}>{fmt(r.created_at)}</span>,
                <a href="https://cloud.digitalocean.com/droplets/new" target="_blank" rel="noreferrer" style={{ color: '#7fd6ff', fontSize: '0.6875rem', fontWeight: 600, textDecoration: 'none' }}>Provision →</a>,
              ];
            })}
          />
        </div>
      </div>
    </section>
  );
}

function UsersSection({ data, onAction }) {
  const { users, csrfToken } = data;
  const [loading, setLoading] = useState(null);

  async function deleteUser(id, email) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setLoading(id);
    try {
      const r = await fetch(`/admin/delete-user/${id}`, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `_csrf=${encodeURIComponent(csrfToken)}`,
      });
      if (r.ok || r.redirected) { onAction('User deleted'); }
      else { alert('Failed to delete user.'); }
    } catch { alert('Network error.'); }
    finally { setLoading(null); }
  }

  return (
    <section>
      <SectionHeader title={`Users (${users.length})`} />
      <div style={{ padding: '1rem 1.5rem' }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
          <Table
            cols={['Email', 'Role', 'Confirmed', 'Created', 'Action']}
            rows={users.map(u => [
              <span style={{ color: 'var(--dash-text-primary, #fafafa)', fontSize: '0.8125rem' }}>{u.email}</span>,
              statusBadge(u.role),
              u.email_confirmed
                ? <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>✓ Yes</span>
                : <span style={{ color: '#f87171', fontSize: '0.75rem' }}>✗ No</span>,
              <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>{fmt(u.created_at)}</span>,
              <ActionBtn label={loading === u.id ? 'Deleting…' : 'Delete'} danger disabled={loading === u.id} onClick={() => deleteUser(u.id, u.email)} />,
            ])}
          />
        </div>
      </div>
    </section>
  );
}

function ServersSection({ data, onAction }) {
  const { servers, csrfToken } = data;
  const [loading, setLoading] = useState(null);

  async function post(url, serverId, confirmMsg) {
    if (!confirm(confirmMsg)) return;
    setLoading(serverId);
    try {
      const r = await fetch(url, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `_csrf=${encodeURIComponent(csrfToken)}`,
      });
      if (r.ok || r.redirected) { onAction('Done.'); }
      else { alert('Action failed.'); }
    } catch { alert('Network error.'); }
    finally { setLoading(null); }
  }

  return (
    <section>
      <SectionHeader title={`Servers (${servers.length})`} />
      <div style={{ padding: '1rem 1.5rem' }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
          <Table
            cols={['ID', 'Owner', 'Plan', 'Status', 'IP', 'Created', 'Actions']}
            rows={servers.map(s => [
              <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>#{s.id}</span>,
              <span style={{ fontSize: '0.8125rem', color: 'var(--dash-text-primary, #fafafa)' }}>{s.owner_email || '—'}</span>,
              <Badge color="#60a5fa" bg="rgba(59,130,246,0.12)">{s.plan}</Badge>,
              statusBadge(s.status),
              <span style={{ ...MONO, fontSize: '0.6875rem', color: '#7fd6ff' }}>{s.ip_address || '—'}</span>,
              <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>{fmt(s.created_at)}</span>,
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {s.status === 'provisioning' && (
                  <ActionBtn
                    label={loading === s.id ? '…' : 'Cancel'}
                    disabled={loading === s.id}
                    onClick={() => post(`/admin/cancel-provisioning/${s.id}`, s.id, 'Cancel provisioning for this server?')}
                  />
                )}
                {s.status === 'deleted' && (
                  <ActionBtn
                    label={loading === s.id ? '…' : 'Remove Record'}
                    disabled={loading === s.id}
                    onClick={() => post(`/admin/delete-server/${s.id}`, s.id, `Remove server record #${s.id}?`)}
                  />
                )}
                {s.status !== 'deleted' && (
                  <ActionBtn
                    label={loading === s.id ? '…' : 'Destroy'}
                    danger
                    disabled={loading === s.id}
                    onClick={() => post(`/admin/destroy-droplet/${s.id}`, s.id, `DESTROY droplet for server #${s.id}? This deletes the droplet from DigitalOcean. Cannot be undone.`)}
                  />
                )}
              </div>,
            ])}
          />
        </div>
      </div>
    </section>
  );
}

function DomainsSection({ data }) {
  const { domains } = data;
  return (
    <section>
      <SectionHeader title={`Domains (${domains.length})`} />
      <div style={{ padding: '1rem 1.5rem' }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
          <Table
            cols={['Domain', 'SSL', 'Expires', 'Created']}
            rows={domains.map(d => [
              <span style={{ ...MONO, fontSize: '0.8125rem', color: 'var(--dash-text-primary, #fafafa)' }}>{d.domain}</span>,
              d.ssl_enabled
                ? <Badge color="#4ade80" bg="rgba(34,197,94,0.10)">Active</Badge>
                : <span style={{ color: 'var(--dash-text-muted, #525252)', fontSize: '0.75rem' }}>—</span>,
              <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>{d.ssl_expires_at ? fmt(d.ssl_expires_at) : '—'}</span>,
              <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>{fmt(d.created_at)}</span>,
            ])}
          />
        </div>
      </div>
    </section>
  );
}

function DeploymentsSection({ data }) {
  const { deployments } = data;
  return (
    <section>
      <SectionHeader title={`Deployments (${deployments.length})`} />
      <div style={{ padding: '1rem 1.5rem' }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
          <Table
            cols={['ID', 'Owner', 'Repo', 'Status', 'Deployed']}
            rows={deployments.map(d => [
              <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>#{d.id}</span>,
              <span style={{ fontSize: '0.8125rem', color: 'var(--dash-text-primary, #fafafa)' }}>{d.owner_email || '—'}</span>,
              <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dash-text-secondary, #a1a1a1)', maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                {d.git_url?.replace('https://github.com/', '') || '—'}
              </span>,
              statusBadge(d.status),
              <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>{fmt(d.deployed_at)}</span>,
            ])}
          />
        </div>
      </div>
    </section>
  );
}

function PaymentsSection({ data }) {
  const { payments } = data;
  return (
    <section>
      <SectionHeader title={`Payments (${payments.length})`} />
      <div style={{ padding: '1rem 1.5rem' }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
          <Table
            cols={['ID', 'Customer', 'Plan', 'Amount', 'Status', 'Date']}
            rows={payments.map(p => [
              <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>#{p.id}</span>,
              <span style={{ fontSize: '0.8125rem', color: 'var(--dash-text-primary, #fafafa)' }}>{p.customer_email || '—'}</span>,
              <Badge color="#60a5fa" bg="rgba(59,130,246,0.12)">{p.plan}</Badge>,
              <span style={{ ...MONO, fontSize: '0.875rem', fontWeight: 700, color: '#fbbf24' }}>${(p.amount / 100).toFixed(2)}</span>,
              statusBadge(p.status),
              <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)' }}>{fmt(p.created_at)}</span>,
            ])}
          />
        </div>
      </div>
    </section>
  );
}

// ── Nav config ────────────────────────────────────────────────────────────────

function buildNav(pendingCount) {
  return [
    {
      id: 'stats', label: 'Stats',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
    {
      id: 'pending', label: pendingCount > 0 ? `Pending (${pendingCount})` : 'Pending',
      badge: pendingCount,
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      id: 'users', label: 'Users',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>,
    },
    {
      id: 'servers', label: 'Servers',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /></svg>,
    },
    {
      id: 'domains', label: 'Domains',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>,
    },
    {
      id: 'deployments', label: 'Deployments',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    },
    {
      id: 'payments', label: 'Payments',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    },
  ];
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function AdminSidebar({ nav, active, onNav, open, onToggle }) {
  return (
    <aside className="dash-sidebar" id="dash-sidebar" data-open={open ? 'true' : 'false'}>
      <button
        id="dash-sidebar-hamburger"
        onClick={onToggle}
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        className="dash-sidebar-hamburger w-full shrink-0 items-center justify-start px-3.5 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div id="dash-sidebar-inner" className="dash-sidebar-inner flex min-h-0 flex-1 flex-col">
        {/* Nav items */}
        <nav className="flex-1 px-0 py-1.5">
          {nav.map((item) => {
            const isActive = item.id === active;
            const hasBadge = item.badge > 0;
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`group flex w-full items-center gap-2.5 whitespace-nowrap border-l-2 px-4 py-[0.58rem] text-left text-[0.8125rem] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  isActive
                    ? 'border-white bg-black text-white'
                    : hasBadge
                      ? 'border-transparent text-[rgba(251,146,60,0.9)] hover:bg-white/4 hover:text-orange-400'
                      : 'border-transparent text-[rgba(161,161,161,0.85)] hover:bg-white/4 hover:text-white'
                }`}
              >
                <span className={`flex shrink-0 items-center justify-center transition-opacity duration-150 ${isActive ? 'opacity-100 text-white' : 'opacity-60 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className={isActive ? 'font-medium' : 'font-normal'}>{item.label}</span>
                {hasBadge && !isActive && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '0.25rem', background: 'rgba(249,115,22,0.15)', color: '#fb923c' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="border-t-faint px-4 py-3">
          {/* Admin badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.25rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width={12} height={12} fill="currentColor" viewBox="0 0 20 20" style={{ color: '#f87171' }}>
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--dash-text-primary, #fafafa)', fontWeight: 500 }}>Admin Panel</div>
              <div style={{ fontSize: '0.5625rem', color: '#f87171', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Access</div>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem' }}>
            <a href="/admin/updates" style={{ fontSize: '0.6875rem', color: '#fb923c', textDecoration: 'none' }}>Updates</a>
            <a href="/dashboard?demo=true&demoPlan=pro" style={{ fontSize: '0.6875rem', color: 'rgba(120,120,120,1)', textDecoration: 'none' }}>Demo</a>
            <a href="https://cloud.digitalocean.com/droplets" target="_blank" rel="noreferrer" style={{ fontSize: '0.6875rem', color: 'rgba(120,120,120,1)', textDecoration: 'none' }}>DO</a>
            <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" style={{ fontSize: '0.6875rem', color: 'rgba(120,120,120,1)', textDecoration: 'none' }}>Stripe</a>
            <a href="/dashboard" style={{ fontSize: '0.6875rem', color: 'rgba(120,120,120,1)', textDecoration: 'none' }}>Dashboard</a>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

const SECTIONS = { stats: StatsSection, pending: PendingSection, users: UsersSection, servers: ServersSection, domains: DomainsSection, deployments: DeploymentsSection, payments: PaymentsSection };

export default function AdminPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [active, setActive]   = useState('stats');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast]     = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/admin/data', { credentials: 'same-origin' })
      .then(r => {
        if (r.status === 401 || r.status === 403) { window.location.href = '/login'; return null; }
        if (!r.ok) throw new Error(`Admin API error (${r.status})`);
        return r.json();
      })
      .then(d => { if (d) setData(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function onAction(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
    load();
  }

  if (loading) return (
    <div className="cb-screen-state">
      <span style={{ color: 'var(--dash-text-muted, #525252)', fontSize: '0.875rem' }}>Loading…</span>
    </div>
  );

  if (error) return (
    <div className="cb-screen-state">
      <span style={{ color: 'var(--dash-danger, #ef4444)', fontSize: '0.875rem' }}>{error}</span>
    </div>
  );

  const nav = buildNav(data.pendingRequests.length);
  const ActiveSection = SECTIONS[active] ?? StatsSection;

  return (
    <div className="cb-dashboard-root">
      <div className="cb-shell">
        <div className="cb-shell-inner min-h-screen flex flex-col">
          <header className="cb-dashboard-header">
            <a href="/admin" aria-label="Admin Dashboard" className="flex items-center">
              <img src="/CB-logo-icon.svg" alt="Clouded Basement" className="h-12 w-auto max-w-[220px]" />
            </a>
          </header>

          <div className="cb-dashboard-body">
            <AdminSidebar nav={nav} active={active} onNav={setActive} open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

            <main className="cb-dashboard-main">
              {toast && (
                <div style={{
                  background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: '0.5rem', padding: '0.625rem 1rem', marginBottom: '1rem',
                  color: '#86efac', fontSize: '0.8125rem',
                }}>
                  {toast}
                </div>
              )}
              <ActiveSection data={data} onAction={onAction} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
