import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import ReportPreview from '../components/landing/ReportPreview';
import WhatWeTest from '../components/landing/WhatWeTest';
import ModelLogos from '../components/landing/ModelLogos';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <Hero />
      <HowItWorks />
      <ReportPreview />
      <WhatWeTest />
      <ModelLogos />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
