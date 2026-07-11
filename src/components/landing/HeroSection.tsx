import React from 'react';
import { Package } from 'lucide-react';

export const HeroSection = () => {
  return (
    <div className="w-full px-4 md:px-6 lg:px-8 max-w-[1440px] mx-auto pb-8 pt-4">
      {/* Main Rounded Container */}
      <div className="relative w-full rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-800 p-8 md:p-12 lg:p-16 overflow-hidden shadow-[0_20px_50px_rgba(124,58,237,0.3)]">
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

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
                placeholder="Masukkan nomor WhatsApp" 
                className="flex-1 bg-white sm:bg-transparent px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none text-sm md:text-base w-full rounded-xl sm:rounded-l-full font-medium" 
              />
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex justify-center items-center bg-violet-600 hover:bg-violet-700 text-white rounded-xl sm:rounded-full font-bold text-sm md:text-base px-8 py-4 transition-all whitespace-nowrap shadow-md hover:shadow-lg">
                Go Live Sekarang
              </a>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[650px] flex items-center justify-center lg:justify-end lg:pr-4 mt-8 lg:mt-0">
             <img src="/landing-page/website-new.png" alt="Liva Agency Live Streaming" className="w-full h-full object-contain object-bottom lg:object-right-bottom drop-shadow-2xl hover:scale-105 transition-transform duration-700 origin-bottom" />
          </div>
        </div>

      </div>

      {/* Logos Marquee at Bottom of Hero (Outside purple container) */}
      <div className="relative z-10 mt-12 flex flex-col items-center">
        <p className="text-[11px] font-bold text-slate-400 mb-8 uppercase tracking-widest text-center">Telah Dipercaya Oleh Brand Ternama</p>
        <div className="relative flex overflow-hidden w-full max-w-[1200px] [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex w-max animate-marquee pb-4 hover:[animation-play-state:paused]">
               {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-12 md:gap-20 items-center shrink-0 pr-12 md:pr-20 opacity-80 hover:opacity-100 transition-all duration-500">
                     {[
                        'logo-sar-ayu.png', 'logo_uray.png', 'logo_rhc.png', 
                        'logo-barefood.png', 'logo-biokos.png', 'logo-isago.png', 
                        'logo-kloa.png', 'logo-mirael.png', 'logo-soulyu.png', 'logo-sunskrip.png'
                     ].map((filename, idx) => (
                        <img key={idx} src={`/brand-logo/${filename}`} alt="Brand Logo" className="h-12 md:h-16 lg:h-20 w-auto object-contain mix-blend-multiply" />
                     ))}
                  </div>
               ))}
           </div>
        </div>
      </div>
    </div>
  );
};
