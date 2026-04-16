import { useState, useEffect, useCallback, useRef } from 'react';

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

const STATUS_MAP = {
  draft:    <Badge color="#a1a1a1" bg="rgba(255,255,255,0.06)">draft</Badge>,
  tested:   <Badge color="#eab308" bg="rgba(234,179,8,0.10)">tested</Badge>,
  released: <Badge color="#22c55e" bg="rgba(34,197,94,0.10)">released</Badge>,
  archived: <Badge color="#525252" bg="rgba(255,255,255,0.04)">archived</Badge>,
};
const TYPE_COLOR = {
  security: { color: '#f87171', bg: 'rgba(239,68,68,0.10)' },
  config:   { color: '#eab308', bg: 'rgba(234,179,8,0.10)' },
  feature:  { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
  script:   { color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
};

function statusBadge(val) { return STATUS_MAP[val] ?? <Badge>{val ?? '—'}</Badge>; }
function typeBadge(val) {
  const s = TYPE_COLOR[val] || { color: '#a1a1a1', bg: 'rgba(255,255,255,0.06)' };
  return <Badge color={s.color} bg={s.bg}>{val}</Badge>;
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

function ActionBtn({ label, onClick, danger, warning, primary, disabled }) {
  let borderColor = 'rgba(255,255,255,0.12)';
  let color = 'var(--dash-text-secondary, #a1a1a1)';
  if (danger)   { borderColor = 'rgba(239,68,68,0.3)';   color = '#f87171'; }
  if (warning)  { borderColor = 'rgba(234,179,8,0.3)';   color = '#eab308'; }
  if (primary)  { borderColor = 'rgba(34,197,94,0.3)';   color = '#4ade80'; }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '0.25rem 0.625rem', borderRadius: '0.3125rem',
      background: 'transparent', border: `1px solid ${borderColor}`, color,
      fontSize: '0.6875rem', cursor: disabled ? 'wait' : 'pointer', whiteSpace: 'nowrap',
      opacity: disabled ? 0.6 : 1,
    }}>
      {label}
    </button>
  );
}

// ── Post helper ───────────────────────────────────────────────────────────────

// Returns { msg, warn } — warn is non-null when script validation has cautions
async function postAction(url, body) {
  const r = await fetch(url, {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!r.ok && !r.redirected) throw new Error(`HTTP ${r.status}`);
  try {
    const finalUrl = new URL(r.url, window.location.origin);
    const errMsg = finalUrl.searchParams.get('error');
    if (errMsg) throw new Error(errMsg);
    const warnMsg = finalUrl.searchParams.get('warning');
    const msg = finalUrl.searchParams.get('success');
    return {
      msg: msg || 'Done.',
      warn: warnMsg || null,
    };
  } catch (e) {
    if (r.redirected) return { msg: 'Done.', warn: null };
    throw e;
  }
}

// ── Updates table section ─────────────────────────────────────────────────────

function UpdatesSection({ data, onAction }) {
  const { updates, testServers, csrfToken } = data;
  const [loading, setLoading] = useState(null);
  const [testOpen, setTestOpen] = useState(null); // update id with open test dropdown
  const [testServerId, setTestServerId] = useState('');
  const dropRef = useRef(null);

  useEffect(() => {
    if (testServers.length > 0) setTestServerId(String(testServers[0].id));
  }, [testServers]);

  useEffect(() => {
    function close(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setTestOpen(null);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  async function act(label, url, body, confirmMsg) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setLoading(label);
    try {
      const { msg, warn } = await postAction(url, body);
      onAction(warn ? `${msg} — ⚠ ${warn}` : msg);
    } catch (e) { onAction(`Error: ${e.message}`, true); }
    finally { setLoading(null); }
  }

  if (!updates.length) {
    return (
      <section>
        <SectionHeader title="All Updates" />
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--dash-text-muted, #525252)' }}>No updates yet. Create one using the form.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title={`All Updates (${updates.length})`} />
      <div style={{ padding: '1rem 1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr>
              {['Update', 'Type', 'Status', 'Servers', 'Actions'].map(c => (
                <th key={c} style={{
                  padding: '0.5rem 0.75rem', textAlign: 'left',
                  fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                  color: 'var(--dash-text-muted, #525252)', borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {updates.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {/* Update */}
                <td style={{ padding: '0.75rem', verticalAlign: 'middle', maxWidth: '16rem' }}>
                  <a href={`/admin/updates/${u.id}`} style={{ color: 'var(--dash-text-primary, #fafafa)', fontWeight: 500, textDecoration: 'none', fontSize: '0.8125rem' }}>
                    {u.title}
                  </a>
                  {u.is_critical && <span style={{ marginLeft: '0.375rem', fontSize: '0.625rem', color: '#f87171', fontWeight: 700 }}>CRITICAL</span>}
                  {u.description && (
                    <div style={{ color: 'var(--dash-text-muted, #525252)', fontSize: '0.6875rem', marginTop: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '14rem' }}>
                      {u.description}
                    </div>
                  )}
                  {u.version && (
                    <div style={{ ...MONO, fontSize: '0.625rem', color: 'var(--dash-text-muted, #525252)', marginTop: '0.125rem' }}>v{u.version}</div>
                  )}
                </td>
                {/* Type */}
                <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>{typeBadge(u.type)}</td>
                {/* Status */}
                <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>{statusBadge(u.status)}</td>
                {/* Servers */}
                <td style={{ padding: '0.75rem', verticalAlign: 'middle', fontSize: '0.75rem' }}>
                  {u.status === 'released' ? (
                    <span>
                      <span style={{ color: '#4ade80' }}>{u.success_count || 0} ✓</span>
                      {Number(u.failure_count) > 0 && <span style={{ color: '#f87171', marginLeft: '0.375rem' }}>{u.failure_count} ✗</span>}
                      {Number(u.missing_count) > 0 && <span style={{ color: '#fbbf24', marginLeft: '0.375rem' }}>{u.missing_count} pending</span>}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--dash-text-muted, #525252)' }}>—</span>
                  )}
                </td>
                {/* Actions */}
                <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Test — only for draft, opens a dropdown to pick server */}
                    {u.status === 'draft' && (
                      testServers.length > 0 ? (
                        <div style={{ position: 'relative' }} ref={testOpen === u.id ? dropRef : null}>
                          <ActionBtn
                            label={loading === `test-${u.id}` ? '…' : 'Test'}
                            warning
                            disabled={loading === `test-${u.id}`}
                            onClick={() => setTestOpen(o => o === u.id ? null : u.id)}
                          />
                          {testOpen === u.id && (
                            <div style={{
                              position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: '0.25rem',
                              background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '0.5rem', padding: '0.75rem', minWidth: '14rem', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            }}>
                              <p style={{ fontSize: '0.6875rem', color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '0.5rem' }}>Select test server:</p>
                              <select
                                value={testServerId}
                                onChange={e => setTestServerId(e.target.value)}
                                style={{
                                  width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '0.375rem', color: '#fafafa', padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem', marginBottom: '0.5rem',
                                }}
                              >
                                {testServers.map(s => (
                                  <option key={s.id} value={s.id}>
                                    {s.ip_address} ({s.owner_email || 'unknown'})
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  setTestOpen(null);
                                  act(`test-${u.id}`, `/admin/updates/${u.id}/test`,
                                    `_csrf=${encodeURIComponent(csrfToken)}&serverId=${encodeURIComponent(testServerId)}`,
                                    null);
                                }}
                                style={{
                                  width: '100%', padding: '0.375rem', borderRadius: '0.375rem',
                                  background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)',
                                  color: '#eab308', fontSize: '0.75rem', cursor: 'pointer',
                                }}
                              >
                                Run Test
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.6875rem', color: '#fbbf24' }} title="No running servers available">No test servers</span>
                      )
                    )}

                    {/* Release — only for tested */}
                    {u.status === 'tested' && (
                      <ActionBtn
                        label={loading === `release-${u.id}` ? '…' : 'Release'}
                        primary
                        disabled={loading === `release-${u.id}`}
                        onClick={() => act(`release-${u.id}`, `/admin/updates/${u.id}/release`,
                          `_csrf=${encodeURIComponent(csrfToken)}`,
                          'Release this update? Customers will be able to apply it.')}
                      />
                    )}

                    {/* Push all — released with pending servers */}
                    {u.status === 'released' && Number(u.missing_count) > 0 && (
                      <ActionBtn
                        label={loading === `push-${u.id}` ? '…' : `Push (${u.missing_count})`}
                        warning
                        disabled={loading === `push-${u.id}`}
                        onClick={() => act(`push-${u.id}`, `/admin/updates/${u.id}/push`,
                          `_csrf=${encodeURIComponent(csrfToken)}`,
                          `Push to ${u.missing_count} server(s)?`)}
                      />
                    )}

                    {/* Retry failed */}
                    {u.status === 'released' && Number(u.failure_count) > 0 && (
                      <ActionBtn
                        label={loading === `retry-${u.id}` ? '…' : `Retry (${u.failure_count})`}
                        disabled={loading === `retry-${u.id}`}
                        onClick={() => act(`retry-${u.id}`, `/admin/updates/${u.id}/retry`,
                          `_csrf=${encodeURIComponent(csrfToken)}`, null)}
                      />
                    )}

                    {/* Archive */}
                    {u.status === 'released' && (
                      <ActionBtn
                        label={loading === `archive-${u.id}` ? '…' : 'Archive'}
                        disabled={loading === `archive-${u.id}`}
                        onClick={() => act(`archive-${u.id}`, `/admin/updates/${u.id}/archive`,
                          `_csrf=${encodeURIComponent(csrfToken)}`,
                          'Archive this update?')}
                      />
                    )}

                    {/* Delete — draft or archived only */}
                    {(u.status === 'draft' || u.status === 'archived') && (
                      <ActionBtn
                        label={loading === `delete-${u.id}` ? '…' : 'Delete'}
                        danger
                        disabled={loading === `delete-${u.id}`}
                        onClick={() => act(`delete-${u.id}`, `/admin/updates/${u.id}/delete`,
                          `_csrf=${encodeURIComponent(csrfToken)}`,
                          'Delete this update? This cannot be undone.')}
                      />
                    )}

                    {/* View detail */}
                    <a
                      href={`/admin/updates/${u.id}`}
                      style={{
                        padding: '0.25rem 0.625rem', borderRadius: '0.3125rem',
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                        color: 'var(--dash-text-secondary, #a1a1a1)', fontSize: '0.6875rem',
                        textDecoration: 'none', whiteSpace: 'nowrap',
                      }}
                    >
                      View
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Create section ────────────────────────────────────────────────────────────

function CreateSection({ data, onAction }) {
  const { csrfToken } = data;
  const [form, setForm] = useState({ title: '', description: '', script: '', type: 'security', version: '', isCritical: false });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const [warn, setWarn] = useState(null);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setErr(null); setWarn(null); }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setErr('Title is required.'); return; }
    if (!form.script.trim()) { setErr('Script is required.'); return; }
    setSubmitting(true); setErr(null); setWarn(null);
    try {
      const body = [
        `_csrf=${encodeURIComponent(csrfToken)}`,
        `title=${encodeURIComponent(form.title.trim())}`,
        `description=${encodeURIComponent(form.description.trim())}`,
        `script=${encodeURIComponent(form.script.trim())}`,
        `type=${encodeURIComponent(form.type)}`,
        `version=${encodeURIComponent(form.version.trim())}`,
        form.isCritical ? 'isCritical=on' : '',
      ].filter(Boolean).join('&');
      const { msg, warn: w } = await postAction('/admin/updates/create', body);
      setForm({ title: '', description: '', script: '', type: 'security', version: '', isCritical: false });
      if (w) setWarn(w);   // show warnings inline in the form area
      onAction(msg);
    } catch (e) { setErr(e.message); }
    finally { setSubmitting(false); }
  }

  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.375rem', color: '#fafafa', padding: '0.5rem 0.75rem',
    fontSize: '0.8125rem', boxSizing: 'border-box',
  };

  return (
    <section>
      <SectionHeader title="Create New Update" />
      <div style={{ padding: '1.5rem' }}>
        {err && (
          <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', padding: '0.625rem 1rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.8125rem' }}>
            {err}
          </div>
        )}
        {warn && (
          <div style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '0.5rem', padding: '0.625rem 1rem', marginBottom: '1rem', color: '#fbbf24', fontSize: '0.8125rem' }}>
            ⚠ {warn}
          </div>
        )}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '0.375rem' }}>Title *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Security patch v1.0.2" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '0.375rem' }}>Version</label>
              <input type="text" value={form.version} onChange={e => set('version', e.target.value)} placeholder="1.0.2" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '0.375rem' }}>Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
                <option value="security">Security (Critical)</option>
                <option value="config">Config</option>
                <option value="feature">Feature</option>
                <option value="script">Script</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.125rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--dash-text-secondary, #a1a1a1)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isCritical} onChange={e => set('isCritical', e.target.checked)} />
                Mark as Critical
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '0.375rem' }}>Description</label>
            <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Patches CVE-2026-1234 vulnerability" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '0.375rem' }}>Bash Script *</label>
            <textarea
              value={form.script}
              onChange={e => set('script', e.target.value)}
              rows={10}
              placeholder={'#!/bin/bash\n# Description of what this script does\nset -euo pipefail\n\napt update\napt upgrade -y'}
              style={{ ...inputStyle, ...MONO, fontSize: '0.75rem', resize: 'vertical' }}
            />
            <p style={{ fontSize: '0.6875rem', color: 'var(--dash-text-muted, #525252)', marginTop: '0.375rem' }}>
              <code>set -euo pipefail</code> is auto-added. Dangerous commands are blocked.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting} style={{
              padding: '0.5rem 1.25rem', borderRadius: '0.375rem',
              background: submitting ? 'rgba(255,255,255,0.06)' : 'rgba(127,214,255,0.1)',
              border: '1px solid rgba(127,214,255,0.25)', color: submitting ? '#525252' : '#7fd6ff',
              fontSize: '0.875rem', fontWeight: 600, cursor: submitting ? 'wait' : 'pointer',
            }}>
              {submitting ? 'Creating…' : 'Create Draft'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV = [
  { id: 'updates',  label: 'Updates',      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> },
  { id: 'create',   label: 'Create Update', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> },
];

function UpdatesSidebar({ active, onNav, open, onToggle, killSwitchActive, totalServers, onKillSwitch, killLoading }) {
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
        <nav className="flex-1 px-0 py-1.5">
          {NAV.map(item => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`group flex w-full items-center gap-2.5 whitespace-nowrap border-l-2 px-4 py-[0.58rem] text-left text-[0.8125rem] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  isActive ? 'border-white bg-black text-white' : 'border-transparent text-[rgba(161,161,161,0.85)] hover:bg-white/4 hover:text-white'
                }`}
              >
                <span className={`flex shrink-0 items-center justify-center transition-opacity duration-150 ${isActive ? 'opacity-100 text-white' : 'opacity-60 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className={isActive ? 'font-medium' : 'font-normal'}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t-faint px-4 py-3">
          {/* Kill switch */}
          <div style={{ marginBottom: '0.875rem' }}>
            <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: killSwitchActive ? '#f87171' : '#525252', marginBottom: '0.375rem' }}>
              {killSwitchActive ? '⚠ Kill Switch Active' : `Kill Switch · ${totalServers} servers`}
            </div>
            <button
              onClick={onKillSwitch}
              disabled={killLoading}
              style={{
                width: '100%', padding: '0.375rem 0.75rem', borderRadius: '0.375rem',
                background: killSwitchActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: killSwitchActive ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                color: killSwitchActive ? '#4ade80' : '#f87171',
                fontSize: '0.75rem', fontWeight: 600, cursor: killLoading ? 'wait' : 'pointer',
              }}
            >
              {killLoading ? '…' : killSwitchActive ? '▶ Resume Executions' : '⏹ Emergency Stop'}
            </button>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem' }}>
            <a href="/admin" style={{ fontSize: '0.6875rem', color: 'rgba(120,120,120,1)', textDecoration: 'none' }}>← Admin</a>
            <a href="/dashboard" style={{ fontSize: '0.6875rem', color: 'rgba(120,120,120,1)', textDecoration: 'none' }}>Dashboard</a>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

const SECTIONS = { updates: UpdatesSection, create: CreateSection };

export default function AdminUpdatesPage() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [active, setActive]         = useState('updates');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast]           = useState(null);
  const [killLoading, setKillLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/admin/updates/data', { credentials: 'same-origin' })
      .then(r => {
        if (r.status === 401 || r.status === 403) { window.location.href = '/login'; return null; }
        if (!r.ok) throw new Error(`Server error (${r.status})`);
        return r.json();
      })
      .then(d => { if (d) setData(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg, isErr = false) {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 4000);
  }

  function onAction(msg, isErr = false) {
    showToast(msg, isErr);
    if (!isErr) load();
  }

  async function onKillSwitch() {
    if (!confirm(data.killSwitchActive ? 'Resume update executions?' : 'STOP all update executions?')) return;
    setKillLoading(true);
    try {
      const { msg } = await postAction('/admin/updates/kill-switch', `_csrf=${encodeURIComponent(data.csrfToken)}`);
      onAction(msg);
    } catch (e) { onAction(`Error: ${e.message}`, true); }
    finally { setKillLoading(false); }
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

  const ActiveSection = SECTIONS[active] ?? UpdatesSection;

  return (
    <div className="cb-dashboard-root">
      <div className="cb-shell">
        <div className="cb-shell-inner min-h-screen flex flex-col">
          <header className="cb-dashboard-header">
            <a href="/admin" aria-label="Admin" className="flex items-center">
              <img src="/CB-logo-icon.svg" alt="Clouded Basement" className="h-12 w-auto max-w-55" />
            </a>
          </header>

          <div className="cb-dashboard-body">
            <UpdatesSidebar
              active={active}
              onNav={id => { setActive(id); }}
              open={sidebarOpen}
              onToggle={() => setSidebarOpen(o => !o)}
              killSwitchActive={data.killSwitchActive}
              totalServers={data.totalServers}
              onKillSwitch={onKillSwitch}
              killLoading={killLoading}
            />

            <main className="cb-dashboard-main">
              {data.killSwitchActive && (
                <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', padding: '0.625rem 1rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.8125rem' }}>
                  <strong>⚠ KILL SWITCH ACTIVE</strong> — All update executions are paused. Use the sidebar to resume.
                </div>
              )}

              {toast && (
                <div style={{
                  background: toast.isErr ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)',
                  border: `1px solid ${toast.isErr ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                  borderRadius: '0.5rem', padding: '0.625rem 1rem', marginBottom: '1rem',
                  color: toast.isErr ? '#f87171' : '#86efac', fontSize: '0.8125rem',
                }}>
                  {toast.msg}
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
