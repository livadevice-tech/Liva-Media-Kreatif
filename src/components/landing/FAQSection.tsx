import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export const FAQSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqData = [
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
  ];

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
      <div className="flex-1 lg:max-w-sm mb-8 lg:mb-0">
         <h2 className="text-4xl md:text-5xl lg:text-[48px] font-serif font-extrabold text-slate-900 mb-6 tracking-tight">FAQ</h2>
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
         {faqData.map((faq, index) => (
           <div 
             key={index} 
             className="border-b border-slate-300 transition-all duration-300"
           >
             <button 
               onClick={() => setOpenFaq(openFaq === index ? null : index)}
               className="w-full py-6 flex items-center gap-5 text-left hover:bg-slate-50/50 transition-colors focus:outline-none bg-transparent cursor-pointer"
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
  );
};
