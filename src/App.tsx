import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Video, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import Pages
import LandingPage from './pages/LandingPage';
import BlogIndexPage from './pages/BlogIndexPage';
import BlogDetailPage from './pages/BlogDetailPage';
import CareerPage from './pages/CareerPage';

import { FooterSection } from './components/landing/FooterSection';
import { FooterSection } from './components/landing/FooterSection';

export default function App() {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>('/logo.png');
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

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
               <img src={agencyLogoUrl} className="object-contain h-10 md:h-14 lg:h-16 max-w-[240px]" alt="Liva Agency Logo" />
            ) : (
              <>
                 <Video className="w-8 h-8 text-violet-600" />
                 <span className="text-2xl font-black text-slate-900 tracking-tight">LIVA AGENCY</span>
              </>
            )}
          </div>

          {/* Desktop Menu (Center) */}
          <div className="hidden lg:flex items-center justify-center gap-8">
             <a href="/#tentang" className="text-base lg:text-lg font-normal hover:font-bold text-slate-500 hover:text-violet-600 transition-all">{t('nav.tentang')}</a>
             <a href="/#layanan" className="text-base lg:text-lg font-normal hover:font-bold text-slate-500 hover:text-violet-600 transition-all">{t('nav.layanan')}</a>
             <a href="/#harga" className="text-base lg:text-lg font-normal hover:font-bold text-slate-500 hover:text-violet-600 transition-all">{t('nav.harga')}</a>
             <a href="/#portfolio" className="text-base lg:text-lg font-normal hover:font-bold text-slate-500 hover:text-violet-600 transition-all">{t('nav.portfolio')}</a>
             <Link to="/blog" className="text-base lg:text-lg font-normal hover:font-bold text-slate-500 hover:text-violet-600 transition-all">{t('nav.blog')}</Link>
             <Link to="/karir" className="text-base lg:text-lg font-normal hover:font-bold text-slate-500 hover:text-violet-600 transition-all">{t('nav.karir')}</Link>
             <a href="/#faq" className="text-base lg:text-lg font-normal hover:font-bold text-slate-500 hover:text-violet-600 transition-all">{t('nav.faq')}</a>
          </div>

          {/* Desktop CTA & Lang Selector (Right) */}
          <div className="hidden lg:flex items-center justify-end gap-4">
             {/* Language Selector Desktop */}
             <div className="relative" ref={langDropdownRef}>
               <button 
                 onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                 className="flex items-center gap-1.5 text-base lg:text-lg font-normal text-slate-500 hover:text-violet-600 hover:font-bold transition-all"
               >
                 <Globe className="w-5 h-5" />
                 <span>{i18n.language.toUpperCase()}</span>
                 <ChevronDown className={`w-4 h-4 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
               </button>
               
               {isLangDropdownOpen && (
                 <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                   <button 
                     onClick={() => changeLanguage('id')}
                     className={`w-full text-left px-4 py-3 text-sm transition-colors ${i18n.language === 'id' ? 'bg-violet-50 text-violet-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                   >
                     🇮🇩 Indonesia
                   </button>
                   <button 
                     onClick={() => changeLanguage('en')}
                     className={`w-full text-left px-4 py-3 text-sm transition-colors border-t border-slate-50 ${i18n.language === 'en' ? 'bg-violet-50 text-violet-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                   >
                     🇬🇧 English
                   </button>
                 </div>
               )}
             </div>

             <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="text-base lg:text-lg font-bold text-white bg-violet-600 hover:bg-violet-700 px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg">
                {t('nav.cta')}
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
         <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-24 px-6 flex flex-col gap-6 lg:hidden overflow-y-auto pb-8">
            <a href="/#tentang" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-normal hover:font-bold text-slate-800 py-2 border-b border-slate-100 transition-all">{t('nav.tentang')}</a>
            <a href="/#layanan" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-normal hover:font-bold text-slate-800 py-2 border-b border-slate-100 transition-all">{t('nav.layanan')}</a>
            <a href="/#harga" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-normal hover:font-bold text-slate-800 py-2 border-b border-slate-100 transition-all">{t('nav.harga')}</a>
            <a href="/#portfolio" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-normal hover:font-bold text-slate-800 py-2 border-b border-slate-100 transition-all">{t('nav.portfolio')}</a>
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-normal hover:font-bold text-slate-800 py-2 border-b border-slate-100 transition-all">{t('nav.blog')}</Link>
            <Link to="/karir" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-normal hover:font-bold text-slate-800 py-2 border-b border-slate-100 transition-all">{t('nav.karir')}</Link>
            <a href="/#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-normal hover:font-bold text-slate-800 py-2 border-b border-slate-100 transition-all">{t('nav.faq')}</a>
            
            {/* Mobile Language Selector */}
            <div className="mt-4 pt-4 border-t border-slate-100">
               <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Language</span>
               <div className="flex gap-2">
                 <button 
                   onClick={() => changeLanguage('id')}
                   className={`flex-1 py-3 rounded-lg font-bold border transition-all ${i18n.language === 'id' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                 >
                   🇮🇩 ID
                 </button>
                 <button 
                   onClick={() => changeLanguage('en')}
                   className={`flex-1 py-3 rounded-lg font-bold border transition-all ${i18n.language === 'en' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                 >
                   🇬🇧 EN
                 </button>
               </div>
            </div>
         </div>
      )}

      {/* Pages Content */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/karir" element={<CareerPage />} />
      </Routes>
      
      <FooterSection agencyLogoUrl={agencyLogoUrl} />

    </main>
  )
}
