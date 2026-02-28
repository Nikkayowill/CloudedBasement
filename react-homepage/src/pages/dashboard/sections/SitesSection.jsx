import { useState } from 'react';

function SectionHeader({ title }) {
  return (
    <div className="border-b-faint" style={{ padding: '1.5rem 1.5rem 1rem' }}>
      <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dash-text-muted, #525252)' }}>
        {title === 'Sites' ? 'Domains' : title}
      </h2>
    </div>
  );
}

function DomainRow({ domain, csrfToken, hasServer }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1.25rem',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
        <span style={{ fontSize: '0.75rem', flexShrink: 0 }}>
          {domain.ssl_enabled ? '🔒' : '⚠️'}
        </span>
        <div style={{ minWidth: 0 }}>
          <a
            href={`${domain.ssl_enabled ? 'https' : 'http'}://${domain.domain}`}
            target="_blank" rel="noreferrer"
            style={{
              fontSize: '0.875rem', fontWeight: 500,
              color: 'var(--dash-text-primary, #fafafa)',
              textDecoration: 'none', display: 'block',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {domain.domain}
          </a>
          <span style={{ fontSize: '0.6875rem', color: domain.ssl_enabled ? '#4ade80' : '#facc15' }}>
            {domain.ssl_enabled ? 'SSL active' : 'Waiting for SSL'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        {!domain.ssl_enabled && hasServer && (
          <form action="/enable-ssl" method="POST">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <input type="hidden" name="domain" value={domain.domain} />
            <button type="submit" style={{
              padding: '0.3125rem 0.625rem', borderRadius: '0.3125rem',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--dash-text-secondary, #a1a1a1)', fontSize: '0.6875rem',
              cursor: 'pointer',
            }}>
              Enable SSL
            </button>
          </form>
        )}
        <form action="/delete-domain" method="POST"
          onSubmit={(e) => { if (!window.confirm('Remove this domain?')) e.preventDefault(); }}>
          <input type="hidden" name="_csrf" value={csrfToken} />
          <input type="hidden" name="domain_id" value={domain.id} />
          <button type="submit" style={{
            padding: '0.3125rem 0.625rem', borderRadius: '0.3125rem',
            background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', fontSize: '0.6875rem', cursor: 'pointer',
          }}>
            Remove
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SitesSection({ data }) {
  const { domains = [], hasServer, csrfToken } = data;
  const [domainInput, setDomainInput] = useState('');

  return (
    <section>
      <SectionHeader title="Domains" />

      <div style={{ padding: '1.5rem' }}>
        {/* Domain list */}
        {domains.length > 0 ? (
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem', marginBottom: '1.25rem', overflow: 'hidden' }}>
            {domains.map((d) => (
              <DomainRow key={d.id} domain={d} csrfToken={csrfToken} hasServer={hasServer} />
            ))}
          </div>
        ) : (
          <div style={{
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.625rem',
            padding: '2.5rem 1.5rem', textAlign: 'center', marginBottom: '1.25rem',
          }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--dash-text-muted, #525252)' }}>
              No custom domains yet
            </p>
          </div>
        )}

        {/* Add domain form */}
        {hasServer && (
          <form action="/add-domain" method="POST">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                name="domain"
                placeholder="yourdomain.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                required
                style={{
                  flex: 1, minWidth: '12rem',
                  padding: '0.5rem 0.875rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.375rem',
                  color: 'var(--dash-text-primary, #fafafa)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button type="submit" style={{
                padding: '0.5rem 1.125rem',
                background: '#2563eb', border: 'none', borderRadius: '0.375rem',
                color: '#fff', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
              }}>
                Add Domain
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
