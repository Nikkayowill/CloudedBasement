import { useState } from 'react';

function SectionHeader({ title }) {
  return (
    <div className="border-b-faint" style={{ padding: '1.5rem 1.5rem 1rem' }}>
      <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dash-text-muted, #525252)' }}>
        {title}
      </h2>
    </div>
  );
}

function CardShell({ title, children }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', overflow: 'hidden' }}>
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--dash-text-primary, #fafafa)' }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '1.25rem' }}>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.5rem 0.875rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.375rem',
  color: 'var(--dash-text-primary, #fafafa)',
  fontSize: '0.875rem', outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', fontSize: '0.75rem',
  color: 'var(--dash-text-secondary, #a1a1a1)',
  marginBottom: '0.375rem',
};

function InlineAlert({ type, message }) {
  const isSuccess = type === 'success';
  return (
    <div style={{
      padding: '0.625rem 0.875rem', borderRadius: '0.375rem',
      background: isSuccess ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
      border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      color: isSuccess ? '#86efac' : '#fca5a5',
      fontSize: '0.8125rem',
    }}>
      {message}
    </div>
  );
}

function ChangePasswordCard({ csrfToken }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSub] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success'|'error', message }

  async function submit(e) {
    e.preventDefault();
    if (next !== confirm) {
      setResult({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (next.length < 8) {
      setResult({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }
    setSub(true);
    setResult(null);
    try {
      const body = new URLSearchParams({ _csrf: csrfToken, currentPassword: current, newPassword: next });
      const r = await fetch('/change-password', { method: 'POST', credentials: 'same-origin', body });
      const json = await r.json();
      if (json.success) {
        setResult({ type: 'success', message: json.message || 'Password changed successfully.' });
        setCurrent(''); setNext(''); setConfirm('');
      } else {
        setResult({ type: 'error', message: json.error || json.message || 'Failed to change password.' });
      }
    } catch {
      setResult({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSub(false);
    }
  }

  return (
    <CardShell title="Change Password">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={labelStyle}>Current password</label>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)}
            required autoComplete="current-password" style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>New password</label>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)}
            required minLength={8} autoComplete="new-password" style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Confirm new password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            required minLength={8} autoComplete="new-password" style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
        {result && <InlineAlert type={result.type} message={result.message} />}
        <button type="submit" disabled={submitting} style={{
          alignSelf: 'flex-start', padding: '0.5rem 1.125rem',
          background: '#2563eb', border: 'none', borderRadius: '0.375rem',
          color: '#fff', fontSize: '0.875rem', fontWeight: 500,
          cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1,
        }}>
          {submitting ? 'Saving…' : 'Update Password'}
        </button>
      </form>
    </CardShell>
  );
}

function SupportTicketCard({ csrfToken }) {
  const [subject, setSubject] = useState('');
  const [description, setDesc] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSub] = useState(false);
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setSub(true);
    setResult(null);
    try {
      const body = new URLSearchParams({ _csrf: csrfToken, subject, description, priority });
      const r = await fetch('/submit-ticket', { method: 'POST', credentials: 'same-origin', body });
      const json = await r.json();
      if (json.success) {
        setResult({ type: 'success', message: `Ticket #${json.ticketId} submitted. We'll be in touch shortly.` });
        setSubject(''); setDesc(''); setPriority('normal');
      } else {
        setResult({ type: 'error', message: json.error || 'Failed to submit ticket.' });
      }
    } catch {
      setResult({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSub(false);
    }
  }

  return (
    <CardShell title="Submit Support Ticket">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={labelStyle}>Subject</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
            required placeholder="Briefly describe your issue" style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={description} onChange={(e) => setDesc(e.target.value)}
            required rows={5} placeholder="Include any error messages, steps to reproduce, or context that might help."
            style={{ ...inputStyle, resize: 'vertical', minHeight: '7rem', lineHeight: 1.5 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{
            ...inputStyle, cursor: 'pointer',
            backgroundImage: 'none',
          }}>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        {result && <InlineAlert type={result.type} message={result.message} />}
        <button type="submit" disabled={submitting} style={{
          alignSelf: 'flex-start', padding: '0.5rem 1.125rem',
          background: '#2563eb', border: 'none', borderRadius: '0.375rem',
          color: '#fff', fontSize: '0.875rem', fontWeight: 500,
          cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1,
        }}>
          {submitting ? 'Submitting…' : 'Submit Ticket'}
        </button>
      </form>
    </CardShell>
  );
}

const PLANS = [
  { id: 'basic', name: 'Basic', monthly: 15, yearly: 162, siteLimit: 2, features: ['1 GB RAM', '1 vCPU', '25 GB Storage'] },
  { id: 'pro', name: 'Pro', monthly: 35, yearly: 378, siteLimit: 5, features: ['2 GB RAM', '2 vCPUs', '60 GB Storage'] },
  { id: 'premium', name: 'Premium', monthly: 65, yearly: 702, siteLimit: 10, features: ['4 GB RAM', '2 vCPUs', '80 GB Storage'] },
];

function PlanCard({ data }) {
  const { plan: currentPlan, paymentInterval, siteCount, siteLimit, hasServer, csrfToken } = data;
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [loading, setLoading] = useState(null); // plan id being processed

  if (!hasServer) return null;

  async function handleUpgrade(planId) {
    setStatus(null);
    setLoading(planId);
    try {
      const r = await fetch('/upgrade-plan', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ plan: planId }),
      });
      const d = await r.json();
      if (!r.ok) {
        setStatus({ type: 'error', message: d.error || 'Failed to update plan.' });
      } else {
        setStatus({ type: 'success', message: `Plan updated to ${PLANS.find(p => p.id === planId)?.name}. Your billing has been adjusted with proration.` });
        // Reload after short delay so dashboard data refreshes
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(null);
    }
  }

  const intervalLabel = paymentInterval === 'yearly' ? '/yr' : '/mo';

  return (
    <CardShell title="Plan">
      {/* Current plan summary */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        marginBottom: '1.25rem', padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--dash-text-secondary, #a1a1a1)' }}>Current plan:</span>
        <span style={{
          fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
          padding: '0.125rem 0.5rem', borderRadius: '0.25rem',
          background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
        }}>
          {PLANS.find(p => p.id === currentPlan)?.name ?? currentPlan}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)', marginLeft: 'auto' }}>
          {siteCount} / {siteLimit} sites used · billed {paymentInterval}
        </span>
      </div>

      {/* Plan grid */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {PLANS.map(p => {
          const currentPlanIndex = PLANS.findIndex(x => x.id === currentPlan);
          const targetPlanIndex = PLANS.findIndex(x => x.id === p.id);
          const isCurrent = p.id === currentPlan;
          const isUpgrade = currentPlanIndex === -1 || targetPlanIndex > currentPlanIndex;
          const wouldExceed = siteCount > p.siteLimit; const isLoading = loading === p.id;
          const price = paymentInterval === 'yearly' ? p.yearly : p.monthly;

          return (
            <div key={p.id} style={{
              flex: '1 1 9rem', minWidth: '9rem',
              border: isCurrent
                ? '1px solid rgba(59,130,246,0.35)'
                : '1px solid rgba(255,255,255,0.07)',
              borderRadius: '0.5rem', padding: '1rem',
              background: isCurrent ? 'rgba(59,130,246,0.05)' : 'transparent',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dash-text-primary, #fafafa)' }}>{p.name}</span>
                {isCurrent && (
                  <span style={{ fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.125rem 0.375rem', borderRadius: '0.2rem', background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                    Current
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dash-text-primary, #fafafa)' }}>
                ${price}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--dash-text-muted, #525252)' }}>{intervalLabel}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)', lineHeight: 1.5 }}>
                {p.features.map(f => <div key={f}>{f}</div>)}
                <div>{p.siteLimit} sites</div>
              </div>
              {!isCurrent && (
                <button
                  onClick={() => handleUpgrade(p.id)}
                  disabled={!!loading || wouldExceed}
                  title={wouldExceed ? `Remove ${siteCount - p.siteLimit} site(s) first` : undefined}
                  style={{
                    marginTop: '0.25rem', padding: '0.375rem 0.75rem',
                    borderRadius: '0.3125rem', fontSize: '0.75rem', fontWeight: 500,
                    cursor: (loading || wouldExceed) ? (wouldExceed ? 'not-allowed' : 'wait') : 'pointer',
                    background: isUpgrade ? 'rgba(59,130,246,0.12)' : 'transparent',
                    border: isUpgrade ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.1)',
                    color: isUpgrade ? '#60a5fa' : (wouldExceed ? 'var(--dash-text-muted, #525252)' : 'var(--dash-text-secondary, #a1a1a1)'),
                    opacity: wouldExceed ? 0.5 : 1,
                  }}
                >
                  {isLoading ? 'Updating…' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {status && (
        <div style={{ marginTop: '1rem' }}>
          <InlineAlert type={status.type} message={status.message} />
        </div>
      )}

      <p style={{ marginTop: '0.875rem', fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)' }}>
        Upgrades and downgrades are prorated — you'll only pay the difference for the remaining billing period.
      </p>
    </CardShell>
  );
}

function WebhookCard({ csrfToken, notifyWebhookUrl }) {
  const [url, setUrl]       = useState(notifyWebhookUrl || '');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const r = await fetch('/set-notify-webhook', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ _csrf: csrfToken, webhookUrl: url.trim() }),
      });
      const json = await r.json();
      if (json.success) setResult({ type: 'success', message: json.message });
      else              setResult({ type: 'error',   message: json.error || 'Failed to save.' });
    } catch {
      setResult({ type: 'error', message: 'Network error.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <CardShell title="Deploy Notifications">
      <p style={{ fontSize: '0.8125rem', color: 'var(--dash-text-secondary, #a1a1a1)', marginBottom: '1rem', lineHeight: 1.5 }}>
        Post a JSON payload to a URL on every deploy success or failure. Works with Slack, Discord, or any custom endpoint.
      </p>
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={labelStyle}>Webhook URL (https:// only)</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/…"
            style={inputStyle}
            onFocus={e  => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
            onBlur={e   => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
        {result && <InlineAlert type={result.type} message={result.message} />}
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button type="submit" disabled={saving} style={{
            padding: '0.5rem 1.125rem', background: '#2563eb', border: 'none',
            borderRadius: '0.375rem', color: '#fff', fontSize: '0.875rem', fontWeight: 500,
            cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          {url && (
            <button type="button" onClick={() => { setUrl(''); fetch('/set-notify-webhook', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ _csrf: csrfToken, webhookUrl: '' }) }).then(r => r.json()).then(json => { if (json.success) setResult({ type: 'success', message: json.message }); else setResult({ type: 'error', message: json.error || 'Failed to remove.' }); }).catch(() => setResult({ type: 'error', message: 'Network error.' })); }} style={{
              padding: '0.5rem 1rem', background: 'transparent',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.375rem',
              color: '#f87171', fontSize: '0.875rem', cursor: 'pointer',
            }}>
              Remove
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted, #525252)', lineHeight: 1.5 }}>
          Payload includes: <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>event</code>, <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>gitUrl</code>, <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>branch</code>, <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>subdomain</code>, <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>timestamp</code>
        </p>
      </form>
    </CardShell>
  );
}

export default function SettingsSection({ data }) {
  const { csrfToken, notifyWebhookUrl } = data;

  return (
    <section>
      <SectionHeader title="Settings" />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <PlanCard data={data} />
        <WebhookCard csrfToken={csrfToken} notifyWebhookUrl={notifyWebhookUrl} />
        <ChangePasswordCard csrfToken={csrfToken} />
        <SupportTicketCard csrfToken={csrfToken} />
      </div>
    </section>
  );
}
