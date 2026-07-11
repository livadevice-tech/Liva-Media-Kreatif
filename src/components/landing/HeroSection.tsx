import React, { useState } from 'react';
import { Radio, ChevronLeft, ChevronRight, User, Package, MessageSquare } from 'lucide-react';
import { CountUp } from './CountUp';

export const HeroSection = () => {
  const [currentPhoneSlide, setCurrentPhoneSlide] = useState(0);

  const phoneImages = [
     "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80",
     "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80",
     "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80"
  ];

  const nextPhoneSlide = () => {
     setCurrentPhoneSlide((prev) => (prev + 1) % phoneImages.length);
  };

  const prevPhoneSlide = () => {
     setCurrentPhoneSlide((prev) => (prev === 0 ? phoneImages.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full overflow-hidden bg-violet-50">
      {/* Smooth Mesh Gradient Background - Simplified and less opaque for cleaner look */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[70%] rounded-full bg-violet-200/20 blur-[120px]"></div>
         <div className="absolute top-[10%] right-[10%] w-[40%] h-[60%] rounded-full bg-violet-200/20 blur-[120px]"></div>
         <div className="absolute bottom-[10%] left-[20%] w-[50%] h-[40%] rounded-full bg-fuchsia-200/10 blur-[120px]"></div>
         
         {/* Concentric Circle Accents (Opacity Rendah) */}
         <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full border border-violet-200/20 -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute top-[20%] left-[10%] w-[700px] h-[700px] rounded-full border border-violet-200/10 -translate-x-1/2 -translate-y-1/2"></div>

         <div className="absolute bottom-[0%] right-[0%] w-[600px] h-[600px] rounded-full border border-violet-200/20 translate-x-1/3 translate-y-1/3"></div>
      </div>

      <section className="relative py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16 z-10">
        <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left z-10">
          <h1 className="text-4xl md:text-[46px] lg:text-[52px] font-extrabold tracking-tight leading-[1.15] mb-6 text-slate-900">
            <span className="text-violet-600 block mb-2">Capek Live Sendiri?</span>
            Biar Liva Agency Aja Yang Handle!
          </h1>
          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-xl">
            Tingkatkan omzet toko Anda di Tiktok, Shopee, & Tokopedia. Kami siapkan Host berpengalaman, Studio, Alat, & Strategi—semua terima beres.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold text-sm shadow-[0_8px_30px_rgb(124,58,237,0.3)] transition-all hover:-translate-y-0.5">
               Go Live Sekarang
               <Radio className="w-4 h-4 animate-pulse" />
            </button>
            <a href="#layanan" className="w-full sm:w-auto flex justify-center items-center px-8 py-3.5 bg-white border border-violet-100 text-violet-600 hover:bg-violet-50 hover:border-violet-200 rounded-full font-bold text-sm transition-all shadow-sm">
               Lihat Paket
            </a>
          </div>
        </div>
        
        {/* Visual Hero Image Area */}
        <div className="flex-1 relative w-full flex justify-center items-center min-h-[400px] md:min-h-[500px] xl:min-h-[600px] mt-10 lg:mt-0">
          <div className="relative w-full h-full flex justify-center items-center scale-[0.85] lg:scale-[0.8] origin-center lg:-ml-12">
            
            {/* Background Purple Blob/Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[450px] aspect-square bg-violet-600 rounded-full z-0"></div>

            {/* Podium bottom */}
            <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-[320px] md:w-[480px] h-[80px] md:h-[120px] bg-violet-800 rounded-[100%] z-0 translate-y-4"></div>
            <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 w-[320px] md:w-[480px] h-[80px] md:h-[120px] bg-violet-600 rounded-[100%] z-0 border-t border-violet-400"></div>
            
            {/* Phone mockup */}
            <div className="relative z-10 w-[240px] md:w-[280px] h-[480px] md:h-[560px] bg-slate-900 rounded-[40px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border-[4px] border-slate-800 mx-auto -rotate-2 hover:rotate-0 transition-transform duration-700 group">
              {/* Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-20 flex justify-between items-center px-2">
                  <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-800 rounded-full border border-gray-700"></div>
              </div>
              
              {/* Phone Screen Inside */}
              <div className="w-full h-full relative rounded-[32px] overflow-hidden bg-slate-800">
                {phoneImages.map((src, index) => (
                  <img 
                    key={index}
                    src={src} 
                    alt={`Livestream ${index + 1}`} 
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentPhoneSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-20 pointer-events-none"></div>
                
                {/* Stream Status Overlay */}
                <div className="absolute top-8 left-3 right-3 z-30">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 flex-1 border border-white/10">
                    <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[8px] text-white font-bold">Liva</div>
                    <div className="flex flex-col flex-1 pl-0.5">
                      <span className="text-white text-[10px] font-bold leading-tight">Liva Beauty</span>
                      <span className="text-white/80 text-[8px] leading-tight">Power Shop</span>
                    </div>
                    <div className="bg-orange-500 rounded-full px-2 py-0.5 text-white text-[9px] font-bold flex items-center gap-1 shadow-sm">
                       + Gabung
                    </div>
                  </div>
                </div>
                
                {/* Bottom Comments */}
                <div className="absolute bottom-16 left-3 pr-3 z-30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-slate-300 border-[1.5px] border-white shrink-0 shadow-sm"></div>
                    <div>
                      <div className="text-[10px] font-bold text-white leading-tight drop-shadow-md">Siti Aisyah <span className="font-normal text-white/90">Cantik banget kak! 😍</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-orange-300 border-[1.5px] border-white shrink-0 shadow-sm"></div>
                    <div>
                      <div className="text-[10px] font-bold text-white leading-tight drop-shadow-md">Dewi Lestari <br/><span className="font-normal text-white/90">Warnanya cakep banget!</span></div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Controls */}
                <div className="absolute bottom-4 left-3 right-3 flex items-center justify-between gap-2 z-30">
                  <div className="flex-1 bg-black/30 backdrop-blur-md border border-white/10 rounded-full px-3 py-2 text-[10px] text-white/70 tracking-wide">
                     Tambahkan komentar...
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <span className="text-white text-[10px]">🙂</span>
                     </div>
                     <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-lg border border-orange-400">
                        <span className="text-white text-[12px]">🎁</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Carousel Controls (Mobile view inside phone mockup) */}
              <div className="absolute top-1/2 -translate-y-1/2 left-1 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={prevPhoneSlide} className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-1 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={nextPhoneSlide} className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Floating UI Elements */}
            <div className="absolute top-10 md:top-16 lg:top-24 right-0 md:-right-8 lg:-right-16 bg-white p-3 md:p-4 rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-slate-100 z-40 flex flex-col gap-1 w-[160px] md:w-[200px] animate-float">
               <div className="flex items-center gap-2 text-[10px] md:text-xs">
                 <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center"><Package className="w-3.5 h-3.5" /></div>
                 <span className="text-slate-500 font-bold">Total Penjualan</span>
               </div>
               <div className="text-lg md:text-xl lg:text-2xl font-black tabular-nums tracking-tight text-slate-800">
                 <CountUp end={98739883} prefix="Rp" isCurrency={true} />
               </div>
               <div className="text-[9px] md:text-[10px] text-slate-400 font-medium">Bulan ini <span className="text-emerald-500 font-bold ml-1"><CountUp end={18.4} prefix="▲ " suffix="%" decimals={1} /></span></div>
            </div>
            
            <div className="absolute bottom-16 md:bottom-24 lg:bottom-32 left-0 md:-left-8 lg:-left-16 bg-white p-3 md:p-4 rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-slate-100 z-40 flex flex-col gap-1 w-[160px] md:w-[200px] animate-float-delayed">
               <div className="flex items-center gap-2 text-[10px] md:text-xs">
                 <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center"><User className="w-3.5 h-3.5" /></div>
                 <span className="text-slate-500 font-bold">Total Viewers</span>
               </div>
               <div className="text-lg md:text-xl lg:text-2xl font-black tabular-nums tracking-tight text-slate-800">
                 <CountUp end={125430} />
               </div>
               <div className="text-[9px] md:text-[10px] text-slate-400 font-medium">Sesi aktif <span className="text-orange-500 font-bold ml-1"><CountUp end={45.8} prefix="▲ " suffix="%" decimals={1} /></span></div>
            </div>

            {/* 3D Asset 1: Message bubble */}
            <div className="absolute top-[45%] left-6 lg:-left-2 z-30 animate-float-fast hover:scale-105 transition-transform cursor-pointer">
              <div className="w-16 h-14 bg-yellow-400 rounded-[20px] flex items-center justify-center shadow-[-5px_10px_15px_rgba(0,0,0,0.15)] border-b-[3px] border-orange-500 -rotate-6 relative">
                 <div className="absolute -bottom-2 left-[14px] w-0 h-0 border-l-[6px] border-l-transparent border-t-[10px] border-t-yellow-400 border-r-[6px] border-r-transparent transform -rotate-12 z-10"></div>
                 <MessageSquare className="w-6 h-6 text-orange-600/80" />
              </div>
            </div>
            
            {/* 3D Asset 2: Floating Heart */}
            <div className="absolute bottom-24 right-0 lg:-right-8 z-30 animate-float">
               <div className="text-4xl drop-shadow-xl hover:scale-110 transition-transform transform rotate-12">❤️</div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
