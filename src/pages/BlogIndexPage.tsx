import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ArrowLeft } from 'lucide-react';

const CATEGORIES = ["View All", "B2B Insight", "Business Development", "Business Intelligence", "Capacity Building", "Cerita Alumni"];

const FEATURED_POST = {
  id: "strategi-integrasi-lms",
  title: "Strategi Integrasi LMS dan HRIS untuk Pengembangan SDM Berbasis Data",
  description: "Temukan cara mengintegrasikan LMS dan HRIS untuk otomasi pelatihan, pengelolaan data karyawan, dan penguatan talent management di perusahaan.",
  category: "CAPACITY BUILDING",
  author: "Sabrina",
  date: "02 May 2026",
  image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
  authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
};

const BLOG_POSTS = [
  {
    id: "hyper-automation-perusahaan",
    title: "Hyper-automation untuk Perusahaan: Apa Itu dan Mulai dari Mana?",
    description: "Hyper-automation membantu perusahaan meningkatkan efisiensi proses bisnis. Ketahui langkah awal implementasi dan strategi yang tepat.",
    category: "Tech Consulting",
    date: "05 Jul 2026",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "tech-stack-custom-software",
    title: "Cara Memilih Tech Stack untuk Custom Software Perusahaan",
    description: "Memilih tech stack yang tepat dapat menentukan biaya, performa, dan skalabilitas software. Simak faktor penting dan cara menentukan pilihannya.",
    category: "Tech Consulting",
    date: "05 Jul 2026",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "integrasi-ai-erp-crm",
    title: "6 Cara Integrasi AI ke ERP/CRM Tanpa Ganti Sistem",
    description: "Integrasi AI ke ERP/CRM tanpa mengganti sistem. Simak langkah implementasi, tantangan, dan waktu yang tepat menggunakan tech consulting.",
    category: "Tech Consulting",
    date: "05 Jul 2026",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600"
  }
];

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState("View All");

  return (
    <main className="pt-24 lg:pt-32 pb-20 max-w-7xl mx-auto px-6 md:px-12">
      
      {/* Header Section */}
      <section className="mb-12" aria-labelledby="blog-header">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-violet-700 font-bold tracking-widest text-sm uppercase mb-3 block">Insights</span>
            <h1 id="blog-header" className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">What matters now</h1>
            <p className="text-slate-600 text-lg">Stay current with trends shaping digital talent, technology, and enterprise transformation</p>
          </div>
          
          <div className="w-full md:w-80 relative">
            <input 
              type="text" 
              placeholder="Tulis kata kunci.." 
              className="w-full border border-slate-200 rounded-lg py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="mb-16 bg-slate-50 rounded-2xl overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12" aria-label="Featured article">
        <div className="w-full md:w-1/2 h-64 md:h-96">
          <img src={FEATURED_POST.image} alt="Strategi Integrasi LMS" className="w-full h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 md:pl-0">
          <span className="text-violet-700 font-bold tracking-widest text-sm uppercase mb-4 block">{FEATURED_POST.category}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            <Link to={`/blog/${FEATURED_POST.id}`} className="hover:text-violet-600 transition-colors">
              {FEATURED_POST.title}
            </Link>
          </h2>
          <p className="text-slate-600 mb-8 text-lg">{FEATURED_POST.description}</p>
          <div className="flex items-center gap-4">
            <img src={FEATURED_POST.authorImage} alt={FEATURED_POST.author} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-bold text-slate-900 text-sm">{FEATURED_POST.author}</p>
              <p className="text-slate-500 text-sm">{FEATURED_POST.date}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12 flex items-center justify-center gap-6 overflow-x-auto pb-4 hide-scrollbar" aria-label="Blog categories">
        {CATEGORIES.map(category => (
          <button 
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-6 py-2 rounded-lg font-medium transition-all ${activeCategory === category ? 'border border-violet-600 text-violet-700 bg-violet-50' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {category}
          </button>
        ))}
      </section>

      {/* Blog Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Latest articles">
        {BLOG_POSTS.map(post => (
          <article key={post.id} className="flex flex-col group">
            <div className="rounded-2xl overflow-hidden mb-6 h-56">
              <Link to={`/blog/${post.id}`}>
                <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </Link>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="bg-orange-100 text-slate-800 font-bold text-sm px-3 py-1 rounded">{post.category}</span>
              <span className="text-slate-400 text-sm font-medium">{post.date}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-violet-600 transition-colors">
              <Link to={`/blog/${post.id}`}>{post.title}</Link>
            </h3>
            <p className="text-slate-600 mb-6 flex-grow">{post.description}</p>
            <Link to={`/blog/${post.id}`} className="text-violet-700 font-semibold flex items-center gap-2 hover:gap-3 transition-all mt-auto group-hover:text-violet-800">
              Baca selengkapnya <span className="bg-orange-500 text-white rounded p-1"><ArrowRight className="w-3 h-3" /></span>
            </Link>
          </article>
        ))}
      </section>

    </main>
  );
}
