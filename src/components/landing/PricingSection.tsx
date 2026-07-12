import React, { useState } from 'react';
import { ArrowRight, User, ChevronLeft, ChevronRight, Package, MessageSquare } from 'lucide-react';

export const PricingSection = () => {
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
    <section id="harga" className="py-12 md:py-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-20">
       {/* Left text content */}
       <div className="w-full lg:w-[55%] xl:w-[60%] shrink-0">
          <div className="font-bold text-violet-600 text-xs tracking-widest uppercase mb-4">INVESTASI TERBAIK</div>
          <h2 className="text-3xl md:text-4xl lg:text-[44px] font-serif font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-6">
             Satu Paket Komplit,<br/>Bebas Pusing
          </h2>
          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed mb-10">
             Hanya dengan satu paket investasi, kamu sudah mendapatkan semua fasilitas terbaik untuk meningkatkan GMV live stream kamu tanpa harus repot memikirkan alat, studio, dan operasional harian.
          </p>
          
          <div className="flex flex-col gap-5">
             <div className="flex items-center gap-4 text-slate-800 font-bold">
                <div className="w-6 h-6 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                   <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span>2 Host Live Profesional Tersertifikasi</span>
             </div>
             <div className="flex items-center gap-4 text-slate-800 font-bold">
                <div className="w-6 h-6 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                   <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span>Live 6 Jam Setiap Hari (Total 26 Hari/Bulan)</span>
             </div>
             <div className="flex items-center gap-4 text-slate-800 font-bold">
                <div className="w-6 h-6 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                   <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span>Custom Studio Set & Advanced OBS</span>
             </div>
             <div className="flex items-center gap-4 text-slate-800 font-bold">
                <div className="w-6 h-6 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                   <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span>Campaign Planner & Report Berkala</span>
             </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
             <div className="flex flex-row gap-6 md:gap-10 items-center">
                <div>
                   <div className="text-slate-500 font-bold mb-1 text-xs md:text-sm uppercase tracking-wide">Paket Reguler</div>
                   <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-black text-slate-900">60K</span>
                      <span className="text-sm font-bold text-slate-500">/Jam</span>
                   </div>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div>
                   <div className="text-violet-600 font-bold mb-1 text-xs md:text-sm uppercase tracking-wide">Paket 24 Jam</div>
                   <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-black text-slate-900">45K</span>
                      <span className="text-sm font-bold text-slate-500">/Jam</span>
                   </div>
                </div>
             </div>
             <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-8 py-4 transition-colors w-full lg:w-auto text-center shrink-0">
                Konsultasi Sekarang
             </button>
          </div>
       </div>
       
       {/* Right visual representation */}
       <div className="w-full lg:w-[45%] xl:w-[40%] bg-violet-100/50 rounded-[40px] relative min-h-[550px] flex items-center justify-center overflow-visible">
          
          <div className="absolute inset-0 overflow-hidden rounded-[40px] z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-200/50 blur-[80px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-200/50 blur-[80px] rounded-full"></div>
          </div>

          {/* Phone Mockup Frame */}
          <div className="relative w-[260px] md:w-[280px] h-[540px] md:h-[580px] bg-slate-900 border-[8px] md:border-[10px] border-slate-900 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500 group">
             {/* Phone Notch */}
             <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-32 md:w-40 mx-auto z-20"></div>
             
             {/* Phone Screen Image (Live Shopping / User) */}
             {phoneImages.map((src, index) => (
               <img 
                 key={index}
                 src={src} 
                 alt={`Live Shopping ${index + 1}`} 
                 className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentPhoneSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
               />
             ))}
             
             {/* Dark Overlay gradient */}
             <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/80 z-10 pointer-events-none"></div>

             {/* UI Elements inside phone like Live Shopping */}
             <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
                <div className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-sm flex items-center gap-1.5 shadow-sm">
                   <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></span> LIVE
                </div>
                <div className="bg-black/40 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-sm flex items-center gap-1.5 backdrop-blur-md">
                   <User className="w-3 h-3 text-white/90" /> 2.4K
                </div>
             </div>
             
             {/* Phone Lower UI (Products & Comment) */}
             <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-3 pointer-events-none">
                {/* Floating Products */}
                <div className="flex gap-2 overflow-hidden px-1">
                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 w-[90px] border border-white/20 shrink-0 shadow-lg relative">
                       <div className="w-full aspect-square bg-white/30 rounded-lg mb-1 overflow-hidden">
                         <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=150" alt="Product" className="w-full h-full object-cover" />
                       </div>
                       <div className="text-[10px] font-black text-white">$12.99</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 w-[90px] border border-white/20 shrink-0 shadow-lg relative">
                       <div className="w-full aspect-square bg-white/30 rounded-lg mb-1 overflow-hidden">
                         <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=150" alt="Product 2" className="w-full h-full object-cover" />
                       </div>
                       <div className="text-[10px] font-black text-white">$45.00</div>
                    </div>
                </div>
                
                {/* Fake Comment Input */}
                <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-full h-10 w-full flex items-center px-4 gap-2">
                   <div className="w-5 h-5 rounded-full bg-white/30"></div>
                   <span className="text-white/70 text-xs font-medium">Komentar...</span>
                </div>
             </div>

             {/* Play Button Overlay */}
             <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noreferrer" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md border-[3px] md:border-[4px] border-white text-white rounded-full flex items-center justify-center z-30 hover:bg-white/40 hover:scale-110 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all cursor-pointer shadow-2xl group-hover:bg-white/30">
                <svg className="w-7 h-7 md:w-8 md:h-8 ml-1 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
             </a>
          </div>

          {/* Carousel Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-6 lg:-left-4 xl:left-4 z-30">
             <button 
               onClick={prevPhoneSlide}
               className="w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center text-violet-600 shadow-xl border border-slate-100 transition-all hover:scale-110"
               aria-label="Previous Slide"
             >
               <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
             </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-6 lg:-right-4 xl:right-4 z-30">
             <button 
               onClick={nextPhoneSlide}
               className="w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center text-violet-600 shadow-xl border border-slate-100 transition-all hover:scale-110"
               aria-label="Next Slide"
             >
               <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
             </button>
          </div>

          {/* Floating Assets around Phone based on Reference Image */}
          <div className="absolute top-16 md:top-24 right-0 lg:-right-10 bg-white rounded-xl p-2 md:p-3 shadow-[0_15px_40px_rgb(0,0,0,0.1)] border border-slate-100 z-20 flex items-center gap-3 animate-float-delayed transform rotate-[-2deg]">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 md:w-5 md:h-5" />
             </div>
             <div className="pr-2">
                <div className="text-[9px] md:text-[10px] font-bold text-slate-400 leading-tight">Total Checkouts</div>
                <div className="text-sm md:text-base font-black text-slate-800 leading-tight mt-0.5">4,500+</div>
             </div>
          </div>

          <div className="absolute bottom-24 md:bottom-32 left-0 lg:-left-12 bg-white rounded-xl p-2 md:p-3 shadow-[0_15px_40px_rgb(0,0,0,0.1)] border border-slate-100 z-20 flex items-center gap-3 animate-float transform rotate-[2deg]">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
             </div>
             <div className="pr-2">
                <div className="text-[9px] md:text-[10px] font-bold text-slate-400 leading-tight">Engagement Rate</div>
                <div className="text-sm md:text-base font-black text-slate-800 leading-tight mt-0.5">12.5%</div>
             </div>
          </div>

       </div>
    </section>
  );
};
