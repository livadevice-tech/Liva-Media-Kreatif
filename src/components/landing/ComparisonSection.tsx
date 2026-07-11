import React from 'react';

export const ComparisonSection = () => {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-slate-50 border-t border-slate-100 flex flex-col items-center">
       <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-serif font-extrabold tracking-tight leading-[1.15] mb-6 text-slate-900">
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
  );
};
