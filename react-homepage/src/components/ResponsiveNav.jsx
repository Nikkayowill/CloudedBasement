import { useState, useEffect, useRef } from 'react';
import { MenuIcon, XIcon, SearchIcon } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

export default function ResponsiveNav() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Hide on scroll-down, show on scroll-up
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
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
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 280ms ease',
        background: 'transparent',
      }}>
        <div style={{
          maxWidth: '72rem', margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex', alignItems: 'center', height: '3.5rem', gap: '1.5rem',
        }}>
          {/* Logo */}
          <a href="/" style={{
            display: 'flex', alignItems: 'center',
            marginRight: 'auto', flexShrink: 0,
            height: '3.5rem',
          }}>
            <img
              src="/CB-logo-icon.svg"
              alt="Clouded Basement Logo"
              style={{ height: '2rem', width: '2rem', marginRight: '0.5rem', display: 'block' }}
            />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '2rem' }}>
            <a href="/#features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 150ms' }}
               onMouseEnter={(e) => e.target.style.color = '#fff'}
               onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Features</a>
            <a href="/#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 150ms' }}
               onMouseEnter={(e) => e.target.style.color = '#fff'}
               onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Pricing</a>
            <a href="/docs" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 150ms' }}
               onMouseEnter={(e) => e.target.style.color = '#fff'}
               onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Docs</a>
          </div>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none',
              color: '#9ca3af', cursor: 'pointer',
              padding: '0.25rem', transition: 'color 150ms',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            aria-label="Open search"
          >
            <SearchIcon size={18} />
          </button>

          {/* Desktop CTAs */}
          <div className="hidden md:flex" style={{ gap: '0.75rem' }}>
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
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem', position: 'relative', zIndex: 1000 }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>

        {/* Mobile full-screen menu */}
        <div className="md:hidden" style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(3,6,8,0.97)',
          backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '2rem',
          transition: 'opacity 250ms, pointer-events 0ms',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}>
          {[
            { label: 'Features', href: '/#features' },
            { label: 'Pricing',  href: '/#pricing'  },
            { label: 'Docs',     href: '/docs'       },
            { label: 'Sign in',  href: '/login'      },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                color: '#d1d5db', textDecoration: 'none',
                fontSize: '1.25rem', fontWeight: 500,
                transition: 'color 150ms',
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="funnel-btn funnel-btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            Start free trial
          </a>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}
            aria-label="Close menu"
          >
            <XIcon size={24} />
          </button>
        </div>
      </nav>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
