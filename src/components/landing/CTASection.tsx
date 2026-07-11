import React from 'react';
import { PlayCircle, MessageCircle, ArrowRight } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="px-6 md:px-12 py-10 max-w-7xl mx-auto">
      <div className="w-full rounded-[40px] bg-gradient-to-br from-violet-500 to-violet-700 p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between overflow-hidden relative shadow-2xl">
        
        {/* Left Content */}
        <div className="lg:w-1/2 relative z-10 text-center lg:text-left mb-12 lg:mb-0">
          <h2 className="text-3xl md:text-5xl lg:text-[44px] font-sans font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Tingkatkan omzet dengan<br/>Liva Agency.
          </h2>
          <p className="text-violet-100 text-base lg:text-lg mb-10 max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
            Liva Agency didesain untuk merevolusi bagaimana bisnis beroperasi, membantu tim bekerja lebih cepat dalam eksekusi live streaming.
          </p>
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white text-slate-900 font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-lg group">
            Konsultasi Gratis
            <div className="bg-slate-900 text-white rounded-full p-1 group-hover:bg-violet-600 transition-colors">
               <ArrowRight className="w-4 h-4" />
            </div>
          </a>
        </div>

        {/* Right Content: Phone Mockup */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end relative z-10 w-full h-[350px] lg:h-auto">
           {/* Phone Frame */}
           <div className="absolute top-0 w-[260px] md:w-[300px] h-[550px] bg-slate-900 rounded-[44px] border-[6px] border-slate-900 shadow-2xl overflow-hidden -translate-y-20 lg:-translate-y-32 group-hover:-translate-y-36 transition-transform duration-700 ease-out">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-xl z-20"></div> {/* Notch */}
              
              <div className="w-full h-full bg-slate-50 flex flex-col relative">
                 {/* App Header */}
                 <div className="flex justify-between items-center px-5 py-6 pb-4 bg-white border-b border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600"><PlayCircle className="w-5 h-5" /></div>
                       <div>
                          <p className="font-bold text-sm text-slate-800">Live Studio</p>
                          <p className="text-[10px] font-bold text-emerald-500">2.4k Menonton</p>
                       </div>
                    </div>
                 </div>
                 
                 {/* Fake Chat */}
                 <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
                    <div className="flex gap-2 items-end">
                       <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0"></div>
                       <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 max-w-[85%]">
                          <p className="text-[11px] font-medium text-slate-700">Produk no 4 bahannya apa kak?</p>
                       </div>
                    </div>
                    <div className="flex gap-2 items-end justify-end">
                       <div className="bg-violet-600 text-white p-3 rounded-2xl rounded-br-none shadow-sm max-w-[85%]">
                          <p className="text-[11px] font-medium">Bahan premium cotton kak, adem! 💜</p>
                       </div>
                    </div>
                    <div className="flex gap-2 items-end">
                       <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0"></div>
                       <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 max-w-[85%]">
                          <p className="text-[11px] font-medium text-slate-700">Udah aku checkout ya min 1 lusin.</p>
                       </div>
                    </div>
                 </div>
                 
                 {/* Input area */}
                 <div className="absolute bottom-0 w-full p-4 bg-white border-t border-slate-100 flex items-center gap-2">
                    <div className="w-full h-10 rounded-full bg-slate-100 px-4 flex items-center">
                       <p className="text-[10px] text-slate-400 font-medium">Ketik pesan...</p>
                    </div>
                    <div className="w-10 h-10 shrink-0 bg-violet-600 rounded-full flex justify-center items-center text-white">
                       <MessageCircle className="w-4 h-4"/>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};
