import React from 'react';
import { Video, Instagram, Youtube, Facebook } from 'lucide-react';


export const FooterSection = ({ agencyLogoUrl }: { agencyLogoUrl: string | null }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-slate-800 py-16 px-6 md:px-12 font-sans relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-8 justify-between relative z-10">
        
        {/* Left Column (Logo & Socials) */}
        <div className="flex flex-col gap-6 max-w-xs">
           <div className="flex items-center gap-2 text-slate-900 mb-2 cursor-pointer" onClick={scrollToTop}>
              {agencyLogoUrl ? (
                 <img src={agencyLogoUrl} className="object-contain h-8 md:h-10 max-w-[150px]" alt="Liva Agency Logo" />
              ) : (
                <>
                  <Video className="w-8 h-8 text-violet-600" />
                  <span className="text-2xl font-black tracking-tight">LIVA AGENCY</span>
                </>
              )}
           </div>
           <p className="text-slate-500 text-sm leading-relaxed font-medium">
             Agensi Live Shopping terpercaya yang siap membantu bisnis kamu berkembang lewati batas dengan layanan eksekusi live streaming terbaik.
           </p>
           <div className="flex items-center gap-3 mt-2">
             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-violet-600 hover:text-white cursor-pointer transition-colors text-slate-600"><Instagram className="w-4 h-4" /></a>
             <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-violet-600 hover:text-white cursor-pointer transition-colors text-slate-600"><Youtube className="w-4 h-4" /></a>
             <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-violet-600 hover:text-white cursor-pointer transition-colors text-slate-600"><Facebook className="w-4 h-4" /></a>
           </div>
        </div>
        
        {/* Right Columns (Links) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-12 lg:pl-12 w-full lg:w-auto">
           <div className="flex flex-col gap-4">
             <h4 className="text-slate-900 font-bold text-sm mb-2">Layanan</h4>
             <a href="#layanan" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">Host Profesional</a>
             <a href="#layanan" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">Studio Live</a>
             <a href="#layanan" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">Optimasi Strategi</a>
             <a href="#layanan" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">Manajemen Performa</a>
           </div>
           <div className="flex flex-col gap-4">
             <h4 className="text-slate-900 font-bold text-sm mb-2">Perusahaan</h4>
             <a href="#tentang" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">Tentang Liva</a>
             <a href="#" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">Karir</a>
             <a href="#" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">Hubungi Kami</a>
             <a href="#layanan" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">Klien & Portofolio</a>
           </div>
           <div className="flex flex-col gap-4">
             <h4 className="text-slate-900 font-bold text-sm mb-2">Bantuan</h4>
             <a href="#faq" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">FAQ</a>
             <a href="#" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">Syarat Ketentuan</a>
             <a href="#" className="hover:text-violet-600 transition-colors text-slate-500 font-semibold text-[13px]">Kebijakan Privasi</a>
           </div>
        </div>
      </div>
      
      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-slate-500 font-semibold relative z-10">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-violet-600" />
              <span className="font-bold tracking-tight text-slate-800">LIVA AGENCY</span>
           </div>
           <span className="ml-4">All rights reserved • ©{new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
           <a href="#" className="hover:text-violet-600 transition-colors">Privacy policy</a>
           <a href="#" className="hover:text-violet-600 transition-colors">Terms & conditions</a>
        </div>
      </div>
    </footer>
  );
};
