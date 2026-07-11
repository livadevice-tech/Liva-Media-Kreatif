import React from 'react';
import { MessageSquare, FileText, Package, Monitor, Video, Radio } from 'lucide-react';

export const RoadmapSection = () => {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1200px] mx-auto flex flex-col items-center">
      <div className="text-center mb-16">
         <h3 className="font-serif font-bold text-sm md:text-base mb-3 text-violet-600 uppercase tracking-widest">Project Roadmap</h3>
         <h2 className="text-3xl md:text-4xl lg:text-[40px] font-serif font-extrabold text-slate-900 leading-[1.15]">Alur Kerja Sama di Liva Agency</h2>
      </div>
      
      {/* Desktop horizontal flow, Mobile vertical flow */}
      <div className="w-full relative">
         {/* Connecting Line (Desktop) */}
         <div className="hidden lg:block absolute top-[45px] left-[5%] right-[5%] h-1 bg-violet-100 rounded-full">
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full opacity-50 border-t border-dashed border-white"></div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4 relative z-10">
            
            {/* Stage 1 */}
            <div className="flex flex-col items-center lg:text-center text-left lg:items-center items-start flex-row lg:flex-col gap-6 lg:gap-4 group">
               <div className="w-24 h-24 lg:w-20 lg:h-20 shrink-0 bg-white border-[6px] border-violet-50 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.06)] flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-300">
                  <MessageSquare className="w-8 h-8 lg:w-7 lg:h-7 text-violet-600" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">1</div>
               </div>
               <div className="pt-2 lg:pt-4 flex-1">
                  <h4 className="text-[15px] font-bold text-slate-800 mb-2 leading-tight">Alignment & KPI</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Diskusi awal untuk memahami kebutuhan dan ekspektasi performa.</p>
               </div>
            </div>

            {/* Stage 2 */}
            <div className="flex flex-col items-center lg:text-center text-left lg:items-center items-start flex-row lg:flex-col gap-6 lg:gap-4 group">
               <div className="w-24 h-24 lg:w-20 lg:h-20 shrink-0 bg-white border-[6px] border-violet-50 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.06)] flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-300">
                  <FileText className="w-8 h-8 lg:w-7 lg:h-7 text-violet-600" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">2</div>
               </div>
               <div className="pt-2 lg:pt-4 flex-1">
                  <h4 className="text-[15px] font-bold text-slate-800 mb-2 leading-tight">PKS Signed</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Penandatanganan Perjanjian Kerja Sama (Maks 2 minggu).</p>
               </div>
            </div>

            {/* Stage 3 */}
            <div className="flex flex-col items-center lg:text-center text-left lg:items-center items-start flex-row lg:flex-col gap-6 lg:gap-4 group">
               <div className="w-24 h-24 lg:w-20 lg:h-20 shrink-0 bg-white border-[6px] border-violet-50 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.06)] flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-300">
                  <Package className="w-8 h-8 lg:w-7 lg:h-7 text-violet-600" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">3</div>
               </div>
               <div className="pt-2 lg:pt-4 flex-1">
                  <h4 className="text-[15px] font-bold text-slate-800 mb-2 leading-tight">Persiapan Produk</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Pengiriman produk demo & serah terima akses akun.</p>
               </div>
            </div>

            {/* Stage 4 */}
            <div className="flex flex-col items-center lg:text-center text-left lg:items-center items-start flex-row lg:flex-col gap-6 lg:gap-4 group">
               <div className="w-24 h-24 lg:w-20 lg:h-20 shrink-0 bg-white border-[6px] border-violet-50 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.06)] flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-300">
                  <Monitor className="w-8 h-8 lg:w-7 lg:h-7 text-violet-600" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">4</div>
               </div>
               <div className="pt-2 lg:pt-4 flex-1">
                  <h4 className="text-[15px] font-bold text-slate-800 mb-2 leading-tight">Host Training</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Training product knowledge & persiapan campaign khusus.</p>
               </div>
            </div>

            {/* Stage 5 */}
            <div className="flex flex-col items-center lg:text-center text-left lg:items-center items-start flex-row lg:flex-col gap-6 lg:gap-4 group">
               <div className="w-24 h-24 lg:w-20 lg:h-20 shrink-0 bg-white border-[6px] border-violet-50 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.06)] flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-300">
                  <Video className="w-8 h-8 lg:w-7 lg:h-7 text-violet-600" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">5</div>
               </div>
               <div className="pt-2 lg:pt-4 flex-1">
                  <h4 className="text-[15px] font-bold text-slate-800 mb-2 leading-tight">Trial Live</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Uji coba koneksi, flow konten, OBS, dan kesiapan host.</p>
               </div>
            </div>

            {/* Stage 6 */}
            <div className="flex flex-col items-center lg:text-center text-left lg:items-center items-start flex-row lg:flex-col gap-6 lg:gap-4 group">
               <div className="w-24 h-24 lg:w-20 lg:h-20 shrink-0 bg-violet-600 border-[6px] border-violet-100 rounded-full shadow-[0_4px_20px_rgb(99,102,241,0.4)] flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-300">
                  <Radio className="w-8 h-8 lg:w-7 lg:h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">6</div>
               </div>
               <div className="pt-2 lg:pt-4 flex-1">
                  <h4 className="text-[15px] font-black text-violet-600 mb-2 leading-tight">GO LIVE</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Livestream resmi berjalan dengan monitoring rutin.</p>
               </div>
            </div>

         </div>
      </div>
    </section>
  );
};
