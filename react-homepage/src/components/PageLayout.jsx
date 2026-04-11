import ResponsiveNav from './ResponsiveNav';
import Footer from '../sections/Footer';

/**
 * Shared page shell for all funnel / content pages.
 *
 * Wraps content in the same cb-shell > cb-shell-inner grid that the homepage
 * uses, with the nav sitting inside so it visually connects to the left/right
 * rail borders at every scroll position.
 *
 * Usage:
 *   <PageLayout>
 *     <section className="cb-section">...</section>
 *   </PageLayout>
 */
export default function PageLayout({ children, noFooter = false }) {
  return (
    <div className="funnel">
      <div className="cb-shell">
        <div className="cb-shell-inner" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <ResponsiveNav />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          {!noFooter && <Footer />}
        </div>
      </div>
    </div>
  );
}
