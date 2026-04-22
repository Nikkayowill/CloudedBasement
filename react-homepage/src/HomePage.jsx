import ResponsiveNav from './components/ResponsiveNav';
import HeroSection from './sections/HeroSection';
import ProblemFrame from './sections/ProblemFrame';
import HowItWorks from './sections/HowItWorks';
import Features from './sections/Features';
import WhyChooseUs from './sections/WhyChooseUs';
import NewPricing from './sections/NewPricing';
import FaqSection from './sections/FaqSection';
import CTASection from './sections/CTASection';
import Footer from './sections/Footer';
import AnimatedButtons from './components/AnimatedButtons';

/**
 * Purely decorative chess texture accents.
 * Uses real <img> tags so the runtime-served path loads correctly.
 * Primary accent: bottom-right corner, always visible, responsive size.
 * Secondary accent: top-left corner, desktop only (lg+), mirrored.
 * Both are grayscale, blurred, very low opacity — never a focal point.
 */
// z-index:-1 inside an isolation:isolate stacking context sits behind
// ALL section content (even non-positioned) without needing a wrapper div.
function ChessAccent() {
  return (
    <>
      {/* Primary — bottom-right */}
      <img
        src="/Images/chess.png"
        alt=""
        aria-hidden="true"
        draggable="false"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 'clamp(9rem, 28vw, 22rem)',
          height: 'auto',
          aspectRatio: '1 / 1',
          objectFit: 'cover',
          opacity: 0.045,
          filter: 'grayscale(1) blur(1.5px)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: -1,
          maskImage: 'radial-gradient(ellipse 82% 74% at 92% 96%, black 14%, transparent 68%)',
          WebkitMaskImage: 'radial-gradient(ellipse 82% 74% at 92% 96%, black 14%, transparent 68%)',
        }}
      />
      {/* Secondary — top-left, desktop only */}
      <img
        src="/Images/chess.png"
        alt=""
        aria-hidden="true"
        draggable="false"
        className="hidden lg:block"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 'clamp(6rem, 11vw, 11rem)',
          height: 'auto',
          aspectRatio: '1 / 1',
          objectFit: 'cover',
          opacity: 0.028,
          filter: 'grayscale(1) blur(1.5px)',
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'scaleX(-1) rotate(8deg)',
          zIndex: -1,
          maskImage: 'radial-gradient(ellipse 75% 65% at 8% 6%, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 8% 6%, black 10%, transparent 70%)',
        }}
      />
    </>
  );
}

/** Wraps a section with chess accents sitting behind all content via z-index:-1.
 *  position:relative + isolation:isolate are inline-only so they never affect
 *  the generic .cb-section class used by other sections. */
function AccentSection({ children }) {
  return (
    <div className="cb-section" style={{ position: 'relative', isolation: 'isolate' }}>
      <ChessAccent />
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="funnel">
      <div className="cb-shell">
        <div className="cb-shell-inner">
          <ResponsiveNav />
          <main>
            <HeroSection />
            <AccentSection><ProblemFrame /></AccentSection>
            {/* HowItWorks uses position:sticky internally — AccentSection is safe
                because overflow:clip on cb-section does not create a scroll container */}
            <AccentSection><HowItWorks /></AccentSection>
            <AccentSection><Features /></AccentSection>
            <AccentSection><WhyChooseUs /></AccentSection>
            <AccentSection><NewPricing /></AccentSection>
            <AccentSection><FaqSection /></AccentSection>
            <AccentSection><CTASection /></AccentSection>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
