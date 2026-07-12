import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

const DUMMY_ARTICLE = {
  title: "Strategi Integrasi LMS dan HRIS untuk Pengembangan SDM Berbasis Data",
  category: "CAPACITY BUILDING",
  date: "02 May 2026",
  author: "Sabrina",
  authorRole: "Senior HR Tech Consultant",
  authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  coverImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200",
  content: `
    <p>Pengembangan Sumber Daya Manusia (SDM) yang efektif merupakan kunci keberhasilan jangka panjang bagi setiap perusahaan. Di era digital ini, menggabungkan Learning Management System (LMS) dengan Human Resources Information System (HRIS) bukan lagi sekadar tren, melainkan sebuah kebutuhan strategis.</p>
    
    <h2>Mengapa Integrasi Ini Penting?</h2>
    <p>Seringkali, data pelatihan karyawan di LMS terpisah dari data profil dan kinerja di HRIS. Hal ini menyulitkan HR untuk melihat korelasi langsung antara program pelatihan dengan peningkatan performa karyawan.</p>
    <p>Dengan integrasi yang tepat, perusahaan dapat mencapai otomasi pelatihan, pengelolaan data karyawan yang terpusat, dan penguatan <em>talent management</em> berbasis data.</p>
    
    <h3>Keuntungan Utama Integrasi LMS dan HRIS</h3>
    <ul>
      <li><strong>Otomatisasi Onboarding:</strong> Karyawan baru secara otomatis terdaftar ke program orientasi di LMS begitu data mereka dimasukkan ke HRIS.</li>
      <li><strong>Personalisasi Pembelajaran:</strong> Rekomendasi modul pelatihan di LMS dapat disesuaikan dengan jalur karir dan gap kompetensi yang tercatat di HRIS.</li>
      <li><strong>Pelaporan Terpadu:</strong> Manajemen dapat melihat ROI (Return on Investment) dari setiap program pelatihan secara langsung.</li>
    </ul>

    <h2>Langkah Awal Implementasi</h2>
    <p>Sebelum memulai integrasi teknis, sangat penting untuk menyelaraskan tujuan bisnis. Pastikan kedua platform memiliki API terbuka (Open API) yang memungkinkan pertukaran data secara <em>real-time</em>.</p>
    <p>Di Liva Agency, kami membantu klien memetakan kebutuhan integrasi ini dari awal hingga akhir, memastikan tidak ada data yang hilang dan proses berjalan lancar tanpa mengganggu operasional harian.</p>
  `
};

export default function BlogDetailPage() {
  const { id } = useParams();

  // In a real app, fetch data based on the 'id' parameter.
  // For now, we use the dummy article.

  return (
    <main className="pt-24 lg:pt-32 pb-20 max-w-4xl mx-auto px-6 md:px-12">
      
      {/* Back Button */}
      <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 font-medium mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Artikel
      </Link>

      {/* Article Header */}
      <header className="mb-10 text-center">
        <span className="bg-orange-100 text-orange-700 font-bold text-sm px-4 py-1.5 rounded-full inline-block mb-6">
          {DUMMY_ARTICLE.category}
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
          {DUMMY_ARTICLE.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600">
          <div className="flex items-center gap-3">
            <img src={DUMMY_ARTICLE.authorImage} alt={DUMMY_ARTICLE.author} className="w-10 h-10 rounded-full object-cover" />
            <div className="text-left">
              <p className="font-bold text-slate-900 text-sm">{DUMMY_ARTICLE.author}</p>
              <p className="text-xs">{DUMMY_ARTICLE.authorRole}</p>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          <time dateTime="2026-05-02" className="text-sm font-medium">{DUMMY_ARTICLE.date}</time>
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Bagikan:</span>
            <button className="text-slate-400 hover:text-blue-600 transition-colors" aria-label="Share to Facebook"><Facebook className="w-4 h-4" /></button>
            <button className="text-slate-400 hover:text-blue-400 transition-colors" aria-label="Share to Twitter"><Twitter className="w-4 h-4" /></button>
            <button className="text-slate-400 hover:text-blue-700 transition-colors" aria-label="Share to LinkedIn"><Linkedin className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm">
        <img src={DUMMY_ARTICLE.coverImage} alt={DUMMY_ARTICLE.title} className="w-full h-auto object-cover max-h-[500px]" loading="eager" />
      </figure>

      {/* Article Content */}
      <article 
        className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-a:text-violet-600 hover:prose-a:text-violet-800 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: DUMMY_ARTICLE.content }}
      />
      
      {/* CTA Footer */}
      <div className="mt-16 p-8 bg-violet-50 rounded-2xl text-center border border-violet-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Butuh bantuan integrasi sistem di perusahaan Anda?</h3>
        <p className="text-slate-600 mb-6">Konsultasikan kebutuhan teknologi HRIS dan LMS Anda bersama tim ahli kami.</p>
        <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 rounded-full transition-all shadow-md">
          Konsultasi Gratis Sekarang
        </a>
      </div>

    </main>
  );
}
