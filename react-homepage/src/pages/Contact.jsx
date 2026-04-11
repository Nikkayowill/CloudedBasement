import { useState } from 'react';
import PageLayout from '../components/PageLayout';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const tokenRes = await fetch('/api/csrf-token', { credentials: 'include' });
      if (!tokenRes.ok) {
        setErrorMsg('Failed to fetch CSRF token. Please reload and try again.');
        setStatus('error');
        return;
      }
      const { csrfToken } = await tokenRes.json();

      const res = await fetch('/api/contact', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      } else {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  const inputClass = 'w-full px-4 py-3 bg-black/40 border border-blue-500/30 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all';

  return (
    <PageLayout>
      <section className="funnel-section funnel-bg-solution">
          <div className="funnel-prose">
            <h1 className="funnel-heading-1 text-center mb-4">Contact Us</h1>
            <p className="funnel-body text-center mb-12">Get in touch with our team</p>

            {status === 'success' ? (
              <div className="funnel-card-featured p-8 text-center">
                <p className="funnel-heading-3 mb-2" style={{ color: '#4ade80' }}>Message sent!</p>
                <p className="funnel-body">Your message was successfully sent. We'll get back to you soon.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 px-6 py-2 border border-gray-700 text-gray-300 rounded hover:bg-gray-800 transition text-sm"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="funnel-card-featured p-8">
                {status === 'error' && (
                  <div className="mb-6 bg-red-950/30 border border-red-500/30 rounded p-4">
                    <p className="funnel-body-sm" style={{ color: '#f87171' }}>{errorMsg}</p>
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="contact-name" className="block funnel-body-sm font-medium mb-2" style={{ color: '#d1d5db' }}>Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="contact-email" className="block funnel-body-sm font-medium mb-2" style={{ color: '#d1d5db' }}>Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="contact-message" className="block funnel-body-sm font-medium mb-2" style={{ color: '#d1d5db' }}>Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    className={`${inputClass} resize-y`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="funnel-btn funnel-btn-primary w-full uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
    </section>
    </PageLayout>
  );
}
