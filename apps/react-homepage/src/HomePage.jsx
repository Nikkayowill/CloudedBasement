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
      <ResponsiveNav />
      {/* ONE .cb container — rail borders run the full page height */}
      <div className="cb">
        <main>
          <HeroSection />
          <ProblemFrame />
          <HowItWorks />
          <Features />
          <WhyChooseUs />
          <NewPricing />
          <FaqSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

