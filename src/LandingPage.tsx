import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, MessageCircle, Radio, Store, Check, CheckCircle2, 
  FileText, Package, Wrench, CreditCard, Monitor, Youtube, 
  Instagram, Facebook, Linkedin, Video, ChevronLeft, ChevronRight, BarChart2, MessageSquare, ArrowRight, Plus, Minus, User
} from 'lucide-react';

const CountUp = ({ end, duration = 2000, prefix = "", suffix = "", isCurrency = false, decimals = 0 }: { end: number, duration?: number, prefix?: string, suffix?: string, isCurrency?: boolean, decimals?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeProgress = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setCount(end * easeProgress);
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  const formatNumber = (num: number) => {
    if (isCurrency) {
      return Math.floor(num).toLocaleString('id-ID');
    }
    if (decimals > 0) {
      if (num === 0) return (0).toFixed(decimals).replace('.', ',');
      if (num === end) return end.toFixed(decimals).replace('.', ',');
      return num.toFixed(decimals).replace('.', ',');
    }
    return Math.floor(num).toLocaleString('id-ID');
  };

  return <span>{prefix}{formatNumber(count)}{suffix}</span>;
}

export default function LandingPage({ agencyLogoUrl, onEnterApp }: { agencyLogoUrl?: string, onEnterApp?: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPortfolioSlide, setCurrentPortfolioSlide] = useState(0);
  const [currentPhoneSlide, setCurrentPhoneSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const portfolioData = [
    {
      category: "Brand Beauty",
      colorClass: "bg-violet-600",
      penjualan: "Rp18.882.833",
      penjualanUp: "▲ 46.1%",
      pesanan: "175",
      pesananUp: "▲ 44.6%",
      terjual: "259",
      terjualUp: "▲ 35.6%",
      pembeliBaru: "Rp18.425.005",
    },
    {
      category: "Brand F&B",
      colorClass: "bg-orange-600",
      penjualan: "Rp32.450.000",
      penjualanUp: "▲ 62.4%",
      pesanan: "420",
      pesananUp: "▲ 58.2%",
      terjual: "612",
      terjualUp: "▲ 41.5%",
      pembeliBaru: "Rp21.100.000",
    },
    {
      category: "Brand Fashion",
      colorClass: "bg-violet-600",
      penjualan: "Rp45.200.500",
      penjualanUp: "▲ 85.1%",
      pesanan: "210",
      pesananUp: "▲ 72.8%",
      terjual: "340",
      terjualUp: "▲ 60.3%",
      pembeliBaru: "Rp28.500.000",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPortfolioSlide((prev) => (prev + 1) % portfolioData.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [portfolioData.length]);

  const nextPortfolio = () => {
    setCurrentPortfolioSlide((prev) => (prev + 1) % portfolioData.length);
  };

  const prevPortfolio = () => {
    setCurrentPortfolioSlide((prev) => (prev === 0 ? portfolioData.length - 1 : prev - 1));
  };

  const uspCards = [
     {
        id: 1,
        title: "Host Live Profesional",
        desc: "Disiapkan khusus untuk menguasai produk Anda dan berinteraksi secara atraktif dengan audiens.",
        bgColor: "bg-orange-50",
        textColor: "text-slate-800",
        icon: <Video className="w-6 h-6 text-orange-600"/>,
        visual: (
           <div className="w-full flex-1 flex items-center justify-center relative mt-8">
              <div className="w-40 h-40 bg-orange-100 rounded-full flex items-center justify-center relative shadow-[0_0_40px_rgba(255,150,38,0.3)]">
                 <img src="https://ui-avatars.com/api/?name=Syifa+A&background=ffb05c&color=e67f12&size=100" className="w-24 h-24 rounded-full border-4 border-white shadow-xl relative z-10" alt="Host" />
                 <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-black z-20">👍</div>
              </div>
           </div>
        )
     },
     {
        id: 2,
        title: "Insight Secara Real-Time",
        desc: "Dapatkan laporan performa konversi, penjualan, dan metrik audiens langsung di dashboard.",
        bgColor: "bg-orange-500",
        textColor: "text-white",
        icon: <BarChart2 className="w-6 h-6 text-orange-200"/>,
        visual: (
          <div className="w-full flex-1 relative mt-8 flex items-center justify-center">
              <div className="bg-white rounded-[24px] p-5 shadow-2xl w-[90%] max-w-[280px]">
                  <div className="flex justify-between items-center mb-4">
                      <span className="font-black text-slate-800 text-sm">Traffic Live</span>
                      <span className="text-orange-600 font-bold text-xs flex items-center bg-orange-50 px-2 py-1 rounded-md">▲ 42%</span>
                  </div>
                  <div className="flex items-end gap-2 h-24 mt-4">
                      {[40, 60, 30, 80, 50, 90, 70].map((v, i) => (
                          <div key={i} className="flex-1 rounded-t-md bg-orange-400 relative group transition-all duration-300 hover:bg-orange-500" style={{ height: `${v}%`}}>
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">{v}%</div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        )
     },
     {
        id: 3,
        title: "Strategi Berbasis Fakta",
        desc: "Gunakan data objektif untuk membangun strategi marketing yang lebih efektif setiap bulannya.",
        bgColor: "bg-slate-900",
        textColor: "text-white",
        icon: <Radio className="w-6 h-6 text-slate-300"/>,
        visual: (
          <div className="w-full flex-1 relative mt-8 overflow-hidden rounded-[24px]">
             <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80" alt="Strategy" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 w-[85%] border border-slate-700 shadow-xl">
                 <div className="flex gap-3 items-center mb-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
                    <span className="text-white font-bold text-xs leading-snug">Puncak Traffic : 19:00 - 21:00</span>
                 </div>
                 <div className="flex gap-3 items-center">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
                    <span className="text-white font-bold text-xs leading-snug">Produk Laris : Bundling Cantik</span>
                 </div>
             </div>
          </div>
        )
     },
     {
        id: 4,
        title: "Peralatan Kelas Premium",
        desc: "Kualitas gambar jernih 4K dan set audio profesional untuk meyakinkan audiens Anda.",
        bgColor: "bg-violet-50",
        textColor: "text-slate-800",
        icon: <Monitor className="w-6 h-6 text-violet-600"/>,
        visual: (
          <div className="w-full flex-1 flex items-center justify-center mt-8">
             <div className="w-[80%] h-36 bg-white rounded-[24px] shadow-sm border border-violet-100 flex items-center justify-center relative overflow-hidden group">
                <Monitor className="w-16 h-16 text-violet-300 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5}/>
                <div className="absolute bottom-4 right-4 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">4K Ready</div>
             </div>
          </div>
        )
     },
     {
        id: 5,
        title: "Kelola Produk Otomatis",
        desc: "Pin produk dan atur etalase secara presisi sesuai dengan skrip live yang sedang berjalan.",
        bgColor: "bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        textColor: "text-slate-800",
        icon: <Package className="w-6 h-6 text-slate-800"/>,
        visual: (
          <div className="w-full flex-1 flex flex-col gap-3 justify-center mt-8 px-4">
             {[1, 2].map((i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 w-full">
                   <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100 shadow-sm text-[10px]">Img</div>
                   <div className="flex-1">
                      <div className="h-2 w-16 bg-slate-200 rounded-full mb-1.5"></div>
                      <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
                   </div>
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${i === 1 ? 'bg-rose-100 text-rose-600 font-bold' : 'bg-slate-200 text-slate-400'}`}>Pin</div>
                </div>
             ))}
          </div>
        )
     },
     {
        id: 6,
        title: "Mod & Admin Standby",
        desc: "Tim kami akan merespons chat dan mengatur voucher agar Host bisa fokus berinteraksi.",
        bgColor: "bg-slate-50",
        textColor: "text-slate-800",
        icon: <MessageCircle className="w-6 h-6 text-slate-600"/>,
        visual: (
          <div className="w-full flex-1 flex items-center justify-center mt-8 relative">
             <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-3 w-[80%] max-w-[240px]">
                <div className="flex gap-2 items-start">
                   <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0 mt-0.5"></div>
                   <div className="bg-slate-100 rounded-r-xl rounded-bl-xl p-2.5 flex-1">
                      <div className="text-[9px] font-bold text-slate-500 mb-1">User123</div>
                      <div className="text-[10px] text-slate-700">Bisa COD ga kak?</div>
                   </div>
                </div>
                <div className="flex gap-2 items-start justify-end">
                   <div className="bg-orange-500 text-white rounded-l-xl rounded-br-xl p-2.5 flex-1 shadow-sm shadow-orange-500/20">
                      <div className="text-[9px] font-bold text-orange-100 mb-1">Admin</div>
                      <div className="text-[10px]">Bisa banget kak! Lagsung checkout ya 🙏</div>
                   </div>
                   <div className="w-6 h-6 rounded-full bg-orange-400 shrink-0 mt-0.5"></div>
                </div>
             </div>
          </div>
        )
     }
  ];

  const totalSlides = Math.ceil(uspCards.length / 3);

  const nextSlide = () => {
     setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
     setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const phoneImages = [
     "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80",
     "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80",
     "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80"
  ];

  const nextPhoneSlide = () => {
     setCurrentPhoneSlide((prev) => (prev + 1) % phoneImages.length);
  };

  const prevPhoneSlide = () => {
     setCurrentPhoneSlide((prev) => (prev === 0 ? phoneImages.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-violet-200">
      
      {/* 1. NAVBAR */}
      <nav className="w-full bg-white z-50 sticky top-0 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {agencyLogoUrl ? (
              <img src={agencyLogoUrl} className="h-10 w-auto object-contain max-w-[150px] sm:max-w-[180px]" alt="Liva Agency Logo" />
            ) : (
              <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center shadow-md">
                <Video className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-2xl font-black tracking-tight text-slate-900">
              {agencyLogoUrl ? null : 'Liva Agency'}
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8 text-[15px] font-bold text-slate-700">
               <a href="#layanan" className="flex items-center gap-1.5 hover:text-violet-600 transition-colors">
                 Layanan <ChevronDown className="w-4 h-4" />
               </a>
               <a href="#tentang" className="hover:text-violet-600 transition-colors">Tentang Liva Agency</a>
            </div>

            <button className="flex items-center gap-2.5 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold text-sm transition-all shadow-sm">
              Konsultasi Kebutuhan Kamu
              <MessageCircle className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION CONTAINER with Custom Background */}
      <div className="relative w-full overflow-hidden bg-violet-50">
        {/* Smooth Mesh Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           {/* Big blurry violet shapes (low opacity) */}
           <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[80%] rounded-full bg-violet-200/30 blur-[100px]"></div>
           <div className="absolute top-[10%] right-[10%] w-[50%] h-[70%] rounded-full bg-violet-200/30 blur-[120px]"></div>
           <div className="absolute bottom-[10%] left-[20%] w-[60%] h-[50%] rounded-full bg-fuchsia-200/20 blur-[120px]"></div>
           <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[70%] rounded-full bg-violet-200/20 blur-[100px]"></div>
           
           {/* Concentric Circle Accents (Opacity Rendah) */}
           <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full border-[1.5px] border-violet-200/30 -translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute top-[20%] left-[10%] w-[700px] h-[700px] rounded-full border-[1.5px] border-violet-200/20 -translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute top-[20%] left-[10%] w-[900px] h-[900px] rounded-full border-[1.5px] border-violet-200/10 -translate-x-1/2 -translate-y-1/2"></div>

           <div className="absolute bottom-[0%] right-[0%] w-[600px] h-[600px] rounded-full border-[1.5px] border-violet-200/30 translate-x-1/3 translate-y-1/3"></div>
           <div className="absolute bottom-[0%] right-[0%] w-[800px] h-[800px] rounded-full border-[1px] border-violet-200/20 translate-x-1/3 translate-y-1/3"></div>

           {/* Small dot accents */}
           <div className="absolute top-[25%] left-[35%] w-2 h-2 rounded-full bg-violet-300/40"></div>
           <div className="absolute top-[60%] left-[15%] w-2.5 h-2.5 rounded-full bg-violet-300/40"></div>
           <div className="absolute top-[20%] right-[30%] w-2 h-2 rounded-full bg-fuchsia-300/40"></div>
           <div className="absolute bottom-[30%] right-[40%] w-2 h-2 rounded-full bg-violet-300/40"></div>
           <div className="absolute top-[70%] left-[45%] w-1.5 h-1.5 rounded-full bg-violet-400/40"></div>
        </div>

        {/* Hero Section */}
        <section className="relative py-10 md:py-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16 z-10">
        <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left z-10">
          <h1 className="text-4xl md:text-[46px] font-extrabold tracking-tight leading-[1.15] mb-6">
            <span className="text-violet-600">Capek Live Sendiri?</span><br />
            Biar Liva Agency Aja Yang Handle!
          </h1>
          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-xl">
            Tingkatkan omzet toko Anda di Tiktok, Shopee, & Tokopedia. Kami siapkan Host berpengalaman, Studio, Alat, & Strategi—semua terima beres.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold text-sm shadow-lg shadow-violet-600/30 transition-all">
               Go Live Sekarang
               <Radio className="w-4 h-4 animate-pulse" />
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white border border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400 rounded-full font-bold text-sm transition-all shadow-sm">
               Lihat Paket
            </button>
          </div>
        </div>
        
        {/* Visual Hero Image Area */}
        <div className="flex-1 relative w-full flex justify-center items-center min-h-[400px] md:min-h-[500px] xl:min-h-[600px] mt-10 lg:mt-0">
          <div className="relative w-full h-full flex justify-center items-center scale-[0.85] lg:scale-[0.8] origin-center -ml-4 lg:-ml-12">
          
          {/* Background Purple Blob/Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[450px] aspect-square bg-violet-600 rounded-full z-0"></div>

          {/* Podium bottom */}
          <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-[320px] md:w-[480px] h-[80px] md:h-[120px] bg-violet-800 rounded-[100%] z-0 translate-y-4"></div>
          <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 w-[320px] md:w-[480px] h-[80px] md:h-[120px] bg-violet-600 rounded-[100%] z-0 border-t border-violet-400"></div>
          
          {/* Phone mockup */}
          <div className="relative z-10 w-[240px] md:w-[280px] h-[480px] md:h-[560px] bg-slate-900 rounded-[40px] px-2 py-2 shadow-2xl overflow-hidden border-[4px] border-slate-800 mx-auto -rotate-2 hover:rotate-0 transition-transform duration-700">
             {/* Notch */}
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-20 flex justify-between items-center px-2">
                 <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                 <div className="w-1 h-1 bg-slate-800 rounded-full border border-gray-700"></div>
             </div>
             
             {/* Phone Screen Inside */}
             <div className="w-full h-full relative rounded-[32px] overflow-hidden bg-slate-800">
               <img src="https://images.unsplash.com/photo-1616002411355-4a145f459c51?auto=format&fit=crop&q=80" alt="Livestream" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
               
               {/* Stream Status Overlay */}
               <div className="absolute top-8 left-3 right-3">
                 <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 flex-1">
                   <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[8px] text-white font-bold">Soulyu</div>
                   <div className="flex flex-col flex-1 pl-0.5">
                     <span className="text-white text-[10px] font-bold leading-tight">Soulyu Be...</span>
                     <span className="text-white/80 text-[8px] leading-tight">Power Shop</span>
                   </div>
                   <div className="bg-orange-500 rounded-full px-2 py-0.5 text-white text-[9px] font-bold flex items-center gap-1">
                      + Gabung
                   </div>
                 </div>
               </div>
               
               <div className="absolute bottom-16 left-3 pr-3">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="w-7 h-7 rounded-full bg-slate-300 border-[1.5px] border-white shrink-0"></div>
                   <div>
                     <div className="text-[10px] font-bold text-white leading-tight">Siti Aisyah <span className="font-normal text-white/90">Cantik banget kak! 😍</span></div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 mb-2">
                   <div className="w-7 h-7 rounded-full bg-orange-300 border-[1.5px] border-white shrink-0"></div>
                   <div>
                     <div className="text-[10px] font-bold text-white leading-tight">Dewi Lestari <br/><span className="font-normal text-white/90">Warnanya cakep banget!</span></div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-7 h-7 rounded-full bg-violet-300 border-[1.5px] border-white shrink-0"></div>
                   <div>
                     <div className="text-[10px] font-bold text-white leading-tight">Fina Beli <span className="font-normal text-white/90">Bisa free ongkir gak kak?</span></div>
                   </div>
                 </div>
               </div>
               
               {/* Bottom Controls */}
               <div className="absolute bottom-4 left-3 right-3 flex items-center justify-between gap-2">
                 <div className="flex-1 bg-black/30 backdrop-blur-md rounded-full px-3 py-2 text-[10px] text-white/70 tracking-wide">
                    Tambahkan komentar...
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
                       <span className="text-white text-[10px]">🙂</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                       <span className="text-white text-[12px]">🎁</span>
                    </div>
                 </div>
               </div>
               
               {/* Promo Banner Center */}
               <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[85%] bg-gradient-to-r from-violet-800 to-slate-900 rounded-xl overflow-hidden border border-white/20 shadow-xl pb-1">
                   <div className="text-center pt-2 pb-0.5">
                       <div className="text-yellow-400 font-serif font-bold text-2xl tracking-widest leading-none">THR</div>
                       <div className="text-white text-[6px] font-bold tracking-[0.2em] uppercase">Tawanan Hemat Ramadan</div>
                   </div>
                   <div className="flex items-center justify-center -mb-2 mt-1">
                       <div className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded shadow z-10 leading-relaxed uppercase">SPECIAL LAUNCH!</div>
                   </div>
               </div>
             </div>
          </div>
          
          {/* Floating UI Elements */}
          
          {/* GMV Card (Top Right) */}
          <div className="absolute top-10 md:top-16 lg:top-24 right-0 md:-right-8 lg:-right-16 xl:-right-24 bg-white p-3 md:p-4 rounded-xl md:rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border-[3px] border-violet-500 z-40 flex flex-col gap-0.5 md:gap-1 w-[160px] md:w-[200px] lg:w-[220px] animate-float">
             <div className="flex items-center text-[10px] md:text-[12px]">
               <span className="text-slate-600 font-bold">GMV ⓘ</span>
             </div>
             <div className="text-lg md:text-xl lg:text-2xl font-black tabular-nums tracking-tight text-slate-800">
               <CountUp end={98739883} prefix="Rp" isCurrency={true} />
             </div>
             <div className="text-[9px] md:text-[10px] text-slate-400 font-medium">vs Bulan Sebelumnya <span className="text-orange-500 font-bold ml-1"><CountUp end={8.44} prefix="▲ " suffix="%" decimals={2} /></span></div>
          </div>
          
          {/* Add To Cart Card (Bottom Left) */}
          <div className="absolute bottom-16 md:bottom-24 lg:bottom-32 left-0 md:-left-8 lg:-left-16 xl:-left-24 bg-white p-3 md:p-4 rounded-xl md:rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border-[3px] border-violet-500 z-40 flex flex-col gap-0.5 md:gap-1 w-[160px] md:w-[200px] lg:w-[220px] animate-float-delayed">
             <div className="flex items-center text-[10px] md:text-[12px]">
               <span className="text-slate-600 font-bold">Add To Cart ⓘ</span>
             </div>
             <div className="text-lg md:text-xl lg:text-2xl font-black tabular-nums tracking-tight text-slate-800">
               <CountUp end={14582} />
             </div>
             <div className="text-[9px] md:text-[10px] text-slate-400 font-medium">vs Bulan Sebelumnya <span className="text-orange-500 font-bold ml-1"><CountUp end={52.06} prefix="▲ " suffix="%" decimals={2} /></span></div>
          </div>

          {/* Viewers Card (Top Left) */}
          <div className="absolute top-12 md:top-20 lg:top-28 left-0 md:-left-10 lg:-left-20 xl:-left-28 bg-white p-3 md:p-4 rounded-xl md:rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border-[3px] border-violet-500 z-40 flex flex-col gap-0.5 md:gap-1 w-[140px] md:w-[180px] lg:w-[200px] animate-float">
             <div className="flex items-center text-[10px] md:text-[12px]">
               <span className="text-slate-600 font-bold">Viewers ⓘ</span>
             </div>
             <div className="text-lg md:text-xl lg:text-2xl font-black tabular-nums tracking-tight text-slate-800">
               <CountUp end={125430} />
             </div>
             <div className="text-[9px] md:text-[10px] text-slate-400 font-medium">vs Bulan Sebelumnya <span className="text-orange-500 font-bold ml-1"><CountUp end={45.8} prefix="▲ " suffix="%" decimals={1} /></span></div>
          </div>

          {/* 3D Asset 1: Message bubble (Middle Left) */}
          <div className="absolute top-[45%] md:top-[50%] left-10 md:-left-2 lg:-left-6 z-30 animate-float-fast hover:scale-105 transition-transform cursor-pointer">
            <div className="w-20 h-16 bg-yellow-400 rounded-[20px] flex items-center justify-center shadow-[-5px_10px_15px_rgba(0,0,0,0.15)] border-t border-white/40 border-b-4 border-orange-500 -rotate-6 relative">
               {/* Tail */}
               <div className="absolute -bottom-3 left-4 w-0 h-0 border-l-[10px] border-l-transparent border-t-[16px] border-t-orange-500 border-r-[10px] border-r-transparent transform -rotate-12"></div>
               <div className="absolute -bottom-2 left-[18px] w-0 h-0 border-l-[8px] border-l-transparent border-t-[12px] border-t-yellow-400 border-r-[8px] border-r-transparent transform -rotate-12 z-10"></div>
               {/* Lines */}
               <div className="flex flex-col gap-1.5 w-full px-4 mb-1">
                 <div className="h-2 bg-white/90 rounded-full w-full shadow-sm"></div>
                 <div className="h-2 bg-white/90 rounded-full w-3/4 shadow-sm"></div>
                 <div className="h-2 bg-white/90 rounded-full w-1/2 shadow-sm"></div>
               </div>
            </div>
          </div>

          {/* 3D Asset 2: Hearts (top left inner) */}
          <div className="absolute top-16 left-28 md:left-24 z-10 animate-float">
             <div className="relative">
                <span className="text-3xl filter drop-shadow hover:scale-110 transition-transform">💖</span>
             </div>
          </div>

          {/* 3D Asset 3: Shopping basket (middle right) */}
          <div className="absolute top-[48%] right-2 md:-right-8 lg:-right-12 z-30 animate-float-delayed hover:scale-110 transition-transform cursor-pointer">
            <div className="w-16 h-12 md:w-20 md:h-16 bg-orange-500 rounded-lg shadow-[-5px_15px_20px_rgba(0,0,0,0.2)] border-b-4 border-orange-600 border-t border-white/30 transform rotate-12 relative flex items-center justify-center">
               <div className="absolute -top-3 md:-top-4 w-10 md:w-12 h-5 md:h-6 border-[3px] border-orange-500 rounded-t-lg -z-10 shadow-sm border-b-0"></div>
               {/* Basket holes */}
               <div className="flex gap-1 md:gap-1.5 px-2 w-full mt-1.5 md:mt-2">
                 <div className="h-4 md:h-6 w-1.5 md:w-2 bg-orange-600 rounded-full"></div>
                 <div className="h-4 md:h-6 w-1.5 md:w-2 bg-orange-600 rounded-full"></div>
                 <div className="h-4 md:h-6 w-1.5 md:w-2 bg-orange-600 rounded-full"></div>
                 <div className="h-4 md:h-6 w-1.5 md:w-2 bg-orange-600 rounded-full"></div>
               </div>
            </div>
          </div>

          {/* 3D Asset 4: Shopping bag (bottom right) */}
          <div className="absolute bottom-16 lg:bottom-20 right-8 md:right-0 lg:-right-8 z-10 animate-float-fast hover:scale-105 transition-transform cursor-pointer">
             <div className="w-14 h-16 md:w-20 md:h-28 bg-violet-300 rounded-xl shadow-[-8px_15px_15px_rgba(0,0,0,0.2)] border-b-[6px] border-violet-600 border-l-[3px] border-white/20 transform rotate-6 border-r-[4px] border-violet-400 relative">
               <div className="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 w-6 md:w-10 h-5 md:h-8 border-[3px] md:border-[4px] border-violet-300 rounded-t-full -z-10 bg-transparent border-b-0"></div>
             </div>
          </div>
          
          {/* 3D Asset 5: Heart bottom right */}
          <div className="absolute bottom-28 right-0 md:-right-10 lg:-right-16 z-30 animate-float">
             <div className="text-3xl md:text-4xl filter drop-shadow-[-2px_5px_5px_rgba(0,0,0,0.2)] hover:scale-110 transition-transform transform rotate-12">
                 ❤️
             </div>
          </div>
          
          <div className="absolute top-1/3 left-0 z-0 animate-float-delayed">
             <div className="w-10 h-10 bg-yellow-400 rounded-full shadow-lg border-b-[3px] border-orange-500"></div>
          </div>
          </div>
        </div>
      </section>
      </div>

      {/* 3. BRANDS */}
      <section className="py-10 border-t border-slate-100 w-full overflow-hidden flex flex-col items-center">
        <p className="text-center text-sm font-bold text-slate-600 mb-8 z-10 px-6 bg-white shrink-0 shadow-[0_0_20px_20px_white]">Telah di percaya beberapa brand..</p>
        <div className="relative flex overflow-hidden w-full max-w-[1400px] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-marquee pb-4 hover:[animation-play-state:paused]">
               {[1, 2].map((i) => (
                  <div key={i} className="flex gap-16 md:gap-24 items-center shrink-0 pr-16 md:pr-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                     <span className="text-xl md:text-2xl font-serif tracking-widest font-bold text-slate-800">SARIAYU</span>
                     <span className="text-2xl md:text-3xl font-sans tracking-wide font-black italic text-slate-800">Uray</span>
                     <span className="text-xl md:text-2xl font-serif font-bold text-slate-800">Soulyu</span>
                     <span className="text-xl md:text-2xl font-sans font-bold flex items-center text-slate-800"><span className="bg-slate-800 text-white px-1.5 py-0.5 mr-1.5 rounded-sm">R</span> RUDY</span>
                     <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-800">Barefood</span>
                     <span className="text-xl md:text-2xl font-serif tracking-widest font-bold text-slate-800">BIOKOS</span>
                     <span className="text-xl md:text-2xl font-serif font-black leading-none text-slate-800">ISA<br/>GO</span>
                  </div>
               ))}
           </div>
        </div>
      </section>

      {/* 4. TENTANG LIVA AGENCY */}
      <section id="tentang" className="py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
         <div className="w-full md:w-[45%] lg:w-[40%] shrink-0 relative flex justify-center items-center min-h-[460px] md:min-h-[500px]">
            {/* Background Shape */}
            <div className="w-[260px] md:w-[300px] h-[340px] md:h-[400px] bg-slate-100 rounded-[30px] absolute top-6 left-1/2 -translate-x-1/2 z-0"></div>
            
            {/* Outline Top Right */}
            <div className="absolute top-2 right-6 md:right-12 w-20 h-20 border-t-[3px] border-r-[3px] border-slate-200 rounded-tr-[30px] z-0"></div>

            {/* Main Woman Image */}
            <div className="relative z-10 w-[260px] md:w-[300px] h-[340px] md:h-[400px] overflow-hidden rounded-[30px] flex justify-center items-end mt-6">
               <img src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80" alt="Professional Woman" className="w-[140%] max-w-none h-full object-cover object-top" style={{marginLeft: '-15%'}} />
            </div>

            {/* Arrow Badge (Top Left) */}
            <div className="absolute top-10 md:top-14 left-8 md:left-6 w-12 h-12 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center shadow-lg border-[4px] border-white z-20 animate-float-delayed">
               <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white transform -rotate-45" />
            </div>

            {/* Audience Badge (Middle Right) */}
            <div className="absolute top-[40%] right-2 md:-right-6 bg-yellow-400 text-black px-4 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-[3px] border-white z-20 animate-float">
               <div className="w-5 h-5 bg-black rounded flex items-center justify-center"><User className="w-3.5 h-3.5 text-white" /></div>
               Audience
            </div>

            {/* Personalized Strategy Card (Bottom Left) */}
            <div className="absolute bottom-[25%] -left-2 md:-left-8 bg-white p-3.5 rounded-[18px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3 border border-slate-50 z-20 animate-float">
               <div className="grid grid-cols-2 gap-[3px] opacity-30">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-sm"></div>
               </div>
               <span className="font-bold text-[13px] md:text-sm text-slate-800 leading-tight">Personalized<br/>Strategy</span>
            </div>

            {/* +74.6% Badge (Bottom Left, below strategy) */}
            <div className="absolute bottom-[10%] md:bottom-[12%] left-10 md:left-6 bg-black text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-xl border-[3px] border-white z-20 animate-float-delayed">
               +74,6%
            </div>

            {/* Total Revenue Card (Bottom Right) */}
            <div className="absolute bottom-6 md:bottom-10 right-0 md:-right-10 bg-white p-4.5 rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.15)] border border-slate-50 z-20 animate-float-fast w-48 md:w-52">
               <div className="flex justify-between items-start mb-2 px-4 pt-4">
                  <span className="text-[11px] font-bold text-slate-500 tracking-tight">Total Revenue</span>
                  <div className="text-slate-300 text-xs bg-slate-100 rounded-full w-4 h-4 flex justify-center items-center font-bold">?</div>
               </div>
               <div className="flex items-center gap-2 mb-4 px-4">
                  <span className="text-[22px] md:text-2xl font-black text-slate-800 tracking-tight">$64,58k</span>
                  <span className="text-[9px] font-bold text-white bg-black px-2 py-0.5 rounded-full">-14.4%</span>
               </div>
               <div className="flex items-end gap-[6px] h-16 w-full px-4 mb-3">
                  <div className="w-full bg-violet-600 rounded-sm hover:opacity-80 transition-opacity" style={{height: '35%'}}></div>
                  <div className="w-full bg-violet-200 rounded-sm hover:opacity-80 transition-opacity" style={{height: '25%'}}></div>
                  <div className="w-full bg-violet-600 rounded-sm hover:opacity-80 transition-opacity" style={{height: '65%'}}></div>
                  <div className="w-full bg-violet-300 rounded-sm hover:opacity-80 transition-opacity" style={{height: '95%'}}></div>
                  <div className="w-full bg-violet-400 rounded-sm hover:opacity-80 transition-opacity" style={{height: '50%'}}></div>
                  <div className="w-full bg-violet-200 rounded-sm hover:opacity-80 transition-opacity" style={{height: '40%'}}></div>
               </div>
            </div>
         </div>
         
         <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="px-4 py-1.5 rounded-full border border-violet-500 text-violet-600 font-bold text-sm mb-6 inline-block">
               Tentang Liva Agency
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold leading-[1.15] mb-6">
               Kamu Ngga Perlu Mikirin Optimasi Live Shopping <span className="text-violet-600">Liva Agency Siap Bantu!</span>
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-[16px] max-w-xl">
               Fokus pada pengembangan produk dan bisnis Anda, biarkan tim profesional Liva Agency yang mengurus seluruh kebutuhan Live Shopping Anda dari persiapan hingga eksekusi dengan hasil yang memuaskan.
            </p>
            <div className={`px-5 py-2 rounded-lg text-white font-bold text-sm mb-6 shadow-md inline-block w-max transition-colors duration-500 ${portfolioData[currentPortfolioSlide].colorClass}`}>
               {portfolioData[currentPortfolioSlide].category}
            </div>
            
            {/* Mock Data Card */}
            <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 relative z-10 overflow-hidden mt-2">
               <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs">
                  <span className="font-bold text-slate-800">Transaksi</span>
               </div>
               <div 
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 transition-all duration-500 ease-in-out"
                  key={currentPortfolioSlide}
               >
                  <div className="animate-[fadeIn_0.5s_ease-out]">
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-slate-500 font-bold">Penjualan ⓘ</span>
                       <div className="text-sm font-black text-slate-900 mt-1">{portfolioData[currentPortfolioSlide].penjualan}</div>
                       <div className="text-[9px] text-slate-400 mt-1">vs Bulan Sebelumnya <span className="text-green-600 font-bold">{portfolioData[currentPortfolioSlide].penjualanUp}</span></div>
                     </div>
                  </div>
                  <div className="animate-[fadeIn_0.5s_ease-out_100ms_both]">
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-slate-500 font-bold">Pesanan ⓘ</span>
                       <div className="text-sm font-black text-slate-900 mt-1">{portfolioData[currentPortfolioSlide].pesanan}</div>
                       <div className="text-[9px] text-slate-400 mt-1">vs Bulan Sebelumnya <span className="text-green-600 font-bold">{portfolioData[currentPortfolioSlide].pesananUp}</span></div>
                     </div>
                  </div>
                  <div className="animate-[fadeIn_0.5s_ease-out_200ms_both]">
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-slate-500 font-bold">Produk Terjual ⓘ</span>
                       <div className="text-sm font-black text-slate-900 mt-1">{portfolioData[currentPortfolioSlide].terjual}</div>
                       <div className="text-[9px] text-slate-400 mt-1">vs Bulan Sebelumnya <span className="text-green-600 font-bold">{portfolioData[currentPortfolioSlide].terjualUp}</span></div>
                     </div>
                  </div>
                  <div className="animate-[fadeIn_0.5s_ease-out_300ms_both]">
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-slate-500 font-bold flex flex-wrap"><span className="w-full">Penjualan per Pembeli Baru ⓘ</span></span>
                       <div className="text-sm font-black text-slate-900 mt-1">{portfolioData[currentPortfolioSlide].pembeliBaru}</div>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-3 mt-8">
              <button 
                onClick={prevPortfolio}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Previous portfolio"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1.5 px-2">
                 {portfolioData.map((_, idx) => (
                    <button 
                       key={idx} 
                       onClick={() => setCurrentPortfolioSlide(idx)}
                       className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentPortfolioSlide ? 'bg-slate-800 scale-125 w-4' : 'bg-slate-300'}`} 
                    />
                 ))}
              </div>
              <button 
                onClick={nextPortfolio}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Next portfolio"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
         </div>
      </section>

      {/* 5. FITUR (USP SLIDER) */}
      <section id="fitur-usp" className="py-12 md:py-20 px-6 md:px-12 max-w-[1400px] mx-auto overflow-hidden">
        {/* Top Header Area */}
        <div className="flex flex-col items-center text-center mb-16 max-w-3xl mx-auto">
          <div className="text-violet-600 font-bold text-sm mb-3">Bagaimana Liva Agency Bisa Membantu</div>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold mb-4 tracking-tight leading-[1.15]">
            Maksimalkan Live Brand Kamu,<br /> <span className="text-violet-600">Terukur & Effortless</span>
          </h2>
          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
            Pantau traffic, konversi, dan penjualan dalam satu dashboard. Tanpa ribet mengatur host dan studio sendiri.
          </p>
        </div>

        {/* Slider Area */}
        <div className="relative w-full font-sans overflow-hidden">
          <div 
             className="flex transition-transform duration-500 ease-in-out" 
             style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
             {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full shrink-0 flex flex-col md:flex-row gap-6 px-4">
                   {uspCards.slice(slideIndex * 3, slideIndex * 3 + 3).map((card) => (
                      <div key={card.id} className={`flex-1 rounded-[32px] p-6 md:p-8 relative overflow-hidden flex flex-col min-h-[380px] md:min-h-[400px] ${card.bgColor}`}>
                         <div className="relative z-10 flex flex-col h-full">
                            <div className="w-10 h-10 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center mb-5 shadow-sm border border-white/20">
                               {card.icon}
                            </div>
                            <h3 className={`text-xl md:text-2xl font-extrabold mb-3 leading-tight tracking-tight ${card.textColor}`}>{card.title}</h3>
                            <p className={`${card.textColor} opacity-80 text-sm font-medium max-w-sm`}>{card.desc}</p>
                            
                            {card.visual}
                         </div>
                      </div>
                   ))}
                </div>
             ))}
          </div>
        </div>

        {/* Pagination Dots & Navigation */}
        <div className="flex justify-between items-center mt-12 px-4 max-w-7xl mx-auto">
           <div className="flex gap-2 items-center">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                 <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-violet-600' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                 />
              ))}
           </div>
           <div className="flex gap-3">
              <button 
                onClick={prevSlide}
                className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-violet-600 hover:border-violet-100 hover:bg-violet-50 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6"/>
              </button>
              <button 
                onClick={nextSlide}
                className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-violet-600 hover:border-violet-100 hover:bg-violet-50 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6"/>
              </button>
           </div>
        </div>
      </section>

      {/* 6. STATISTIK */}
      <section className="py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left: Image with floating card */}
        <div className="w-full lg:w-[45%] relative">
          <div className="w-full aspect-[4/5] md:aspect-square bg-slate-200 rounded-[32px] overflow-hidden relative shadow-inner">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80" alt="Team working" className="w-full h-full object-cover" />
          </div>
          
          {/* Floating Card */}
          <div className="absolute -bottom-8 md:bottom-8 md:-right-8 bg-white p-5 md:p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 max-w-[260px] z-20">
            <div className="font-bold text-slate-800 text-sm mb-2">Dipercaya 1.100+ Partner</div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">Bergabung dengan ++ bisnis lainnya yang telah mempercayakan Liva Agency</p>
            <div className="flex items-center justify-between">
               <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="user" className="w-full h-full object-cover" /></div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden"><img src="https://i.pravatar.cc/100?img=2" alt="user" className="w-full h-full object-cover" /></div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden"><img src="https://i.pravatar.cc/100?img=3" alt="user" className="w-full h-full object-cover" /></div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden"><img src="https://i.pravatar.cc/100?img=4" alt="user" className="w-full h-full object-cover" /></div>
               </div>
               <div className="flex flex-col items-end">
                  <div className="flex text-yellow-400 gap-0.5">
                     <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                     <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                     <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                     <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                     <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-1">1.4k+ Reviews</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="w-full lg:w-[55%] flex flex-col md:pl-8 mt-12 lg:mt-0">
          <div className="w-max bg-orange-50 text-orange-600 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-2 mb-6">
             <span className="w-2 h-2 rounded-full bg-orange-500"></span>
             Statistik Liva Agency
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold mb-5 max-w-lg leading-[1.2] text-slate-900 tracking-tight">
            Dari output yang premium bisa kita <span className="text-slate-700">bantu generate GMV live</span>
          </h2>
          
          <p className="text-slate-500 text-sm md:text-base mb-8 max-w-lg leading-relaxed">
            Tingkatkan omzet toko Anda di Tiktok, Shopee, & Tokopedia. Kami siapkan Host berpengalaman, Studio, Alat, & Strategi—semua terima beres.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-10">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
               <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                 <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
               </div>
               Host Tersertifikasi
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
               <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                 <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
               </div>
               Studio Premium Terlengkap
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
               <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                 <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
               </div>
               Lebih dari 200k+ Review Positif
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
               <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                 <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
               </div>
               Dukungan CS 24/7
            </div>
          </div>

          <button className="bg-slate-900 text-white rounded-lg px-6 py-3.5 font-bold text-sm w-max mb-12 hover:bg-slate-800 transition-colors">
            Konsultasi Live 7 Hari
          </button>
          
          <div className="flex flex-wrap gap-4 md:gap-6">
             <div className="bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-xl py-4 px-6 min-w-[140px] flex-1">
                <div className="text-xl md:text-2xl font-black text-slate-900 mb-1">1.100+</div>
                <div className="text-xs font-semibold text-slate-500">Client partner</div>
             </div>
             <div className="bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-xl py-4 px-6 min-w-[140px] flex-1">
                <div className="text-xl md:text-2xl font-black text-slate-900 mb-1">200K+</div>
                <div className="text-xs font-semibold text-slate-500">Profesional</div>
             </div>
             <div className="bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-xl py-4 px-6 min-w-[140px] flex-1">
                <div className="text-xl md:text-2xl font-black text-slate-900 mb-1">300+</div>
                <div className="text-xs font-semibold text-slate-500">Tech Talent</div>
             </div>
          </div>
        </div>
      </section>

      {/* 6.5. COMPARISON SECTION */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-slate-50 border-t border-slate-100 flex flex-col items-center">
         <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.15] mb-6 text-slate-900">
               Kenapa Pilih Liva Agency?
            </h2>
            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
               Karena yang terlihat hemat, sering kali justru menjadi paling mahal. Bandingkan sendiri keuntungan menggunakan Liva Agency dibandingkan in-house atau agency lain.
            </p>
         </div>

         <div className="w-full max-w-6xl overflow-x-auto hide-scrollbar pb-8 px-2 md:px-0">
            <div className="min-w-[900px] w-full bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
               
               {/* Table Header */}
               <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr] bg-white border-b border-slate-100 p-6 items-center">
                  <div className="font-extrabold text-slate-400 text-sm tracking-widest uppercase pl-4">Fitur & Layanan</div>
                  <div className="font-bold text-slate-800 text-center px-4 flex flex-col items-center">
                     <span className="text-lg">Bangun Sendiri</span>
                     <span className="text-xs font-semibold text-slate-400">(In-House)</span>
                  </div>
                  <div className="font-bold text-slate-800 text-center px-4 flex flex-col items-center">
                     <span className="text-lg">Agency Lain</span>
                  </div>
                  <div className="font-black text-violet-700 text-center px-6 py-4 bg-violet-50 rounded-2xl flex flex-col items-center shadow-inner border border-violet-100/50">
                     <span className="text-2xl mb-0.5">Liva Agency</span>
                     <span className="text-xs font-bold text-violet-500">(Growth Partner)</span>
                  </div>
               </div>
               
               {/* Table Body */}
               <div className="flex flex-col">
                  {[
                     {
                       feature: "Biaya & Investasi",
                       inhouse: "Investasi awal besar (studio, alat, tim)",
                       agency: "Mulai Rp 14.500.000 (Belum termasuk Add-ons)",
                       liva: "Rp 10.000.000 (All-in & Tanpa investasi awal)",
                     },
                     {
                       feature: "Durasi Live",
                       inhouse: "Terbatas jam operasional internal",
                       agency: "3 Jam / Hari",
                       liva: "6 Jam / Hari (Bisa optimize banyak slot)",
                     },
                     {
                       feature: "Masa Kontrak",
                       inhouse: "Komitmen rekrutmen jangka panjang",
                       agency: "Minimal 6-12 bulan",
                       liva: "Fleksibel (1-12 bulan)",
                     },
                     {
                       feature: "Creative Support & OBS",
                       inhouse: "Trial & error, setup sendiri dari nol",
                       agency: "Add-on berbayar (Rp 2,5 - 5 Juta++)",
                       liva: "Sudah sepenuhnya Include",
                     },
                     {
                       feature: "Kesiapan Tim & Host",
                       inhouse: "Rekrut & training mandiri dari nol",
                       agency: "Umumnya pasif / Terbatas di jam kerja",
                       liva: "Host siap live, Aktif & responsif",
                     },
                     {
                       feature: "Operasional & Fokus Bisnis",
                       inhouse: "Operasional kompleks & fokus terpecah",
                       agency: "Biaya lebih tinggi, operasional kaku",
                       liva: "Cost lebih rendah, berdayakan talenta pro lokal",
                     }
                  ].map((item, i, arr) => (
                    <div key={i} className={`grid grid-cols-[1.5fr_1fr_1fr_1.5fr] px-6 py-6 items-center hover:bg-slate-50/50 transition-colors group ${i !== arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
                       <div className="font-bold text-slate-800 text-[15px] pl-4">{item.feature}</div>
                       <div className="text-slate-500 text-sm font-medium text-center px-4 leading-relaxed">{item.inhouse}</div>
                       <div className="text-slate-500 text-sm font-medium text-center px-4 leading-relaxed">{item.agency}</div>
                       <div className="font-bold text-violet-700 text-[15px] text-center px-6 py-3 bg-violet-50/40 rounded-xl transition-colors mx-2 leading-relaxed border border-transparent group-hover:border-violet-100/50 group-hover:bg-violet-50/80">{item.liva}</div>
                    </div>
                  ))}
               </div>
               
            </div>
         </div>
      </section>

      {/* 7. PRICING (SINGLE PACKAGE) */}
      <section className="py-16 md:py-28 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
         {/* Left text content */}
         <div className="w-full lg:w-[55%] xl:w-[60%] shrink-0">
            <div className="font-bold text-violet-600 text-xs tracking-widest uppercase mb-4">INVESTASI TERBAIK</div>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-6">
               Satu Paket Komplit,<br/>Bebas Pusing
            </h2>
            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed mb-10">
               Hanya dengan satu paket investasi, kamu sudah mendapatkan semua fasilitas terbaik untuk meningkatkan GMV live stream kamu tanpa harus repot memikirkan alat, studio, dan operasional harian.
            </p>
            
            <div className="flex flex-col gap-5">
               <div className="flex items-center gap-4 text-slate-800 font-bold">
                  <div className="w-6 h-6 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                     <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span>2 Host Live Profesional Tersertifikasi</span>
               </div>
               <div className="flex items-center gap-4 text-slate-800 font-bold">
                  <div className="w-6 h-6 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                     <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Live 6 Jam Setiap Hari (Total 26 Hari/Bulan)</span>
               </div>
               <div className="flex items-center gap-4 text-slate-800 font-bold">
                  <div className="w-6 h-6 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                     <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Custom Studio Set & Advanced OBS</span>
               </div>
               <div className="flex items-center gap-4 text-slate-800 font-bold">
                  <div className="w-6 h-6 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                     <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Campaign Planner & Report Berkala</span>
               </div>
            </div>
            
            <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col sm:flex-row sm:items-end gap-6">
               <div>
                  <div className="text-slate-400 text-sm line-through font-bold mb-1">Rp 14.000.000 / bulan</div>
                  <div className="flex items-baseline gap-1">
                     <span className="text-4xl md:text-5xl font-black text-slate-900">Rp 10</span>
                     <span className="text-lg font-bold text-slate-500">Jt /bln</span>
                  </div>
               </div>
               <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-8 py-4 transition-colors">
                  Konsultasi Sekarang
               </button>
            </div>
         </div>
         
         {/* Right visual representation */}
         <div className="w-full lg:w-[45%] xl:w-[40%] bg-violet-100/50 rounded-[40px] relative min-h-[550px] flex items-center justify-center overflow-visible">
            
            <div className="absolute inset-0 overflow-hidden rounded-[40px] z-0 pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-200/50 blur-[80px] rounded-full"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-200/50 blur-[80px] rounded-full"></div>
            </div>

            {/* Phone Mockup Frame */}
            <div className="relative w-[260px] md:w-[280px] h-[540px] md:h-[580px] bg-slate-900 border-[8px] md:border-[10px] border-slate-900 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500 group">
               {/* Phone Notch */}
               <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-32 md:w-40 mx-auto z-20"></div>
               
               {/* Phone Screen Image (Live Shopping / User) */}
               {phoneImages.map((src, index) => (
                 <img 
                   key={index}
                   src={src} 
                   alt={`Live Shopping ${index + 1}`} 
                   className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentPhoneSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
                 />
               ))}
               
               {/* Dark Overlay gradient */}
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/80 z-10 pointer-events-none"></div>

               {/* UI Elements inside phone like Live Shopping */}
               <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
                  <div className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-sm flex items-center gap-1.5 shadow-sm">
                     <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></span> LIVE
                  </div>
                  <div className="bg-black/40 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-sm flex items-center gap-1.5 backdrop-blur-md">
                     <User className="w-3 h-3 text-white/90" /> 2.4K
                  </div>
               </div>
               
               {/* Phone Lower UI (Products & Comment) */}
               <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-3 pointer-events-none">
                  {/* Floating Products */}
                  <div className="flex gap-2 overflow-hidden px-1">
                      <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 w-[90px] border border-white/20 shrink-0 shadow-lg relative">
                         <div className="w-full aspect-square bg-white/30 rounded-lg mb-1 overflow-hidden">
                           <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=150" alt="Product" className="w-full h-full object-cover" />
                         </div>
                         <div className="text-[10px] font-black text-white">$12.99</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 w-[90px] border border-white/20 shrink-0 shadow-lg relative">
                         <div className="w-full aspect-square bg-white/30 rounded-lg mb-1 overflow-hidden">
                           <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=150" alt="Product 2" className="w-full h-full object-cover" />
                         </div>
                         <div className="text-[10px] font-black text-white">$45.00</div>
                      </div>
                  </div>
                  
                  {/* Fake Comment Input */}
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-full h-10 w-full flex items-center px-4 gap-2">
                     <div className="w-5 h-5 rounded-full bg-white/30"></div>
                     <span className="text-white/70 text-xs font-medium">Komentar...</span>
                  </div>
               </div>

               {/* Play Button Overlay */}
               <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noreferrer" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md border-[3px] md:border-[4px] border-white text-white rounded-full flex items-center justify-center z-30 hover:bg-white/40 hover:scale-110 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all cursor-pointer shadow-2xl group-hover:bg-white/30">
                  <svg className="w-7 h-7 md:w-8 md:h-8 ml-1 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
               </a>
            </div>

            {/* Carousel Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-6 lg:-left-4 xl:left-4 z-30">
               <button 
                 onClick={prevPhoneSlide}
                 className="w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center text-violet-600 shadow-xl border border-slate-100 transition-all hover:scale-110"
                 aria-label="Previous Slide"
               >
                 <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
               </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-6 lg:-right-4 xl:right-4 z-30">
               <button 
                 onClick={nextPhoneSlide}
                 className="w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center text-violet-600 shadow-xl border border-slate-100 transition-all hover:scale-110"
                 aria-label="Next Slide"
               >
                 <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
               </button>
            </div>

            {/* Floating Assets around Phone based on Reference Image */}
            <div className="absolute top-16 md:top-24 right-0 lg:-right-10 bg-white rounded-xl p-2 md:p-3 shadow-[0_15px_40px_rgb(0,0,0,0.1)] border border-slate-100 z-20 flex items-center gap-3 animate-float-delayed transform rotate-[-2deg]">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 md:w-5 md:h-5" />
               </div>
               <div className="pr-2">
                  <div className="text-[9px] md:text-[10px] font-bold text-slate-400 leading-tight">Total Checkouts</div>
                  <div className="text-sm md:text-base font-black text-slate-800 leading-tight mt-0.5">4,500+</div>
               </div>
            </div>

            <div className="absolute bottom-24 md:bottom-32 left-0 lg:-left-12 bg-white rounded-xl p-2 md:p-3 shadow-[0_15px_40px_rgb(0,0,0,0.1)] border border-slate-100 z-20 flex items-center gap-3 animate-float transform rotate-[2deg]">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
               </div>
               <div className="pr-2">
                  <div className="text-[9px] md:text-[10px] font-bold text-slate-400 leading-tight">Engagement Rate</div>
                  <div className="text-sm md:text-base font-black text-slate-800 leading-tight mt-0.5">12.5%</div>
               </div>
            </div>

         </div>
      </section>

      {/* 8. ALUR KERJA (WORKFLOW) */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1200px] mx-auto flex flex-col items-center">
        <div className="text-center mb-16">
           <h3 className="font-bold text-sm md:text-base mb-3 text-violet-600 uppercase tracking-widest">Project Roadmap</h3>
           <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold text-slate-900 leading-[1.15]">Alur Kerja Sama di Liva Agency</h2>
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

      {/* 8.5. FAQ */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
        <div className="flex-1 lg:max-w-sm mb-8 lg:mb-0">
           <h2 className="text-4xl md:text-5xl lg:text-[48px] font-extrabold text-slate-900 mb-6 tracking-tight">FAQ</h2>
           <p className="text-slate-800 font-medium text-[17px] mb-10 leading-relaxed max-w-[320px]">
             Temukan jawaban tentang bagaimana LIVA AGENCY bekerja dan apa yang bisa kami lakukan untuk Anda
           </p>
           <p className="text-slate-900 font-medium mb-6 text-[17px]">
             Ada pertanyaan lebih lanjut?
           </p>
           <button className="bg-violet-800 hover:bg-violet-900 text-white font-medium rounded-xl px-8 py-3.5 transition-colors">
             Hubungi Kami
           </button>
        </div>
        
        <div className="flex-1 w-full flex flex-col">
           {/* Top border for the first item */}
           <div className="border-t border-slate-300 w-full"></div>
           {[
             {
               q: "Apakah Liva Agency hanya menyediakan host saja?",
               a: "Tentu tidak! Liva Agency menyediakan satu paket komplit mulai dari Host Live Profesional, Studio Standar/Custom, alat-alat (kamera, lighting, dll), hingga Basic/Advanced OBS setup. Kamu tinggal terima beres."
             },
             {
               q: "Berapa lama masa kontrak minimal di Liva Agency?",
               a: "Di Liva Agency, kami sangat fleksibel. Kamu bisa mencoba dari 1 bulan pertama dulu dan kemudian bisa diperpanjang sesuai kebutuhan operasional GMV mu (fleksibel hingga 1-12 bulan)."
             },
             {
               q: "Apakah ada masa coba (trial)?",
               a: "Ada! Kami memfasilitasi Trial Live agar brand kamu bisa mengecek kualitas koneksi, persiapan host, teknis, dan alur sebelum akhirnya masuk ke tahap Go Live secara resmi."
             },
             {
               q: "Siapa yang menyiapkan produk untuk kebutuhan livestream?",
               a: "Brand akan mengirimkan produk demo/sampel beserta guideline ukuran/warna dan aset pendukung livestream ke tim Liva Agency. Kami yang akan merapikan display pada saat live berjalan."
             },
             {
               q: "Dimana lokasi studio Liva Agency?",
               a: "Studio liva agency berada di lokasi strategis yang memudahkan mobilitas talent. Saat ini studio eksklusif kami berpusat di Jakarta dengan fasilitas lengkap untuk support operasional harian."
             }
           ].map((faq, index) => (
             <div 
               key={index} 
               className="border-b border-slate-300 transition-all duration-300"
             >
               <button 
                 onClick={() => setOpenFaq(openFaq === index ? null : index)}
                 className="w-full py-6 flex items-center gap-5 text-left hover:bg-slate-50/50 transition-colors focus:outline-none bg-transparent"
               >
                 <div className="text-slate-600 shrink-0">
                   {openFaq === index ? <Minus className="w-6 h-6 stroke-[1.5]" /> : <Plus className="w-6 h-6 stroke-[2]" />}
                 </div>
                 <span className="font-bold text-[17px] text-slate-900 pr-4">{faq.q}</span>
               </button>
               <div 
                 className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-60 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
               >
                 <p className="text-slate-600 text-[15px] leading-relaxed pl-[44px] pr-4">{faq.a}</p>
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-16 px-6 md:px-12 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-8 justify-between">
          
          <div className="flex flex-col gap-6 max-w-xs">
             <div className="flex items-center gap-2 text-white mb-2">
                <Video className="w-8 h-8 text-violet-500" />
                <span className="text-2xl font-black tracking-tight">LIVA AGENCY</span>
             </div>
             <p className="text-slate-400 text-sm leading-relaxed">
               Agensi Live Shopping terpercaya yang siap membantu bisnis kamu berkembang lewati batas dengan layanan eksekusi live streaming terbaik.
             </p>
             <div className="flex items-center gap-2.5 mt-2">
               <span className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-violet-600 cursor-pointer transition-colors text-white"><Instagram className="w-4 h-4" /></span>
               <span className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-violet-600 cursor-pointer transition-colors text-white"><Youtube className="w-4 h-4" /></span>
               <span className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-violet-600 cursor-pointer transition-colors text-white"><Facebook className="w-4 h-4" /></span>
             </div>
             <div className="flex flex-col md:flex-row gap-3 mt-4">
                <a href="/login/admin" className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-transparent hover:bg-slate-800 text-white font-medium text-sm transition-colors text-center whitespace-nowrap block">
                   Portal Admin & Host
                </a>
                <a href="/login/brand" className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-transparent hover:bg-slate-800 text-white font-medium text-sm transition-colors text-center whitespace-nowrap block">
                   Login Brand
                </a>
             </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 lg:pl-12">
             <div className="flex flex-col gap-3">
               <h4 className="text-white font-bold text-sm mb-3">Layanan</h4>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Host Profesional</a>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Studio Live</a>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Optimasi Strategi</a>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Manajemen Performa</a>
             </div>
             <div className="flex flex-col gap-3">
               <h4 className="text-white font-bold text-sm mb-3">Perusahaan</h4>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Tentang Liva Agency</a>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Karir</a>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Hubungi Kami</a>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Klien & Portofolio</a>
             </div>
             <div className="flex flex-col gap-3">
               <h4 className="text-white font-bold text-sm mb-3">Bantuan</h4>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">FAQ</a>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Syarat & Ketentuan</a>
               <a href="#" className="hover:text-violet-400 transition-colors text-slate-400 font-medium text-sm">Kebijakan Privasi</a>
             </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-slate-500 font-medium">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                {agencyLogoUrl ? (
                  <img src={agencyLogoUrl} className="object-contain h-8 grayscale opacity-70 max-w-[150px]" alt="Liva Agency Logo" />
                ) : (
                  <>
                    <Video className="w-5 h-5 text-violet-500" />
                    <span className="text-lg font-black text-white tracking-tight">LIVA AGENCY</span>
                  </>
                )}
             </div>
             <span className="ml-4">All rights reserved • ©2026</span>
          </div>
          <div className="flex items-center gap-6">
             <a href="#" className="hover:text-slate-300 transition-colors">Privacy policy</a>
             <a href="#" className="hover:text-slate-300 transition-colors">Terms & conditions</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
