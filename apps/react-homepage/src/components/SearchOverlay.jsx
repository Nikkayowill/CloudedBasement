import { useState, useEffect, useRef } from 'react';
import { useSearch } from '../hooks/useSearch';

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('');
  const results = useSearch(query);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  // Flatten all result items for keyboard nav
  const flat = results.flatMap((g) => g.items);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setCursor(0); }, [query]);

  function handleKey(e) {
    if (flat.length === 0) return;
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, flat.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && flat[cursor]) { window.location.href = flat[cursor].href; onClose(); }
  }


  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#18181b',
        border: '1px solid #60a5fa',
        borderRadius: '999px',
        minWidth: '320px', maxWidth: '360px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        padding: '0.5rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        {/* Minimal search scope: icon + input */}
        <svg width="22" height="22" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search…"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#fff', fontSize: '1rem', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={onClose}
          style={{background: 'none', border: 'none', color: '#60a5fa', fontSize: '1.2rem', cursor: 'pointer'}}
          aria-label="Close search"
        >
          ×
        </button>
      </div>
      {/* Minimal dropdown for results */}
      {query.length >= 2 && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(50% + 32px)', left: '50%', transform: 'translateX(-50%)',
          background: '#18181b', border: '1px solid #60a5fa', borderRadius: '12px',
          minWidth: '320px', maxWidth: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          padding: '0.5rem 0', zIndex: 10000,
        }}>
          {results.flatMap((group) => group.items).map((item, idx) => (
            <a
              key={item.title}
              href={item.href}
              onClick={onClose}
              style={{
                display: 'block', padding: '0.5rem 1rem', textDecoration: 'none',
                color: '#e5e7eb', fontSize: '0.95rem', background: idx === cursor ? 'rgba(96,165,250,0.08)' : 'transparent',
                borderLeft: idx === cursor ? '2px solid #60a5fa' : '2px solid transparent',
                transition: 'background 100ms',
              }}
            >
              {item.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
