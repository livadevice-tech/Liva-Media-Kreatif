import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-a-girl-blowing-a-bubble-gum-at-an-amusement-park-1226-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-taking-a-picture-with-her-smartphone-4081-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-in-a-pool-1259-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-a-laptop-on-her-bed-4034-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-a-rooftop-4171-large.mp4",
];

export const PortfolioVideoSection = () => {
  const [activeIndex, setActiveIndex] = useState(2); // start near middle
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : VIDEOS.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < VIDEOS.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    // Autoplay the centered video and pause the rest
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === activeIndex) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [activeIndex]);

  return (
    <section className="py-10 md:py-16 overflow-hidden bg-white relative">
      <div className="text-center mb-16 px-6">
        <span className="text-orange-500 font-bold text-sm tracking-wider uppercase mb-2 block">
          Behind the Designs
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-slate-900 mb-6 max-w-2xl mx-auto leading-tight">
          Curious What Else We've Created?
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Explore more brand identities, live shopping, and digital design work in our video portfolio.
        </p>
      </div>

      {/* Carousel Wrapper */}
      <div className="w-full relative h-[500px] flex items-center justify-center">
        {VIDEOS.map((src, idx) => {
          const offset = idx - activeIndex;
          const absOffset = Math.abs(offset);
          
          // Determine 3D transform properties based on distance from center (offset)
          const sign = Math.sign(offset);
          const translateX = sign * (absOffset * 180 + (absOffset === 0 ? 0 : 20)); 
          const rotateY = sign * -40; // right items rotate towards center
          const scale = 1 - absOffset * 0.15;
          const zIndex = 100 - absOffset;
          const opacity = absOffset > 2 ? 0 : 1;
          const isCenter = absOffset === 0;

          return (
            <div 
              key={idx} 
              className="absolute shrink-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ 
                width: '260px', 
                transform: `perspective(1000px) translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
                opacity,
                transformOrigin: 'center center',
                pointerEvents: opacity === 0 ? 'none' : 'auto',
                visibility: opacity === 0 ? 'hidden' : 'visible'
              }}
              onClick={() => {
                 if (!isCenter) setActiveIndex(idx);
              }}
            >
              <div 
                className="relative w-full aspect-[9/16] rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] group cursor-pointer bg-slate-100 h-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Dynamic Phone Bezel Overlay */}
                <div 
                  className="phone-bezel absolute inset-0 border-[10px] border-white rounded-[40px] pointer-events-none z-30 transition-opacity duration-500"
                  style={{ opacity: isCenter ? 1 : 0 }}
                >
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full flex items-center justify-center"></div>
                  
                  {/* Text Header */}
                  <div className="absolute top-8 left-0 w-full text-center px-4">
                     <h3 className="text-slate-800 font-bold text-[11px] tracking-tight bg-white/95 backdrop-blur-md py-1.5 rounded-full w-max mx-auto px-4 shadow-sm">
                        Liva Live Streaming
                     </h3>
                  </div>
                  
                  {/* Bottom button */}
                  <div className="absolute bottom-5 left-5 right-5">
                     <div className="w-full py-2.5 bg-white/95 backdrop-blur-md rounded-full text-slate-800 font-bold text-[11px] text-center shadow-sm">
                        Lihat Portfolio
                     </div>
                  </div>
                </div>

                {/* Play Icon Overlay (visible when paused) */}
                <div className={`absolute inset-0 bg-transparent flex items-center justify-center transition-opacity duration-500 z-20 pointer-events-none ${isCenter ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-slate-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                <video 
                  ref={(el) => (videoRefs.current[idx] = el)}
                  src={src}
                  className="w-full h-full object-cover rounded-[40px]"
                  muted
                  loop
                  playsInline
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-12 relative z-50">
         <button onClick={handlePrev} className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 hover:scale-105 transition-all shadow-sm text-slate-600">
            <ChevronLeft className="w-5 h-5" />
         </button>
         <button onClick={handleNext} className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 hover:scale-105 transition-all shadow-sm text-slate-600">
            <ChevronRight className="w-5 h-5" />
         </button>
      </div>
    </section>
  );
};
