import React, { useRef, useState } from 'react';
import { Camera, Zap, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export const USPSection = () => {
  const uspSliderRef = useRef<HTMLDivElement>(null);
  const [activeUsp, setActiveUsp] = useState(0);

  const uspData = [
    {
      icon: <Camera className="w-6 h-6 text-orange-500" />,
      title: "Peralatan Livestream Terbaik",
      desc: "Kamera Sony ZV-E10, lighting Godox, dan set audio condenser professional memastikan tampilan brand Anda super jernih dan setara produksi TV.",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80"
    },
    {
      icon: <Zap className="w-6 h-6 text-fuchsia-500" />,
      title: "Advanced OBS & Visual Assets",
      desc: "Tidak ada lagi tampilan live yang membosankan. Kami menggunakan OBS dengan floating banner, countdown, dan pop-up interaktif untuk memicu FOMO pembeli.",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80"
    },
    {
      icon: <FileText className="w-6 h-6 text-violet-500" />,
      title: "Data-Driven Strategy & Report",
      desc: "Kami tidak asal live. Tim kami menganalisis jam tayang terbaik, winning products, dan script yang terbukti meningkatkan GMV, lengkap dengan report harian.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
    }
  ];

  const handleUspScroll = () => {
    if (uspSliderRef.current) {
      const scrollLeft = uspSliderRef.current.scrollLeft;
      const cardWidth = uspSliderRef.current.offsetWidth * 0.85; // approx width of one card
      const newActive = Math.round(scrollLeft / cardWidth);
      if (newActive !== activeUsp && newActive < uspData.length) {
        setActiveUsp(newActive);
      }
    }
  };

  const scrollUspTo = (index: number) => {
    if (uspSliderRef.current) {
      const cardWidth = uspSliderRef.current.offsetWidth * 0.85;
      uspSliderRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setActiveUsp(index);
    }
  };

  return (
    <section id="layanan" className="py-16 md:py-24 px-0 max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col xl:flex-row gap-12 xl:gap-20">
        <div className="w-full xl:w-[45%] shrink-0 pt-10">
          <div className="px-4 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 font-bold text-xs mb-6 inline-block uppercase tracking-wider">
             Kenapa Liva Agency?
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.15] mb-6 text-slate-900">
             Lebih Dari Sekadar Host, Kami Siapkan Ekosistem Terbaik
          </h2>
          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed mb-8">
             Kualitas visual dan audio yang memanjakan mata, digabung dengan interaksi host yang asik adalah kunci konversi tinggi. Liva Agency memfasilitasi semuanya.
          </p>
          
          {/* Desktop Navigation dots for slider */}
          <div className="hidden xl:flex items-center gap-3 mt-8">
             {uspData.map((_, idx) => (
               <button 
                 key={idx}
                 onClick={() => scrollUspTo(idx)}
                 className={`h-2.5 rounded-full transition-all duration-300 ${activeUsp === idx ? 'w-10 bg-violet-600' : 'w-2.5 bg-slate-200 hover:bg-slate-300'}`}
                 aria-label={`Go to slide ${idx + 1}`}
               />
             ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-10 mt-10">
            {[
              "Host Tersertifikasi", 
              "Studio Premium Terlengkap", 
              "Lebih dari 200k+ Review Positif", 
              "Dukungan CS 24/7"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                {text}
              </div>
            ))}
          </div>

          <button className="bg-slate-900 text-white rounded-lg px-6 py-3.5 font-bold text-sm w-max mb-12 hover:bg-slate-800 transition-colors shadow-lg">
            Konsultasi Live 7 Hari
          </button>
          
          <div className="flex flex-wrap gap-4 md:gap-6">
             <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-4 px-6 min-w-[140px] flex-1">
                <div className="text-xl md:text-2xl font-black text-slate-900 mb-1">1.100+</div>
                <div className="text-xs font-semibold text-slate-500">Client partner</div>
             </div>
             <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-4 px-6 min-w-[140px] flex-1">
                <div className="text-xl md:text-2xl font-black text-slate-900 mb-1">200K+</div>
                <div className="text-xs font-semibold text-slate-500">Profesional</div>
             </div>
             <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-4 px-6 min-w-[140px] flex-1">
                <div className="text-xl md:text-2xl font-black text-slate-900 mb-1">300+</div>
                <div className="text-xs font-semibold text-slate-500">Tech Talent</div>
             </div>
          </div>
        </div>

        {/* USP Slider */}
        <div className="w-full xl:flex-1 relative">
           <div 
             ref={uspSliderRef}
             onScroll={handleUspScroll}
             className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-10 pt-4 px-6 md:px-12 xl:px-0 -mx-6 md:-mx-12 xl:mx-0"
           >
              {uspData.map((item, idx) => (
                <div 
                  key={idx} 
                  className="snap-center shrink-0 w-[85%] md:w-[60%] xl:w-[340px] bg-white rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.06)] overflow-hidden group hover:-translate-y-2 transition-all duration-300"
                >
                   <div className="h-[220px] w-full overflow-hidden relative">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/50">
                         {item.icon}
                      </div>
                   </div>
                   <div className="p-8">
                      <h3 className="font-extrabold text-xl text-slate-900 mb-3 leading-snug group-hover:text-violet-600 transition-colors">{item.title}</h3>
                      <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                         {item.desc}
                      </p>
                   </div>
                </div>
              ))}
              
              {/* Spacer for last item to snap correctly */}
              <div className="shrink-0 w-[15%] md:w-[40%] xl:hidden"></div>
           </div>
           
           {/* Mobile Navigation dots */}
           <div className="flex xl:hidden justify-center items-center gap-3 mt-4">
               {uspData.map((_, idx) => (
                 <button 
                   key={idx}
                   onClick={() => scrollUspTo(idx)}
                   className={`h-2 rounded-full transition-all duration-300 ${activeUsp === idx ? 'w-8 bg-violet-600' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
                   aria-label={`Go to slide ${idx + 1}`}
                 />
               ))}
           </div>
        </div>
      </div>
    </section>
  );
};
