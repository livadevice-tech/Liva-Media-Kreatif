import React from 'react';
import { Package } from 'lucide-react';
import bgHeader from '../../../public/landing-page/bg-header.png';

export const HeroSection = () => {
  return (
    <>
    <div className="w-full px-4 md:px-6 lg:px-8 max-w-[1440px] mx-auto pb-8 pt-4">
      {/* Main Rounded Container */}
      <div 
        className="relative w-full rounded-[32px] md:rounded-[40px] p-8 md:p-12 lg:p-16 overflow-hidden shadow-[0_20px_50px_rgba(124,58,237,0.3)] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgHeader})` }}
      >
        {/* Dark overlay to make the background a bit darker purple */}
        <div className="absolute inset-0 bg-violet-950/40 pointer-events-none"></div>
        
        {/* Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          
          {/* Left Column: Text & CTA */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left mt-8 lg:mt-0">
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-serif font-extrabold tracking-tight leading-[1.05] mb-6 text-white">
              Capek Live Sendiri?<br />Biar Liva Agency Aja Yang Handle!
            </h1>
            <p className="text-violet-100 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-lg">
              Tingkatkan omzet toko Anda di Tiktok, Shopee, & Tokopedia. Kami siapkan Host berpengalaman, Studio, Alat, & Strategi—semua terima beres.
            </p>
            
            {/* Input & Button (Rampay Style) */}
            <div className="flex flex-col sm:flex-row items-center bg-white/10 sm:bg-white backdrop-blur-sm sm:backdrop-blur-none p-1.5 md:p-2 rounded-2xl sm:rounded-full w-full max-w-md shadow-2xl gap-2 sm:gap-0">
              <input 
                type="text" 
                name="whatsapp"
                aria-label="Nomor WhatsApp"
                placeholder="Masukkan nomor WhatsApp" 
                className="flex-1 bg-white sm:bg-transparent px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 text-sm md:text-base w-full rounded-xl sm:rounded-l-full font-medium" 
              />
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex justify-center items-center bg-violet-600 hover:bg-violet-700 text-white rounded-xl sm:rounded-full font-bold text-sm md:text-base px-8 py-4 transition-all whitespace-nowrap shadow-md hover:shadow-lg animate-shine focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none focus-visible:ring-offset-2">
                Go Live Sekarang
              </a>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[650px] flex items-center justify-center mt-8 lg:mt-0 animate-float rounded-3xl">
             <img src="/landing-page/website-new.png" alt="Liva Agency Live Streaming Expert" width="600" height="650" fetchpriority="high" className="w-full h-full object-contain object-bottom md:object-center drop-shadow-2xl md:scale-110 lg:scale-110 hover:scale-105 md:hover:scale-[1.15] lg:hover:scale-[1.15] transition-transform duration-700 origin-bottom md:origin-center" />
          </div>
        </div>

      </div>

      {/* Logos Marquee at Bottom of Hero (Outside purple container) */}
      <div className="relative z-10 mt-12 flex flex-col items-center">
        <p className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest text-center">Telah Dipercaya Oleh Brand Ternama</p>
        <div className="relative flex overflow-hidden w-full max-w-[1200px] [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex w-max animate-marquee pb-4 hover:[animation-play-state:paused]">
               {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-12 md:gap-20 items-center shrink-0 pr-12 md:pr-20 opacity-80 hover:opacity-100 transition-all duration-500">
                     {[
                        'logo-sar-ayu.png', 'logo_uray.png', 'logo_rhc.png', 
                        'logo-barefood.png', 'logo-biokos.png', 'logo-isago.png', 
                        'logo-kloa.png', 'logo-mirael.png', 'logo-soulyu.png', 'logo-sunskrip.png'
                     ].map((filename, idx) => {
                        const brandName = filename.replace(/^logo[-_]/, '').replace('.png', '').replace(/-/g, ' ');
                        const altText = `Logo ${brandName.charAt(0).toUpperCase() + brandName.slice(1)}`;
                        return (
                           <img key={idx} src={`/brand-logo/${filename}`} alt={altText} width="160" height="80" loading="lazy" className="h-12 md:h-16 lg:h-20 w-auto object-contain mix-blend-multiply" />
                        );
                     })}
                  </div>
               ))}
           </div>
        </div>
      </div>
    </div>

    {/* Running Text Banner */}
    <div className="w-full bg-violet-600 py-3 md:py-4 overflow-hidden border-y border-violet-500">
        <div className="flex w-max animate-marquee text-white font-bold tracking-widest text-sm md:text-base uppercase">
          {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-8 md:gap-16 items-center shrink-0 pr-8 md:pr-16 opacity-90">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                <span>READY 24 JAM LIVE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                <span>24 JAM TEKNIKAL SUPPORT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                <span>HOST PROFESIONAL</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                <span>OBS SISTEM</span>
              </div>
          ))}
        </div>
    </div>
    </>
  );
};
