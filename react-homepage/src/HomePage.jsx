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

export default function HomePage() {
  return (
    <div className="funnel">
      <div className="cb-shell">
        <div className="cb-shell-inner">
          <ResponsiveNav />
          <main>
            <div className="cb-section"><HeroSection /></div>
            <div className="cb-section"><ProblemFrame /></div>
            <div className="cb-section"><HowItWorks /></div>
            <div className="cb-section"><Features /></div>
            <div className="cb-section"><WhyChooseUs /></div>
            <div className="cb-section"><NewPricing /></div>
            <div className="cb-section"><FaqSection /></div>
            <div className="cb-section"><CTASection /></div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
