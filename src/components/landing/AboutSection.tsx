import React, { useState, useEffect } from 'react';
import { ArrowRight, User, ChevronLeft, ChevronRight } from 'lucide-react';

export const AboutSection = () => {
  const [currentPortfolioSlide, setCurrentPortfolioSlide] = useState(0);

  const portfolioData = [
    {
      category: "Brand Beauty",
      colorClass: "bg-violet-600",
      penjualan: "Rp18.882.833",
      penjualanUp: "▲ 46.1%",
      pesanan: "175",
      pesananUp: "▲ 44.6%",
      terjual: "259",
      terjualUp: "▲ 35.6%",
      pembeliBaru: "Rp18.425.005",
    },
    {
      category: "Brand F&B",
      colorClass: "bg-orange-600",
      penjualan: "Rp32.450.000",
      penjualanUp: "▲ 62.4%",
      pesanan: "420",
      pesananUp: "▲ 58.2%",
      terjual: "612",
      terjualUp: "▲ 41.5%",
      pembeliBaru: "Rp21.100.000",
    },
    {
      category: "Brand Fashion",
      colorClass: "bg-fuchsia-600",
      penjualan: "Rp45.200.500",
      penjualanUp: "▲ 85.1%",
      pesanan: "210",
      pesananUp: "▲ 72.8%",
      terjual: "340",
      terjualUp: "▲ 60.3%",
      pembeliBaru: "Rp28.500.000",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPortfolioSlide((prev) => (prev + 1) % portfolioData.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [portfolioData.length]);

  const nextPortfolio = () => {
    setCurrentPortfolioSlide((prev) => (prev + 1) % portfolioData.length);
  };

  const prevPortfolio = () => {
    setCurrentPortfolioSlide((prev) => (prev === 0 ? portfolioData.length - 1 : prev - 1));
  };

  return (
    <>
      {/* 4. TENTANG LIVA AGENCY */}
      <section id="tentang" className="py-10 md:py-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
         <div className="w-full md:w-[45%] lg:w-[40%] shrink-0 relative flex justify-center items-center min-h-[460px] md:min-h-[500px]">
            {/* Background Shape */}
            <div className="w-[260px] md:w-[300px] h-[340px] md:h-[400px] bg-slate-50 rounded-[40px] absolute top-6 left-1/2 -translate-x-1/2 z-0"></div>
            
            {/* Outline Top Right */}
            <div className="absolute top-2 right-6 md:right-12 w-20 h-20 border-t-[3px] border-r-[3px] border-slate-200 rounded-tr-[40px] z-0"></div>

            {/* Main Woman Image */}
            <div className="relative z-10 w-[260px] md:w-[300px] h-[340px] md:h-[400px] overflow-hidden rounded-[40px] flex justify-center items-end mt-6 shadow-xl border-4 border-white">
               <img src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80" alt="Liva Agency Professional Live Streaming Host" width="400" height="600" loading="lazy" className="w-[140%] max-w-none h-full object-cover object-top" style={{marginLeft: '-15%'}} />
            </div>

            {/* Arrow Badge (Top Left) */}
            <div className="absolute top-10 md:top-14 left-8 md:left-6 w-12 h-12 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center shadow-lg border-[4px] border-white z-20 animate-float-delayed">
               <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white transform -rotate-45" />
            </div>

            {/* Audience Badge (Middle Right) */}
            <div className="absolute top-[40%] right-2 md:-right-6 bg-yellow-400 text-black px-4 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-[3px] border-white z-20 animate-float">
               <div className="w-5 h-5 bg-black rounded flex items-center justify-center"><User className="w-3.5 h-3.5 text-white" /></div>
               Audience
            </div>

            {/* Total Revenue Card (Bottom Right) */}
            <div className="absolute bottom-6 md:bottom-10 right-0 md:-right-10 bg-white p-4.5 rounded-[24px] shadow-[0_15px_40px_rgb(0,0,0,0.1)] border border-slate-50 z-20 animate-float-fast w-48 md:w-52">
               <div className="flex justify-between items-start mb-2 px-4 pt-4">
                  <span className="text-[11px] font-bold text-slate-500 tracking-tight">Total Revenue</span>
                  <div className="text-slate-300 text-xs bg-slate-100 rounded-full w-4 h-4 flex justify-center items-center font-bold">?</div>
               </div>
               <div className="flex items-center gap-2 mb-4 px-4">
                  <span className="text-[22px] md:text-2xl font-black text-slate-800 tracking-tight">$64,58k</span>
                  <span className="text-[9px] font-bold text-white bg-black px-2 py-0.5 rounded-full">-14.4%</span>
               </div>
               <div className="flex items-end gap-[6px] h-16 w-full px-4 mb-3">
                  <div className="w-full bg-violet-500 rounded-sm hover:opacity-80 transition-opacity" style={{height: '35%'}}></div>
                  <div className="w-full bg-violet-200 rounded-sm hover:opacity-80 transition-opacity" style={{height: '25%'}}></div>
                  <div className="w-full bg-violet-600 rounded-sm hover:opacity-80 transition-opacity" style={{height: '65%'}}></div>
                  <div className="w-full bg-violet-300 rounded-sm hover:opacity-80 transition-opacity" style={{height: '95%'}}></div>
                  <div className="w-full bg-violet-400 rounded-sm hover:opacity-80 transition-opacity" style={{height: '50%'}}></div>
                  <div className="w-full bg-violet-200 rounded-sm hover:opacity-80 transition-opacity" style={{height: '40%'}}></div>
               </div>
            </div>
         </div>
         
         <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="px-4 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 font-bold text-xs mb-6 inline-block uppercase tracking-wider">
               Tentang Liva Agency
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-serif font-extrabold leading-[1.15] mb-6 text-slate-900">
               Kamu Ngga Perlu Mikirin Optimasi Live Shopping, <span className="text-violet-600">Liva Agency Siap Bantu!</span>
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed text-[16px] max-w-xl font-medium">
               Fokus pada pengembangan produk dan bisnis Anda, biarkan tim profesional Liva Agency yang mengurus seluruh kebutuhan Live Shopping Anda dari persiapan hingga eksekusi dengan hasil yang memuaskan.
            </p>
            <div className={`px-5 py-2 rounded-xl text-white font-bold text-xs tracking-wider uppercase mb-6 shadow-md inline-block w-max transition-colors duration-500 ${portfolioData[currentPortfolioSlide].colorClass}`}>
               {portfolioData[currentPortfolioSlide].category}
            </div>
            
            {/* Mock Data Card */}
            <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative z-10 overflow-hidden">
               <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5 text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wider">Transaksi Brand Kami</span>
               </div>
               <div 
                  className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-[zoomInFade_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
                  key={currentPortfolioSlide}
               >
                  <div className="animate-[slideUpFade_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Penjualan</span>
                       <div className="text-base font-black text-slate-900 mt-1 tabular-nums">{portfolioData[currentPortfolioSlide].penjualan}</div>
                       <div className="text-[10px] text-slate-400 mt-1 font-medium">vs bln lalu <span className="text-emerald-500 font-bold">{portfolioData[currentPortfolioSlide].penjualanUp}</span></div>
                     </div>
                  </div>
                  <div className="animate-[slideUpFade_0.7s_cubic-bezier(0.16,1,0.3,1)_100ms_both]">
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pesanan</span>
                       <div className="text-base font-black text-slate-900 mt-1 tabular-nums">{portfolioData[currentPortfolioSlide].pesanan}</div>
                       <div className="text-[10px] text-slate-400 mt-1 font-medium">vs bln lalu <span className="text-emerald-500 font-bold">{portfolioData[currentPortfolioSlide].pesananUp}</span></div>
                     </div>
                  </div>
                  <div className="animate-[slideUpFade_0.7s_cubic-bezier(0.16,1,0.3,1)_200ms_both]">
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Produk Terjual</span>
                       <div className="text-base font-black text-slate-900 mt-1 tabular-nums">{portfolioData[currentPortfolioSlide].terjual}</div>
                       <div className="text-[10px] text-slate-400 mt-1 font-medium">vs bln lalu <span className="text-emerald-500 font-bold">{portfolioData[currentPortfolioSlide].terjualUp}</span></div>
                     </div>
                  </div>
                  <div className="animate-[slideUpFade_0.7s_cubic-bezier(0.16,1,0.3,1)_300ms_both]">
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-tight">Penjualan Pembeli Baru</span>
                       <div className="text-base font-black text-slate-900 mt-1 tabular-nums">{portfolioData[currentPortfolioSlide].pembeliBaru}</div>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-4 mt-8">
              <button 
                onClick={prevPortfolio}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
                aria-label="Previous portfolio"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                 {portfolioData.map((_, idx) => (
                    <button 
                       key={idx} 
                       onClick={() => setCurrentPortfolioSlide(idx)}
                       className={`h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none ${idx === currentPortfolioSlide ? 'bg-slate-800 w-6' : 'bg-slate-200 w-2 hover:bg-slate-300'}`} 
                       aria-label={`Go to slide ${idx + 1}`}
                    />
                 ))}
              </div>
              <button 
                onClick={nextPortfolio}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
                aria-label="Next portfolio"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
         </div>
      </section>
    </>
  );
};
