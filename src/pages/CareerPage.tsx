import React from 'react';
import { ArrowRight, MapPin, Clock, Briefcase } from 'lucide-react';

const JOB_OPENINGS = [
  {
    id: 1,
    title: "Senior UI/UX Designer",
    department: "Design & Product",
    location: "Jakarta (Hybrid)",
    type: "Full-time",
    description: "Kami mencari desainer yang memiliki passion dalam menciptakan antarmuka yang intuitif dan berpusat pada pengguna untuk produk-produk digital kelas enterprise."
  },
  {
    id: 2,
    title: "Frontend Engineer (React)",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Bergabunglah dengan tim engineering kami untuk membangun aplikasi web modern, cepat, dan responsif menggunakan ekosistem React terbaru."
  },
  {
    id: 3,
    title: "HR Tech Consultant",
    department: "Consulting",
    location: "Jakarta (On-site)",
    type: "Full-time",
    description: "Bantu klien enterprise kami melakukan transformasi digital di bidang HR dengan merancang strategi implementasi HRIS dan LMS yang tepat guna."
  },
  {
    id: 4,
    title: "B2B Marketing Specialist",
    department: "Marketing",
    location: "Jakarta (Hybrid)",
    type: "Full-time",
    description: "Rancang dan eksekusi strategi pemasaran B2B yang efektif untuk menjangkau pengambil keputusan di perusahaan-perusahaan terkemuka."
  }
];

export default function CareerPage() {
  return (
    <main className="pt-24 lg:pt-32 pb-20">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-20 text-center" aria-labelledby="career-header">
        <span className="bg-violet-100 text-violet-700 font-bold text-sm px-4 py-1.5 rounded-full inline-block mb-6 uppercase tracking-widest">
          Karir
        </span>
        <h1 id="career-header" className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Bergabunglah Bersama Kami
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Di Liva Agency, kami membangun teknologi yang memberdayakan sumber daya manusia. Kami selalu mencari talenta cerdas yang bersemangat untuk memecahkan masalah kompleks dan menciptakan dampak nyata bagi klien kami.
        </p>
      </section>

      {/* Perks / Culture Section (Optional) */}
      <section className="bg-slate-50 py-16 mb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Mengapa Liva Agency?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fleksibilitas Kerja</h3>
              <p className="text-slate-600">Kami mendukung model kerja hybrid dan remote untuk menjaga keseimbangan kehidupan kerja yang sehat.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Pengembangan Diri</h3>
              <p className="text-slate-600">Akses ke berbagai kursus premium, konferensi, dan perpustakaan lengkap untuk terus mengasah kemampuan Anda.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dampak Skala Enterprise</h3>
              <p className="text-slate-600">Kesempatan untuk mengerjakan proyek berskala besar yang digunakan oleh puluhan ribu karyawan setiap harinya.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Job Openings Section */}
      <section className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Posisi yang Tersedia</h2>
          <p className="text-slate-600">Temukan peran yang sesuai dengan keahlian dan aspirasi Anda.</p>
        </div>

        <div className="space-y-6">
          {JOB_OPENINGS.map((job) => (
            <div key={job.id} className="group bg-white border border-slate-200 rounded-2xl p-6 md:p-8 hover:border-violet-600 hover:shadow-lg transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Job Info */}
                <div className="flex-1">
                  <span className="text-sm font-bold text-violet-600 mb-2 block">{job.department}</span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-violet-700 transition-colors">{job.title}</h3>
                  <p className="text-slate-600 mb-6 line-clamp-2">{job.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <Clock className="w-4 h-4" /> {job.type}
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="md:self-center shrink-0">
                  <a 
                    href="https://wa.me/6281234567890" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center gap-2 w-full md:w-auto bg-slate-900 hover:bg-violet-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                  >
                    Lamar Posisi <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
