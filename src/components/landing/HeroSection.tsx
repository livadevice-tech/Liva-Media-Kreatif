import React from 'react';
import { Package, Sparkles, Activity, LayoutDashboard, Zap, ShieldCheck } from 'lucide-react';

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
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/20 px-4 py-2 rounded-full mb-8">
               <Sparkles className="w-4 h-4 text-violet-200" />
               <span className="text-violet-100 text-sm font-semibold tracking-wide">Agensi Live Shopping No. 1</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-sans font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
              Sistem luar biasa untuk melesatkan omzet Anda
            </h1>
            <p className="text-violet-100 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-lg">
              Tingkatkan konversi di Tiktok, Shopee, & Tokopedia. Kami siapkan Host, Studio, Alat, & Strategi—semua terima beres.
            </p>
            
            {/* Input & Button (Pill Style) */}
            <div className="flex items-center bg-white p-1.5 md:p-2 rounded-full w-full max-w-md shadow-2xl">
              <input 
                type="text" 
                placeholder="Masukkan nomor WhatsApp" 
                className="flex-1 bg-transparent px-5 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none text-sm md:text-base w-full font-medium" 
              />
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="shrink-0 flex justify-center items-center bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold text-sm md:text-base px-6 md:px-8 py-3.5 transition-all whitespace-nowrap shadow-md hover:shadow-lg">
                Go Live Sekarang
              </a>
            </div>
          </div>

          {/* Right Column: Floating Dashboard Cards */}
          <div className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center lg:justify-end lg:pr-10">
            
            {/* Background Card (Total Sales) */}
            <div className="absolute top-4 right-0 lg:-right-4 w-[280px] md:w-[320px] bg-white rounded-3xl p-6 shadow-2xl hover:-translate-y-2 transition-transform duration-500 border border-slate-100">
              <p className="text-slate-500 font-bold text-xs md:text-sm mb-1">Total Penjualan</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 flex items-center gap-2">
                 Rp 45.2M
                 <span className="text-emerald-500 text-[10px] md:text-xs bg-emerald-50 px-2 py-1 rounded-full font-bold">▲ 85.1%</span>
              </h3>
              
              {/* Fake Graph Line */}
              <div className="w-full h-16 bg-gradient-to-t from-violet-50 to-transparent rounded-b-xl border-b-[3px] border-violet-200 mt-4 relative overflow-hidden">
                 <div className="absolute bottom-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              </div>
            </div>

            {/* Foreground Card (Live Status) */}
            <div className="absolute bottom-12 left-0 lg:left-4 w-[260px] md:w-[300px] bg-white rounded-3xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-transform duration-500 z-10 border border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm mb-6">Aktivitas Live</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-black text-xs">S</div>
                       <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">Shopee Live</p>
                          <p className="text-[10px] font-medium text-slate-500">Hari ini</p>
                       </div>
                    </div>
                    <span className="text-emerald-500 font-bold text-xs">+120 Order</span>
                 </div>
                 
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs">T</div>
                       <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">Tiktok Shop</p>
                          <p className="text-[10px] font-medium text-slate-500">Kemarin</p>
                       </div>
                    </div>
                    <span className="text-emerald-500 font-bold text-xs">+340 Order</span>
                 </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* 4 Features Row at Bottom of Hero */}
        <div className="relative z-10 mt-16 md:mt-24 pt-8 border-t border-white/20">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 px-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-white" />
                 </div>
                 <span className="text-sm font-semibold text-white leading-tight">Analisis<br/>Real-time</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                 </div>
                 <span className="text-sm font-semibold text-white leading-tight">Dashboard<br/>Kustom</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                 </div>
                 <span className="text-sm font-semibold text-white leading-tight">Host<br/>Profesional</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                 </div>
                 <span className="text-sm font-semibold text-white leading-tight">Strategi<br/>Data-Driven</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
