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
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [submitting, setSub]    = useState(false);
  const [result, setResult]     = useState(null); // { type: 'success'|'error', message }

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
  const [subject, setSubject]     = useState('');
  const [description, setDesc]    = useState('');
  const [priority, setPriority]   = useState('normal');
  const [submitting, setSub]      = useState(false);
  const [result, setResult]       = useState(null);

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

export default function SettingsSection({ data }) {
  const { csrfToken } = data;

  return (
    <section>
      <SectionHeader title="Settings" />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <ChangePasswordCard csrfToken={csrfToken} />
        <SupportTicketCard csrfToken={csrfToken} />
      </div>
    </section>
  );
}
