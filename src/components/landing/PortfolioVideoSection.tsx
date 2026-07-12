import React, { useState, useRef } from 'react';
import { Star, Activity, TrendingUp, Headphones, Camera, Video, CheckCircle, Tag } from 'lucide-react';

const VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-a-girl-blowing-a-bubble-gum-at-an-amusement-park-1226-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-taking-a-picture-with-her-smartphone-4081-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-in-a-pool-1259-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-a-laptop-on-her-bed-4034-large.mp4",
];

export const PortfolioVideoSection = () => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleVideoClick = (idx: number) => {
    const vid = videoRefs.current[idx];
    if (vid) {
      if (playingIndex === idx) {
        vid.pause();
        setPlayingIndex(null);
      } else {
        // Pause currently playing if any
        if (playingIndex !== null && videoRefs.current[playingIndex]) {
          videoRefs.current[playingIndex]?.pause();
        }
        vid.play().catch(() => {});
        setPlayingIndex(idx);
      }
    }
  };

  const isPaused = isHovered || playingIndex !== null;

  const renderVideo = (src: string, idx: number) => (
    <div 
      key={idx} 
      className="shrink-0 relative transition-transform duration-300 hover:scale-[1.02]"
      style={{ width: '320px' }}
      onClick={() => handleVideoClick(idx)}
    >
      <div className="relative w-full aspect-[9/16] rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] group cursor-pointer bg-slate-100 h-full">
        {/* Dynamic Phone Bezel Overlay */}
        <div className="phone-bezel absolute inset-0 border-[10px] border-white rounded-[40px] pointer-events-none z-30">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full flex items-center justify-center"></div>
        </div>

        {/* Play Icon Overlay */}
        <div className={`absolute inset-0 bg-black/10 flex items-center justify-center transition-opacity duration-500 z-40 pointer-events-none ${playingIndex === idx ? 'opacity-0' : 'opacity-100'}`}>
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
          preload="metadata"
        />
      </div>
    </div>
  );

  return (
    <>
    <section id="portfolio" className="py-10 md:py-16 overflow-hidden bg-gradient-to-br from-violet-900 via-violet-800 to-violet-950 relative z-10">
      <div className="text-center mb-16 px-6">
        <span className="text-violet-300 font-bold text-sm tracking-wider uppercase mb-2 block">
          Behind the Designs
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-white mb-6 max-w-4xl mx-auto leading-tight">
          Curious What Else We've Created?
        </h2>
        <p className="text-violet-200 max-w-xl mx-auto">
          Explore more brand identities, live shopping, and digital design work in our video portfolio.
        </p>
      </div>

      {/* Continuous Marquee Carousel */}
      <div 
        className="w-full relative py-8 flex items-center overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
         <div 
           className="flex items-center animate-marquee"
           style={{ animationDuration: '45s', animationPlayState: isPaused ? 'paused' : 'running', width: 'max-content' }}
         >
           {/* First Set */}
           <div className="flex gap-8 px-4">
              {VIDEOS.map((src, idx) => renderVideo(src, idx))}
           </div>
           {/* Second Set */}
           <div className="flex gap-8 px-4">
              {VIDEOS.map((src, idx) => renderVideo(src, idx + VIDEOS.length))}
           </div>
         </div>
      </div>
    </section>

      {/* Running Text Marquee */}
      <div className="w-full bg-white py-4 overflow-hidden flex relative z-20 border-b border-slate-100 shadow-sm whitespace-nowrap">
        <div className="flex items-center animate-marquee">
          {/* First set */}
          <div className="flex items-center gap-12 px-6">
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Star className="w-5 h-5"/> Support Creative Decoration</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Activity className="w-5 h-5"/> Dashboard Performance Live</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><TrendingUp className="w-5 h-5"/> Analysis Performance</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Headphones className="w-5 h-5"/> 24 Hours Support</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Camera className="w-5 h-5"/> Equipment Profesional</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Video className="w-5 h-5"/> 4K Camera</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><CheckCircle className="w-5 h-5"/> Ready 24 Hours</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Tag className="w-5 h-5"/> Start 45K</div>
          </div>
          {/* Second set for infinite scroll (duplicated) */}
          <div className="flex items-center gap-12 px-6">
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Star className="w-5 h-5"/> Support Creative Decoration</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Activity className="w-5 h-5"/> Dashboard Performance Live</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><TrendingUp className="w-5 h-5"/> Analysis Performance</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Headphones className="w-5 h-5"/> 24 Hours Support</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Camera className="w-5 h-5"/> Equipment Profesional</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Video className="w-5 h-5"/> 4K Camera</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><CheckCircle className="w-5 h-5"/> Ready 24 Hours</div>
             <div className="flex items-center gap-2 text-violet-600 font-bold"><Tag className="w-5 h-5"/> Start 45K</div>
          </div>
        </div>
      </div>
    </>
  );
};
