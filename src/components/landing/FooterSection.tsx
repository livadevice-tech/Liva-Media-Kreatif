import React from 'react';
import { Video, Instagram, Youtube, Facebook } from 'lucide-react';


export const FooterSection = ({ agencyLogoUrl }: { agencyLogoUrl: string | null }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-16 px-6 md:px-12 font-sans relative">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-violet-900/20 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-8 justify-between relative z-10">
        
        <div className="flex flex-col gap-6 max-w-xs">
           <div className="flex items-center gap-2 text-white mb-2 cursor-pointer" onClick={scrollToTop}>
              {agencyLogoUrl ? (
                 <img src={agencyLogoUrl} className="object-contain h-8 brightness-0 invert max-w-[150px]" alt="Liva Agency Logo" />
              ) : (
                <>
                  <Video className="w-8 h-8 text-violet-500" />
                  <span className="text-2xl font-black tracking-tight">LIVA AGENCY</span>
                </>
              )}
           </div>
           <p className="text-slate-400 text-sm leading-relaxed">
             Agensi Live Shopping terpercaya yang siap membantu bisnis kamu berkembang lewati batas dengan layanan eksekusi live streaming terbaik.
           </p>
           <div className="flex items-center gap-2.5 mt-2">
             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-violet-600 cursor-pointer transition-colors text-white hover:scale-110"><Instagram className="w-4 h-4" /></a>
             <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-violet-600 cursor-pointer transition-colors text-white hover:scale-110"><Youtube className="w-4 h-4" /></a>
             <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-violet-600 cursor-pointer transition-colors text-white hover:scale-110"><Facebook className="w-4 h-4" /></a>
           </div>
           {/* Removed login links */}
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 lg:pl-12">
           <div className="flex flex-col gap-3">
             <h4 className="text-white font-bold text-sm mb-3">Layanan</h4>
             <a href="#layanan" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Host Profesional</a>
             <a href="#layanan" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Studio Live</a>
             <a href="#layanan" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Optimasi Strategi</a>
             <a href="#layanan" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Manajemen Performa</a>
           </div>
           <div className="flex flex-col gap-3">
             <h4 className="text-white font-bold text-sm mb-3">Perusahaan</h4>
             <a href="#tentang" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Tentang Liva Agency</a>
             <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Karir</a>
             <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Hubungi Kami</a>
             <a href="#layanan" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Klien & Portofolio</a>
           </div>
           <div className="flex flex-col gap-3">
             <h4 className="text-white font-bold text-sm mb-3">Bantuan</h4>
             <a href="#faq" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">FAQ</a>
             <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Syarat & Ketentuan</a>
             <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Kebijakan Privasi</a>
           </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-slate-500 font-medium relative z-10">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-slate-500" />
              <span className="font-bold tracking-tight">LIVA AGENCY</span>
           </div>
           <span className="ml-4">All rights reserved • ©{new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
           <a href="#" className="hover:text-slate-300 transition-colors">Privacy policy</a>
           <a href="#" className="hover:text-slate-300 transition-colors">Terms & conditions</a>
        </div>
      </div>
    </footer>
  );
};
