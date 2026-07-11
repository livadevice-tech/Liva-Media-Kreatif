import React, { useState, useEffect } from 'react';
import { Video, Menu, X } from 'lucide-react';

// Import Components
import { HeroSection } from './components/landing/HeroSection';
import { AboutSection } from './components/landing/AboutSection';
import { USPSection } from './components/landing/USPSection';
import { ComparisonSection } from './components/landing/ComparisonSection';
import { PricingSection } from './components/landing/PricingSection';
import { RoadmapSection } from './components/landing/RoadmapSection';
import { FAQSection } from './components/landing/FAQSection';
import { FooterSection } from './components/landing/FooterSection';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>(null);

  // Navbar Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <main className="min-h-screen bg-white font-sans text-slate-800 selection:bg-violet-200 selection:text-violet-900 overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm py-4' : 'bg-white py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 lg:grid-cols-3 items-center gap-4">
          
          {/* Logo (Left) */}
          <div className="flex items-center gap-2 cursor-pointer justify-start">
            {agencyLogoUrl ? (
               <img src={agencyLogoUrl} className="object-contain h-8 md:h-10 max-w-[180px]" alt="Liva Agency Logo" />
            ) : (
              <>
                 <Video className="w-8 h-8 text-violet-600" />
                 <span className="text-2xl font-black text-slate-900 tracking-tight">LIVA AGENCY</span>
              </>
            )}
          </div>

          {/* Desktop Menu (Center) */}
          <div className="hidden lg:flex items-center justify-center gap-8">
             <a href="#layanan" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Layanan</a>
             <a href="#tentang" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Tentang</a>
             <a href="#harga" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Harga</a>
             <a href="#faq" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">FAQ</a>
          </div>

          {/* Desktop CTA (Right) */}
          <div className="hidden lg:flex items-center justify-end">
             <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 px-6 py-2.5 rounded-full transition-all shadow-sm">
                Konsultasi Gratis
             </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-slate-600 p-2 justify-self-end"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-24 px-6 flex flex-col gap-6 lg:hidden">
            <a href="#layanan" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-slate-800 py-2 border-b border-slate-100">Layanan</a>
            <a href="#tentang" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-slate-800 py-2 border-b border-slate-100">Tentang</a>
            <a href="#harga" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-slate-800 py-2 border-b border-slate-100">Harga</a>
         </div>
      )}

      {/* Hero Section */}
      <div className="pt-24 lg:pt-32">
        <HeroSection />
      </div>

      <AboutSection />
      
      <USPSection />
      
      <ComparisonSection />
      
      <PricingSection />
      
      <RoadmapSection />
      
      <FAQSection />

      <FooterSection agencyLogoUrl={agencyLogoUrl} />

    </main>
  )
}
