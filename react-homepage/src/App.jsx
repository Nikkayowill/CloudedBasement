import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LenisScroll from './components/LenisScroll';
import HomePage from './HomePage';

// Dashboard is code-split — only loads when /dashboard is visited
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Scroll-reveal + Lenis only needed on the marketing homepage
function HomeWrapper() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    document
      .querySelectorAll('.reveal, .reveal-scale, .reveal-stagger')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <LenisScroll />
      <HomePage />
    </>
  );
}

// App is router-agnostic — the router provider lives in the entry files.
// Server entry wraps with StaticRouter; client entry wraps with BrowserRouter.
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeWrapper />} />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={null}>
            <DashboardPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
