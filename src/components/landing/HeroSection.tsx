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

          {/* Right Column: Floating Dashboard Cards */}
          <div className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center lg:justify-end lg:pr-10">
            
            {/* Background Card (Total Sales) */}
            <div className="absolute top-0 md:top-4 right-0 lg:-right-4 w-[280px] md:w-[360px] bg-white rounded-3xl p-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border border-slate-100">
              <p className="text-slate-500 font-bold text-xs md:text-sm mb-1 uppercase tracking-wider">Total Penjualan</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 flex items-center gap-2">
                 Rp 45.2M
                 <span className="text-emerald-500 text-[10px] md:text-xs bg-emerald-50 px-2 py-1 rounded-full font-bold">▲ 85.1%</span>
              </h3>
              
              {/* Fake Tabs */}
              <div className="flex gap-2 bg-slate-50 p-1 rounded-xl mb-6">
                 <div className="flex-1 text-center text-xs font-bold bg-white text-slate-800 py-2 rounded-lg shadow-sm border border-slate-100">Harian</div>
                 <div className="flex-1 text-center text-xs font-bold text-slate-500 py-2 rounded-lg">Mingguan</div>
                 <div className="flex-1 text-center text-xs font-bold text-slate-500 py-2 rounded-lg">Bulanan</div>
              </div>
              
              {/* Fake List Items */}
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3 md:gap-4">
                       <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
                          <Package className="w-5 h-5 md:w-6 md:h-6"/>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight mb-0.5">Pesanan Baru</p>
                          <p className="text-[11px] md:text-xs font-medium text-slate-500 leading-tight">Shopee Live</p>
                       </div>
                    </div>
                    <span className="text-emerald-500 font-bold text-sm">+210</span>
                 </div>
                 
                 <div className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3 md:gap-4">
                       <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                          <Package className="w-5 h-5 md:w-6 md:h-6"/>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight mb-0.5">Pesanan Baru</p>
                          <p className="text-[11px] md:text-xs font-medium text-slate-500 leading-tight">Tiktok Shop</p>
                       </div>
                    </div>
                    <span className="text-emerald-500 font-bold text-sm">+184</span>
                 </div>
              </div>
            </div>

            {/* Foreground Card (Live Status) */}
            <div className="absolute bottom-4 lg:bottom-12 left-0 lg:-left-12 w-[260px] md:w-[320px] bg-white rounded-3xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.12)] -rotate-6 hover:-rotate-2 transition-transform duration-500 z-10 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-slate-800 text-sm">Live Status</h4>
                <span className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold border border-rose-100">
                   <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-rose-600 animate-pulse"></div> Sedang Live
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <p className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Penonton</p>
                    <p className="text-xl md:text-2xl font-black text-slate-800">2.4k</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <p className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Checkout</p>
                    <p className="text-xl md:text-2xl font-black text-slate-800">142</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 bg-violet-50 p-2.5 rounded-xl border border-violet-100">
                 <div className="w-8 h-8 rounded-full overflow-hidden bg-violet-200 shrink-0">
                    <img src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80" alt="Host" className="w-full h-full object-cover object-top" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">Kak Aisyah</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">Liva Beauty Official</p>
                 </div>
              </div>
            </div>
            
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
                     <span className="text-lg md:text-xl font-serif tracking-widest font-bold text-emerald-600">SARIAYU</span>
                     <span className="text-xl md:text-2xl font-sans tracking-wide font-black italic text-amber-500">Uray</span>
                     <span className="text-lg md:text-xl font-serif font-bold text-violet-600">Liva</span>
                     <span className="text-lg md:text-xl font-sans font-bold flex items-center text-slate-800"><span className="bg-slate-800 text-white px-1.5 py-0.5 mr-1.5 rounded-sm text-[10px] md:text-xs">R</span> RUDY</span>
                     <span className="text-lg md:text-xl font-black tracking-tighter text-orange-500">Barefood</span>
                     <span className="text-lg md:text-xl font-serif tracking-widest font-bold text-teal-600">BIOKOS</span>
                     <span className="text-lg md:text-xl font-serif font-black leading-none text-rose-600">ISA<br/>GO</span>
                  </div>
               ))}
           </div>
        </div>
      </div>
    </div>
  );
};
