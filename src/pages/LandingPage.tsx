import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { AboutSection } from '../components/landing/AboutSection';
import { PortfolioVideoSection } from '../components/landing/PortfolioVideoSection';
import { USPSection } from '../components/landing/USPSection';
import { ComparisonSection } from '../components/landing/ComparisonSection';
import { PricingSection } from '../components/landing/PricingSection';
import { RoadmapSection } from '../components/landing/RoadmapSection';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <div className="pt-20 lg:pt-24">
        <HeroSection />
      </div>

      <AboutSection />
      
      <PortfolioVideoSection />
      
      <USPSection />
      
      <PricingSection />
      
      <RoadmapSection />
      
      <FAQSection />

      <CTASection />
    </>
  );
}
