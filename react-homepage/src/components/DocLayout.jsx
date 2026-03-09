import { useState, useEffect, useRef } from 'react';
import ResponsiveNav from './ResponsiveNav';
import Footer from '../sections/Footer';

/**
 * Shared layout for doc/legal pages: sticky sidebar TOC + scroll-to-top.
 * @param {{ toc: Array<{id: string, label: string}>, children: React.ReactNode }} props
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
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
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

  // Lock scroll when mobile TOC is open
  useEffect(() => {
    document.body.style.overflow = mobileTocOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileTocOpen]);

  const tocLinkClass = (id) =>
    `block py-2 px-3 rounded-sm border-l-2 text-sm no-underline transition-all duration-150 ${
      activeId === id
        ? 'border-blue-500 text-blue-400 bg-gray-800/60'
        : 'border-transparent text-gray-300 hover:text-white hover:bg-gray-800/30'
    }`;

  return (
    <>
      <div className="funnel">
        <ResponsiveNav />

        {/* Body: sidebar + content */}
        <div className="flex pt-14 min-h-[calc(100vh-3.5rem)]">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-64 shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-gray-800 bg-[#030608]">
            <div className="py-8 px-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6">On This Page</h2>
              <ul className="space-y-1">
                {toc.map(({ id, label }) => (
                  <li key={id}>
                    <a href={`#${id}`} className={tocLinkClass(id)}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 pt-12 px-8 pb-24 max-w-4xl mx-auto">
            {children}
          </main>
        </div>

        <Footer />
      </div>

      {/* Fixed elements live outside .funnel so .funnel > * { position: relative } doesn't override them */}

      {/* Mobile TOC toggle button */}
      <button
        onClick={() => setMobileTocOpen((o) => !o)}
        aria-label="Table of contents"
        className="md:hidden fixed bottom-20 left-4 z-60 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-gray-400 cursor-pointer"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
        </svg>
      </button>

      {/* Mobile TOC overlay */}
      {mobileTocOpen && (
        <div
          className="fixed inset-0 z-55 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileTocOpen(false)}
        />
      )}

      {/* Mobile TOC sidebar */}
      {mobileTocOpen && (
        <aside className="fixed inset-y-0 left-0 z-56 w-64 bg-[#030608] border-r border-gray-800 overflow-y-auto pt-20 px-5 pb-8">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6">On This Page</h2>
          <ul className="space-y-1">
            {toc.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setMobileTocOpen(false)}
                  className={tocLinkClass(id)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Scroll-to-top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-gray-400 cursor-pointer"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
}
