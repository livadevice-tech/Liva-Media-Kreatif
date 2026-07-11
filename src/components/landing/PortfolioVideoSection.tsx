import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-a-girl-blowing-a-bubble-gum-at-an-amusement-park-1226-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-taking-a-picture-with-her-smartphone-4081-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-in-a-pool-1259-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-a-laptop-on-her-bed-4034-large.mp4",
];

export const PortfolioVideoSection = () => {
  const [activeIndex, setActiveIndex] = useState(2); // start near middle
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : VIDEOS.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < VIDEOS.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    // When active index changes, pause all videos and reset playing state
    setPlayingIndex(null);
    videoRefs.current.forEach((vid) => {
      if (vid) {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [activeIndex]);

  const handleVideoClick = (idx: number, isCenter: boolean) => {
    if (!isCenter) {
      setActiveIndex(idx);
    } else {
      const vid = videoRefs.current[idx];
      if (vid) {
        if (playingIndex === idx) {
          vid.pause();
          setPlayingIndex(null);
        } else {
          vid.play().catch(() => {});
          setPlayingIndex(idx);
        }
      }
    }
  };

  return (
    <section className="py-10 md:py-16 overflow-hidden bg-white relative z-10">
      <div className="text-center mb-16 px-6">
        <span className="text-orange-500 font-bold text-sm tracking-wider uppercase mb-2 block">
          Behind the Designs
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
          Curious What Else We've Created?
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Explore more brand identities, live shopping, and digital design work in our video portfolio.
        </p>
      </div>

      {/* Carousel Wrapper */}
      <div className="w-full relative h-[500px] flex items-center justify-center">
        {VIDEOS.map((src, idx) => {
          let rawOffset = (idx - activeIndex) % VIDEOS.length;
          if (rawOffset > 2) rawOffset -= VIDEOS.length;
          if (rawOffset < -2) rawOffset += VIDEOS.length;
          
          const offset = rawOffset;
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
              onClick={() => handleVideoClick(idx, isCenter)}
            >
              <div 
                className="relative w-full aspect-[9/16] rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] group cursor-pointer bg-slate-100 h-full"
              >
                {/* Dynamic Phone Bezel Overlay */}
                <div 
                  className="phone-bezel absolute inset-0 border-[10px] border-white rounded-[40px] pointer-events-none z-30 transition-opacity duration-500"
                  style={{ opacity: isCenter ? 1 : 0 }}
                >
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full flex items-center justify-center"></div>
                </div>

                {/* Play Icon Overlay */}
                <div 
                  className={`absolute inset-0 bg-black/10 flex items-center justify-center transition-opacity duration-500 z-40 pointer-events-none ${
                    playingIndex === idx ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                    <svg className="w-5 h-5 text-slate-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                <video 
                  ref={(el) => (videoRefs.current[idx] = el)}
                  src={src}
                  className="w-full h-full object-cover rounded-[40px]"
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
