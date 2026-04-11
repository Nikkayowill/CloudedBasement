import { useState, useEffect, useRef } from 'react';
import ResponsiveNav from './ResponsiveNav';
import Footer from '../sections/Footer';

/**
 * Shared layout for doc/legal pages: sticky sidebar TOC + scroll-to-top.
 * Nav sits inside the cb-shell grid so it connects to the rail borders.
 */
export default function DocLayout({ toc, children }) {
  const [activeId, setActiveId] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const observerRef = useRef(null);

  // Highlight active TOC link on scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-60px 0px -60% 0px', threshold: 0 }
    );
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [toc]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileTocOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileTocOpen]);

  const tocLinkStyle = (id) => ({
    display: 'block',
    padding: '0.375rem 0.625rem',
    borderLeft: `2px solid ${activeId === id ? '#2DA7DF' : 'transparent'}`,
    color: activeId === id ? '#7fd6ff' : 'rgba(161,161,161,0.85)',
    fontSize: '0.8125rem',
    textDecoration: 'none',
    transition: 'color 150ms, border-color 150ms',
    background: activeId === id ? 'rgba(45,167,223,0.06)' : 'none',
    borderRadius: '0 0.25rem 0.25rem 0',
  });

  return (
    <>
      <div className="funnel">
        <div className="cb-shell">
          <div className="cb-shell-inner" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <ResponsiveNav />

            {/* Body: sidebar + content */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

              {/* Desktop sidebar TOC */}
              <aside className="hidden md:block" style={{
                width: '14rem',
                flexShrink: 0,
                position: 'sticky',
                top: '3.5rem',
                height: 'calc(100vh - 3.5rem)',
                overflowY: 'auto',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                background: 'var(--cb-bg)',
              }}>
                <div style={{ padding: '2rem 1rem 2rem 1.25rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4b5563', marginBottom: '1rem' }}>
                    On this page
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    {toc.map(({ id, label }) => (
                      <li key={id}>
                        <a href={`#${id}`} style={tocLinkStyle(id)}
                           onMouseEnter={(e) => { if (activeId !== id) e.currentTarget.style.color = '#f5f5f5'; }}
                           onMouseLeave={(e) => { if (activeId !== id) e.currentTarget.style.color = 'rgba(161,161,161,0.85)'; }}>
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              {/* Main content */}
              <main style={{ flex: 1, minWidth: 0, padding: '3rem 2.5rem 5rem', maxWidth: '52rem' }}>
                {children}
              </main>
            </div>

            <Footer />
          </div>
        </div>
      </div>

      {/* Mobile TOC toggle */}
      <button
        onClick={() => setMobileTocOpen((o) => !o)}
        aria-label="Table of contents"
        style={{
          display: 'none',
          position: 'fixed', bottom: '5rem', left: '1rem', zIndex: 60,
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '0.5rem', padding: '0.625rem',
          color: '#9ca3af', cursor: 'pointer',
        }}
        className="md:hidden"
        // show on mobile via CSS class override
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
        </svg>
      </button>

      {mobileTocOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileTocOpen(false)}
        />
      )}

      {mobileTocOpen && (
        <aside style={{
          position: 'fixed', inset: '0 auto 0 0', zIndex: 56,
          width: '16rem',
          background: 'var(--cb-bg)', borderRight: '1px solid rgba(255,255,255,0.07)',
          overflowY: 'auto', paddingTop: '5rem', paddingBottom: '2rem',
        }}>
          <div style={{ padding: '0 1rem 0 1.25rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4b5563', marginBottom: '1rem' }}>
              On this page
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {toc.map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={() => setMobileTocOpen(false)} style={tocLinkStyle(id)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50,
            background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '0.5rem', padding: '0.625rem',
            color: '#9ca3af', cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
}
