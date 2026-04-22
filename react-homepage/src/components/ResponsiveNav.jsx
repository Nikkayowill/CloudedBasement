import { useState, useEffect, useRef } from 'react';
import { MenuIcon, XIcon, SearchIcon } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

export default function ResponsiveNav() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((d) => setLoggedIn(d.loggedIn))
      .catch(() => {});
  }, []);

  // Hide on scroll-down past 80px, show on scroll-up
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (y < 80) { setVisible(true); }
      else { setVisible(y < lastY.current); }
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cmd/Ctrl+K opens search
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* Nav sits inside .cb-shell-inner so it inherits the grid's width and rail borders */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: mobileOpen ? 1200 : 50,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 280ms ease, background 300ms ease, border-color 300ms ease',
        background: scrolled ? 'rgba(22,23,29,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.07)' : 'transparent'}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: '3.5rem',
          padding: '0 var(--cb-content-pad)',
          position: 'relative',
        }}>
          {/* Logo — left-aligned */}
          <a href="/" style={{
            display: 'flex', alignItems: 'center',
            flexShrink: 0, height: '3.5rem', textDecoration: 'none',
          }}>
            <img
              src="/CB-last-final.svg"
              alt="Clouded Basement"
              style={{ height: '2.5rem', width: 'auto', display: 'block', transform: 'translateY(0.8rem) scale(6.3)', transformOrigin: 'left center' }}
            />
          </a>

          {/* Desktop nav links — absolutely centred */}
          <div className="hidden md:flex" style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            alignItems: 'center',
            gap: '2rem',
          }}>
            {[
              { label: 'Features', href: '/#features' },
              { label: 'Pricing',  href: '/#pricing'  },
              { label: 'Docs',     href: '/docs'       },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 150ms' }}
                onMouseEnter={(e) => { e.target.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.target.style.color = '#9ca3af'; }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side — search + CTAs */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none',
                color: '#9ca3af', cursor: 'pointer',
                padding: '0.25rem', transition: 'color 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}
              aria-label="Open search"
            >
              <SearchIcon size={18} />
            </button>

            <div className="hidden md:flex" style={{ gap: '0.75rem' }}>
              {loggedIn ? (
                <a href="/dashboard"
                   className="funnel-btn funnel-btn-primary"
                   style={{ padding: '0.375rem 0.875rem', fontSize: '0.875rem' }}>
                  Dashboard
                </a>
              ) : (
                <>
                  <a href="/login"
                     className="funnel-btn funnel-btn-ghost"
                     style={{ padding: '0.375rem 0.875rem', fontSize: '0.875rem' }}>
                    Sign in
                  </a>
                  <a href="/register"
                     className="funnel-btn funnel-btn-primary"
                     style={{ padding: '0.375rem 0.875rem', fontSize: '0.875rem' }}>
                    Start free trial
                  </a>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: '0.25rem' }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <XIcon size={22} /> : (
                <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
                  <line x1="0" y1="2.5" x2="22" y2="2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                  <line x1="0" y1="11.5" x2="22" y2="11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile full-screen overlay (fixed to viewport, breaks out of sticky parent) */}
        <div className="md:hidden" style={{
          position: 'fixed', inset: 0, zIndex: 1300,
          minHeight: '100dvh',
          overflowY: 'auto',
          background: 'rgba(3,6,8,0.985)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'stretch', justifyContent: 'flex-start',
          transition: 'opacity 250ms',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <img
              src="/CB-last-final.svg"
              alt="Clouded Basement"
              style={{ height: '2rem', width: 'auto', display: 'block' }}
            />
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                width: '2.25rem', height: '2.25rem',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.04)',
                color: '#d1d5db',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Close menu"
            >
              <XIcon size={18} />
            </button>
          </div>

          <div style={{ padding: '1.15rem 1.25rem 0.75rem', display: 'flex', flexDirection: 'column' }}>
            {[
              { label: 'Features', href: '/#features' },
              { label: 'Pricing',  href: '/#pricing'  },
              { label: 'Docs',     href: '/docs'      },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: '#e5e7eb', textDecoration: 'none', fontSize: '1.125rem', fontWeight: 500,
                  padding: '0.9rem 0.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div style={{ padding: '0.9rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {loggedIn ? (
              <a
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="funnel-btn funnel-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Dashboard
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="funnel-btn funnel-btn-ghost"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sign in
                </a>
                <a
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="funnel-btn funnel-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Start free trial
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
