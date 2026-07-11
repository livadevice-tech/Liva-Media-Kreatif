import React, { useState, useEffect, useRef } from 'react';
import { Camera, Zap, FileText, BarChart, ShieldCheck } from 'lucide-react';

const uspData = [
  {
    icon: <Camera className="w-5 h-5" />,
    title: "Peralatan Livestream Terbaik",
    desc: "Kamera Sony ZV-E10, lighting Godox, dan set audio condenser professional memastikan tampilan brand Anda super jernih dan setara produksi TV.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80"
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Advanced OBS & Visual Assets",
    desc: "Tidak ada lagi tampilan live yang membosankan. Kami menggunakan OBS dengan floating banner, countdown, dan pop-up interaktif untuk memicu FOMO pembeli.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80"
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Data-Driven Strategy & Report",
    desc: "Kami tidak asal live. Tim kami menganalisis jam tayang terbaik, winning products, dan script yang terbukti meningkatkan GMV, lengkap dengan report harian.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
  },
  {
    icon: <BarChart className="w-5 h-5" />,
    title: "Host Tersertifikasi & Interaktif",
    desc: "Host kami telah melalui pelatihan khusus untuk memastikan penyampaian pesan brand yang tepat sasaran, interaktif, dan mampu memicu closing secara instan.",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80"
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Dukungan Teknis & CS 24/7",
    desc: "Jangan khawatir soal kendala teknis. Tim support kami standby memantau stabilitas koneksi, audio, dan visual dari awal hingga akhir sesi live Anda.",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80"
  }
];

export const USPSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-play logic
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % uspData.length);
    }, 2500); // rotate every 2.5 seconds

    return () => clearInterval(interval);
  }, [isHovered]);

  // Scroll active item into view
  useEffect(() => {
    const activeItem = itemRefs.current[activeIndex];
    if (activeItem && containerRef.current) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeIndex]);

  return (
    <section id="layanan" className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center">
      
      <div className="text-center max-w-3xl mb-16">
         <div className="px-4 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 font-bold text-xs mb-6 inline-block uppercase tracking-wider">
            Kenapa Liva Agency?
         </div>
         <h2 className="text-3xl md:text-4xl lg:text-[44px] font-serif font-extrabold tracking-tight leading-[1.15] mb-6 text-slate-900">
            Lebih Dari Sekadar Host, Kami Siapkan Ekosistem Terbaik
         </h2>
         <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
            Kualitas visual dan audio yang memanjakan mata, digabung dengan interaksi host yang asik adalah kunci konversi tinggi. Liva Agency memfasilitasi semuanya.
         </p>
      </div>

      <div 
         className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
      >
        
        {/* Left Column (Points List) - 65% width */}
        <div 
          ref={containerRef}
          className="lg:w-[65%] flex flex-col w-full max-h-[540px] overflow-y-auto hide-scrollbar pr-4 md:pr-12 py-4 relative"
          style={{ scrollBehavior: 'smooth' }}
        >
          {uspData.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div 
                key={idx}
                ref={(el) => itemRefs.current[idx] = el}
                onClick={() => setActiveIndex(idx)}
                className={`flex flex-col gap-3 py-6 pl-6 cursor-pointer relative transition-all duration-500 border-l-[3px] active:scale-[0.98] ${
                  isActive ? 'border-violet-600' : 'border-slate-200 hover:border-violet-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center rounded-xl w-10 h-10 transition-colors duration-300 shrink-0 ${isActive ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                     {item.icon}
                  </div>
                  <h3 className={`text-lg md:text-xl transition-all duration-300 ${isActive ? 'font-black text-slate-900 font-serif' : 'font-semibold text-slate-400'}`}>
                    {item.title}
                  </h3>
                </div>
                
                {/* Description (Expands when active) */}
                <div className={`grid transition-all duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                   <p className="overflow-hidden text-slate-500 text-sm md:text-[15px] leading-relaxed font-medium">
                     {item.desc}
                   </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (Visual) - 35% width */}
        <div className="lg:w-[35%] w-full flex justify-center items-center">
          {/* Using min-w to force the image to be 30% larger even inside a 35% column */}
          <div className="w-full min-w-[380px] xl:min-w-[480px] aspect-square relative rounded-[40px] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl group transition-all duration-500 hover:scale-[1.02]">
            {uspData.map((item, idx) => (
               <img 
                  key={idx}
                  src={item.image} 
                  alt={item.title} 
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${idx === activeIndex ? 'opacity-100 translate-y-0 scale-100 z-10' : 'opacity-0 translate-y-8 scale-105 z-0'}`}
               />
            ))}
            {/* Subtle gradient overlay to make images look premium */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/10 to-transparent z-20 pointer-events-none"></div>
          </div>
        </div>

      </div>
    </section>
  );
};
