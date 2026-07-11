import React, { useEffect, useRef } from 'react';

const DUMMY_VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-a-girl-blowing-a-bubble-gum-at-an-amusement-park-1226-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-taking-a-picture-with-her-smartphone-4081-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-in-a-pool-1259-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-a-laptop-on-her-bed-4034-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-a-rooftop-4171-large.mp4",
];

// Duplicate for infinite marquee
const VIDEOS = [...DUMMY_VIDEOS, ...DUMMY_VIDEOS, ...DUMMY_VIDEOS, ...DUMMY_VIDEOS];

export const PortfolioVideoSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let animationFrameId: number;

    const update3DEffect = () => {
      if (!containerRef.current) return;
      
      const windowCenter = window.innerWidth / 2;
      
      itemsRef.current.forEach((item) => {
        if (!item) return;
        
        const rect = item.getBoundingClientRect();
        // Get center of the item
        const itemCenter = rect.left + rect.width / 2;
        
        // Calculate distance from screen center
        const distanceFromCenter = itemCenter - windowCenter;
        
        // Normalize distance (0 at center, 1 at screen edge)
        const normalizedDistance = distanceFromCenter / windowCenter;
        
        // Calculate 3D values based on distance
        // rotateY: items on left rotate right (positive), items on right rotate left (negative)
        const maxRotation = -40; 
        const rotateY = normalizedDistance * maxRotation;
        
        // Scale: items in center are larger (1), items on edge are smaller (0.85)
        const scale = 1 - Math.abs(normalizedDistance) * 0.15;
        
        // Z-index: center items should be on top
        const zIndex = Math.round(100 - Math.abs(normalizedDistance) * 100);

        // Dynamic Phone Bezel Opacity
        const phoneOverlay = item.querySelector('.phone-bezel');
        if (phoneOverlay) {
           // Fully opaque when perfectly centered (normalizedDistance = 0)
           // Fades out completely when it moves slightly away (normalizedDistance > 0.15)
           const opacity = Math.max(0, 1 - Math.abs(normalizedDistance) * 6);
           (phoneOverlay as HTMLElement).style.opacity = opacity.toString();
        }

        item.style.transformOrigin = "center center";
        item.style.transform = `perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`;
        item.style.zIndex = zIndex.toString();
      });

      animationFrameId = requestAnimationFrame(update3DEffect);
    };

    update3DEffect();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.play().catch(() => {}); // Catch error if autoplay is blocked
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.pause();
    video.currentTime = 0;
  };

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

      {/* Marquee Wrapper */}
      <div className="w-full relative py-16" ref={containerRef}>
        <div className="flex w-max animate-marquee-horizontal hover:[animation-play-state:paused] items-center">
          {VIDEOS.map((src, idx) => (
            <div key={idx} className="shrink-0" style={{ width: '240px', margin: '0 -15px' }}>
              <div 
                ref={(el) => (itemsRef.current[idx] = el)}
                className="relative w-full aspect-[9/16] rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300 group cursor-pointer bg-slate-100"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Dynamic Phone Bezel Overlay */}
                <div 
                  className="phone-bezel absolute inset-0 border-[10px] border-white rounded-[40px] pointer-events-none z-30 transition-opacity duration-100"
                  style={{ opacity: 0 }}
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
                <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity z-20 pointer-events-none">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-slate-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                <video 
                  src={src}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 rounded-[40px]"
                  muted
                  loop
                  playsInline
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
