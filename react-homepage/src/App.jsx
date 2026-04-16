import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LenisScroll from './components/LenisScroll';
import HomePage from './HomePage';

// Dashboard is code-split — only loads when /dashboard is visited
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage        = lazy(() => import('./pages/AdminPage'));
const AdminUpdatesPage = lazy(() => import('./pages/AdminUpdatesPage'));

// Public pages — code-split per route
const About    = lazy(() => import('./pages/About'));
const Compare  = lazy(() => import('./pages/Compare'));
const Contact  = lazy(() => import('./pages/Contact'));
const Docs     = lazy(() => import('./pages/Docs'));
const Faq      = lazy(() => import('./pages/Faq'));
const Login    = lazy(() => import('./pages/Login'));
const Pricing  = lazy(() => import('./pages/Pricing'));
const Privacy  = lazy(() => import('./pages/Privacy'));
const Register = lazy(() => import('./pages/Register'));
const Safety   = lazy(() => import('./pages/Safety'));
const Terms    = lazy(() => import('./pages/Terms'));

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

      {/* Public site pages */}
      <Route path="/about"        element={<Suspense fallback={null}><About /></Suspense>} />
      <Route path="/compare"      element={<Suspense fallback={null}><Compare /></Suspense>} />
      <Route path="/contact"      element={<Suspense fallback={null}><Contact /></Suspense>} />
      <Route path="/docs"         element={<Suspense fallback={null}><Docs /></Suspense>} />
      <Route path="/faq"          element={<Suspense fallback={null}><Faq /></Suspense>} />
      <Route path="/login"        element={<Suspense fallback={null}><Login /></Suspense>} />
      <Route path="/pricing"      element={<Suspense fallback={null}><Pricing /></Suspense>} />
      <Route path="/privacy"      element={<Suspense fallback={null}><Privacy /></Suspense>} />
      <Route path="/register"     element={<Suspense fallback={null}><Register /></Suspense>} />
      <Route path="/is-this-safe" element={<Suspense fallback={null}><Safety /></Suspense>} />
      <Route path="/terms"        element={<Suspense fallback={null}><Terms /></Suspense>} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={null}>
            <DashboardPage />
          </Suspense>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={null}>
            <AdminPage />
          </Suspense>
        }
      />
      <Route
        path="/admin/updates"
        element={
          <Suspense fallback={null}>
            <AdminUpdatesPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
