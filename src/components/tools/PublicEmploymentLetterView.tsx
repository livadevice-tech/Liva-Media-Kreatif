import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Sparkles, 
  UserCheck, 
  Building2, 
  Calendar, 
  FileCheck, 
  Hash, 
  Briefcase, 
  PenTool, 
  Check, 
  FileText,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { appApi } from '../../services/appApi';

interface PublicLetterTemplateConfig {
  letterNumber?: string;
  companyName: string;
  kopBrandName: string;
  kopBrandTagline: string;
  kopLogoUrl?: string;
  startDate?: string;
  purpose?: string;
  city: string;
  date: string;
  signerName: string;
  signerPosition: string;
  signatureUrl?: string;
  signatureScale?: number;
  includeStamp?: boolean;
}

interface PublicEmploymentLetterViewProps {
  token: string;
}

// Helper: Convert Month number (0-11) to Roman numerals for Indonesian letter numbering
const toRomanMonth = (monthIndex: number): string => {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[monthIndex] || 'IX';
};

// Helper: Format Date to Indonesian formatted text (e.g. 15 September 2026)
const formatIndonesianDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const PublicEmploymentLetterView: React.FC<PublicEmploymentLetterViewProps> = ({ token }) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentRomanMonth = toRomanMonth(today.getMonth());
  const defaultLetterNo = `001/LIVA/SK/${currentRomanMonth}/${currentYear}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Template / Official Company Settings from Issuer
  const [template, setTemplate] = useState<PublicLetterTemplateConfig>({
    letterNumber: defaultLetterNo,
    companyName: 'PT. Liva Media Kreatif',
    kopBrandName: 'Liva',
    kopBrandTagline: 'Specialist Live Shopping',
    kopLogoUrl: '',
    startDate: today.toISOString().slice(0, 10),
    purpose: 'persyaratan pembuatan rekening payroll Maybank dan kartu ATM Maybank.',
    city: 'Bandar Lampung',
    date: today.toISOString().slice(0, 10),
    signerName: 'Mufthi Ali',
    signerPosition: 'Direktur PT Liva Media Kreatif',
    signatureUrl: '',
    signatureScale: 100,
    includeStamp: true,
  });

  // External User Input Fields
  const [employeeName, setEmployeeName] = useState('');
  const [employeeNik, setEmployeeNik] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState(today.toISOString().slice(0, 10));
  const [purpose, setPurpose] = useState('persyaratan pembukaan rekening bank dan administrasi.');

  // Load template config from backend using token
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const settingKey = `public_sk_template_${token}`;
    appApi.getSettings<PublicLetterTemplateConfig>(settingKey)
      .then((data) => {
        if (!isMounted) return;
        if (data && typeof data === 'object') {
          setTemplate(prev => ({ ...prev, ...data }));
          if (data.startDate) setStartDate(data.startDate);
          if (data.purpose) setPurpose(data.purpose);
        } else {
          // Fallback: try default template if custom token doesn't have custom record
          console.info('Menggunakan template default generator SK');
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Gagal memuat template dari server, menggunakan pengaturan default:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle Print / Download PDF
  const handlePrint = () => {
    if (!employeeName.trim() || !position.trim() || !employeeNik.trim()) {
      alert('Mohon lengkapi Nama Karyawan, NIK Karyawan, dan Jabatan terlebih dahulu.');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const formattedStartDate = formatIndonesianDate(startDate);
    const formattedLetterDate = formatIndonesianDate(template.date || today.toISOString().slice(0, 10));
    const cleanEmployeeName = employeeName.trim() || 'Karyawan';
    const printTitle = `Surat Keterangan Kerja - ${cleanEmployeeName}`;

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${printTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              color: #1e293b;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              width: 210mm;
              min-height: 297mm;
              position: relative;
              overflow: hidden;
            }
            .page-container {
              position: relative;
              width: 210mm;
              min-height: 297mm;
              padding: 48mm 25mm 30mm 25mm;
              background: #ffffff;
              overflow: hidden;
            }

            .top-right-decor {
              position: absolute;
              top: -60px;
              right: -60px;
              width: 320px;
              height: 320px;
              pointer-events: none;
              z-index: 1;
            }
            .bottom-decor {
              position: absolute;
              bottom: -60px;
              left: -40px;
              right: -40px;
              height: 220px;
              pointer-events: none;
              z-index: 1;
            }

            .content-wrapper {
              position: relative;
              z-index: 10;
            }

            .logo-container {
              margin-bottom: 28px;
            }
            .brand-logo {
              display: inline-flex;
              align-items: center;
              gap: 8px;
            }
            .brand-text {
              font-size: 26px;
              font-weight: 800;
              color: #8b5cf6;
              letter-spacing: -0.5px;
              line-height: 1;
            }
            .brand-sub {
              font-size: 8px;
              font-weight: 600;
              color: #64748b;
              margin-top: 2px;
              letter-spacing: 0.2px;
            }

            .letter-header {
              text-align: center;
              margin-bottom: 36px;
            }
            .letter-title {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.2px;
              margin: 0 0 6px 0;
            }
            .letter-number {
              font-size: 13px;
              color: #334155;
              font-weight: 500;
              margin: 0;
            }

            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 26px;
              font-size: 13.5px;
              line-height: 1.6;
            }
            .info-table td {
              padding: 3px 0;
              vertical-align: top;
            }
            .info-table td.label-col {
              width: 140px;
              color: #1e293b;
              font-weight: 500;
            }
            .info-table td.sep-col {
              width: 20px;
              color: #1e293b;
              text-align: center;
            }
            .info-table td.val-col {
              color: #0f172a;
              font-weight: 600;
            }

            .statement-body {
              font-size: 13.5px;
              line-height: 1.7;
              color: #1e293b;
              margin-bottom: 18px;
              text-align: justify;
            }
            .closing-body {
              font-size: 13.5px;
              line-height: 1.7;
              color: #1e293b;
              margin-bottom: 40px;
              text-align: justify;
            }

            .sign-section {
              margin-top: 40px;
              width: 260px;
            }
            .city-date {
              font-size: 13.5px;
              color: #1e293b;
              margin-bottom: 12px;
            }
            .sign-box {
              height: 115px;
              position: relative;
              display: flex;
              align-items: center;
            }
            .signature-img {
              max-height: 95px;
              max-width: 170px;
              object-fit: contain;
              position: relative;
              z-index: 5;
            }
            .stamp-box {
              position: absolute;
              left: 0;
              top: 15px;
              border: 2px solid #e11d48;
              border-radius: 8px;
              padding: 6px 14px;
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: rgba(255, 255, 255, 0.9);
              transform: rotate(-3deg);
              box-shadow: 0 0 0 1px rgba(225, 29, 72, 0.2);
              z-index: 3;
            }
            .stamp-inner {
              color: #e11d48;
              font-weight: 800;
              font-size: 18px;
              letter-spacing: -0.5px;
              line-height: 1;
              text-align: center;
            }
            .stamp-sub {
              color: #e11d48;
              font-size: 8.5px;
              font-weight: 700;
              margin-top: 2px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .signer-name {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
            }
            .signer-position {
              font-size: 13px;
              color: #334155;
              font-weight: 500;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <!-- Top Right Wave Decoration -->
            <svg class="top-right-decor" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0C120 40 180 100 220 180L300 120V0H50Z" fill="#c084fc" fill-opacity="0.35"/>
              <path d="M120 0C180 40 240 100 270 170L300 130V0H120Z" fill="#a855f7" fill-opacity="0.5"/>
              <path d="M180 0C230 30 270 80 300 140V0H180Z" fill="#9333ea" fill-opacity="0.75"/>
            </svg>

            <!-- Bottom Left/Right Wave Decoration -->
            <svg class="bottom-decor" viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 220V120C120 120 180 180 280 220H0Z" fill="#c084fc" fill-opacity="0.4"/>
              <path d="M100 220C220 160 360 180 500 220H100Z" fill="#e9d5ff" fill-opacity="0.6"/>
              <path d="M450 220C550 170 650 140 800 100V220H450Z" fill="#d8b4fe" fill-opacity="0.5"/>
              <path d="M550 220C650 180 720 160 800 140V220H550Z" fill="#c084fc" fill-opacity="0.6"/>
            </svg>

            <div class="content-wrapper">
              <!-- Header Logo -->
              <div class="logo-container">
                <div class="brand-logo">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    ${template.kopLogoUrl ? `
                      <img src="${template.kopLogoUrl}" alt="Logo Kop" style="max-height: 46px; max-width: 140px; object-fit: contain;" />
                    ` : `
                      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="10" fill="#8b5cf6"/>
                        <circle cx="15" cy="18" r="3.5" fill="white"/>
                        <circle cx="25" cy="18" r="3.5" fill="white"/>
                        <path d="M15 25C17.5 27.5 22.5 27.5 25 25" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    `}
                    ${(template.kopBrandName || template.kopBrandTagline) ? `
                      <div>
                        ${template.kopBrandName ? `<div class="brand-text">${template.kopBrandName}</div>` : ''}
                        ${template.kopBrandTagline ? `<div class="brand-sub">${template.kopBrandTagline}</div>` : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- Judul Surat -->
              <div class="letter-header">
                <h1 class="letter-title">Surat Keterangan Kerja</h1>
                <p class="letter-number">No: ${template.letterNumber || defaultLetterNo}</p>
              </div>

              <!-- Biodata Karyawan -->
              <table class="info-table">
                <tr>
                  <td class="label-col">Nama Karyawan</td>
                  <td class="sep-col">:</td>
                  <td class="val-col">${employeeName}</td>
                </tr>
                <tr>
                  <td class="label-col">NIK Karyawan</td>
                  <td class="sep-col">:</td>
                  <td class="val-col">${employeeNik}</td>
                </tr>
                <tr>
                  <td class="label-col">Jabatan</td>
                  <td class="sep-col">:</td>
                  <td class="val-col">${position}</td>
                </tr>
              </table>

              <!-- Isi Pernyataan -->
              <p class="statement-body">
                Adalah benar karyawan <strong>${template.companyName}</strong> yang bekerja sebagai <strong>${position}</strong> dan telah bekerja sejak <strong>${formattedStartDate}</strong> dengan sekarang.
              </p>

              <p class="closing-body">
                Demikian Surat Keterangan ini dibuat untuk ${purpose.trim().endsWith('.') ? purpose : purpose + '.'}
              </p>

              <!-- Blok Tanda Tangan -->
              <div class="sign-section">
                <div class="city-date">
                  ${template.city},<br/>
                  ${formattedLetterDate}
                </div>

                <div class="sign-box">
                  ${template.includeStamp ? `
                    <div class="stamp-box">
                      <div>
                        <div class="stamp-inner">${template.kopBrandName || 'Liva'}</div>
                        <div class="stamp-sub">${template.companyName}</div>
                      </div>
                    </div>
                  ` : ''}

                  <div class="signature-wrapper" style="transform: scale(${(template.signatureScale || 100) / 100}); transform-origin: left center; display: inline-flex; align-items: center; position: relative; z-index: 5; margin-left: 10px;">
                    ${template.signatureUrl ? `
                      <img src="${template.signatureUrl}" class="signature-img" alt="Tanda Tangan" style="margin: 0;" />
                    ` : `
                      <div class="default-tanda-tangan" style="margin-left: 0;">
                        <svg width="130" height="95" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M30 85C45 40 70 15 80 30C88 42 75 75 60 88C50 96 40 90 45 75C55 45 90 20 110 50C125 70 120 90 145 95" stroke="#334155" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M70 45L70 98" stroke="#334155" stroke-width="2.2" stroke-linecap="round"/>
                        </svg>
                      </div>
                    `}
                  </div>
                </div>

                <div class="signer-name">${template.signerName}</div>
                <div class="signer-position">${template.signerPosition}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);

    doc.close();

    const originalDocTitle = document.title;
    document.title = printTitle;

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.title = originalDocTitle;
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm animate-spin mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Menyiapkan Formulir Surat Keterangan Kerja...</p>
        <p className="text-xs text-slate-400 mt-1">Mengambil template resmi perusahaan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased font-sans flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">
                {template.companyName}
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pengisian Formulir Mandiri Surat Keterangan Kerja
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tanda Tangan Terverifikasi Resmi</span>
            </span>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Download Surat PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT: EXTERNAL FORM INPUT                                 */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Greeting Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-indigo-600/10">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Surat Keterangan Kerja Online
                  </h2>
                  <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                    Silakan isi data diri Anda (Nama, NIK, dan Jabatan) pada kolom di bawah. Dokumen akan langsung terisi lengkap dan siap Anda download dalam format PDF resmi bertanda tangan.
                  </p>
                </div>
              </div>
            </div>

            {/* Input Card: Data Karyawan Mandiri */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Data Karyawan
                  </h3>
                </div>
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                  Wajib Diisi
                </span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Karyawan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda..."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NIK KTP Karyawan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeNik}
                      onChange={(e) => setEmployeeNik(e.target.value)}
                      placeholder="16 digit NIK KTP..."
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jabatan / Posisi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Contoh: Host Live Shopping"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mulai Bekerja Sejak <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Perusahaan Penerbit
                    </label>
                    <input
                      type="text"
                      disabled
                      value={template.companyName}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Keperluan Pembuatan Surat <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Contoh: persyaratan pembukaan rekening payroll bank dan kartu ATM."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">Opsi cepat:</span>
                    <button
                      type="button"
                      onClick={() => setPurpose('persyaratan pembuatan rekening payroll Maybank dan kartu ATM Maybank.')}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Payroll Maybank
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurpose('kelengkapan berkas pengajuan kredit / KPR di bank.')}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                    >
                      KPR Bank
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurpose('pengajuan visa perjalanan dan keperluan administrasi kedutaan.')}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Visa Perjalanan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Download Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>Download Dokumen Resmi (PDF)</span>
            </button>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-500 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Dokumen ini diterbitkan oleh <strong>{template.companyName}</strong> dengan tanda tangan dan stempel digital resmi dari <strong>{template.signerName}</strong> ({template.signerPosition}).
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: LIVE A4 PREVIEW CONTAINER                          */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pratinjau Langsung Dokumen (A4)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Format Resmi A4</span>
            </div>

            {/* A4 Sheet Simulation */}
            <div className="w-full max-w-[595px] bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden relative select-none">
              
              {/* SVG Background Elements */}
              <div className="relative w-full aspect-[210/297] p-8 sm:p-12 flex flex-col justify-between overflow-hidden bg-white text-slate-800 text-[11px] leading-relaxed">
                
                {/* Top Right Wave Decoration */}
                <svg className="absolute -top-6 -right-6 w-44 h-44 pointer-events-none" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0C120 40 180 100 220 180L300 120V0H50Z" fill="#c084fc" fillOpacity="0.35"/>
                  <path d="M120 0C180 40 240 100 270 170L300 130V0H120Z" fill="#a855f7" fillOpacity="0.5"/>
                  <path d="M180 0C230 30 270 80 300 140V0H180Z" fill="#9333ea" fillOpacity="0.75"/>
                </svg>

                {/* Bottom Wave Decoration */}
                <svg className="absolute -bottom-6 -left-6 -right-6 h-28 w-[calc(100%+48px)] pointer-events-none" viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 220V120C120 120 180 180 280 220H0Z" fill="#c084fc" fillOpacity="0.4"/>
                  <path d="M100 220C220 160 360 180 500 220H100Z" fill="#e9d5ff" fillOpacity="0.6"/>
                  <path d="M450 220C550 170 650 140 800 100V220H450Z" fill="#d8b4fe" fillOpacity="0.5"/>
                  <path d="M550 220C650 180 720 160 800 140V220H550Z" fill="#c084fc" fillOpacity="0.6"/>
                </svg>

                {/* Sheet Content */}
                <div className="relative z-10">
                  {/* Logo Brand */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2.5">
                      {template.kopLogoUrl ? (
                        <img 
                          src={template.kopLogoUrl} 
                          alt="Logo Kop" 
                          className="max-h-9 max-w-[120px] object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-xs">
                          <Briefcase className="w-4 h-4" />
                        </div>
                      )}
                      {(template.kopBrandName || template.kopBrandTagline) && (
                        <div>
                          {template.kopBrandName && (
                            <div className="text-xl font-extrabold text-indigo-600 tracking-tight leading-none">
                              {template.kopBrandName}
                            </div>
                          )}
                          {template.kopBrandTagline && (
                            <div className="text-[7.5px] font-semibold text-slate-500 mt-0.5 tracking-wider">
                              {template.kopBrandTagline}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & No Surat */}
                  <div className="text-center mb-6">
                    <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Surat Keterangan Kerja
                    </h1>
                    <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                      No: {template.letterNumber || defaultLetterNo}
                    </p>
                  </div>

                  {/* Data Table */}
                  <div className="space-y-1 mb-5 text-[11px] sm:text-xs">
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">Nama Karyawan</span>
                      <span className="w-4 text-center">:</span>
                      <span className="flex-1 font-bold text-slate-900">
                        {employeeName.trim() || <span className="text-slate-400 italic font-normal">[Nama Anda]</span>}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">NIK Karyawan</span>
                      <span className="w-4 text-center">:</span>
                      <span className="flex-1 font-medium text-slate-800">
                        {employeeNik.trim() || <span className="text-slate-400 italic font-normal">[NIK Anda]</span>}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">Jabatan</span>
                      <span className="w-4 text-center">:</span>
                      <span className="flex-1 font-semibold text-slate-800">
                        {position.trim() || <span className="text-slate-400 italic font-normal">[Jabatan / Posisi]</span>}
                      </span>
                    </div>
                  </div>

                  {/* Statement body */}
                  <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed mb-4 text-justify">
                    Adalah benar karyawan <strong>{template.companyName}</strong> yang bekerja sebagai <strong>{position.trim() || '...'}</strong> dan telah bekerja sejak <strong>{formatIndonesianDate(startDate)}</strong> dengan sekarang.
                  </p>

                  <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed text-justify mb-8">
                    Demikian Surat Keterangan ini dibuat untuk {purpose}
                  </p>

                  {/* Signature Section */}
                  <div className="w-56 mt-4">
                    <div className="text-[11px] sm:text-xs text-slate-700">
                      {template.city},<br/>
                      {formatIndonesianDate(template.date)}
                    </div>

                    <div className="h-20 my-1 relative flex items-center">
                      {/* Stamp badge */}
                      {template.includeStamp && (
                        <div className="absolute left-0 top-3 border-2 border-rose-600/90 rounded-md px-2.5 py-1 bg-white/90 shadow-2xs rotate-[-4deg] z-10 flex items-center gap-1.5">
                          <div>
                            <div className="text-rose-600 font-black text-sm tracking-tight leading-none">
                              {template.kopBrandName || 'Liva'}
                            </div>
                            <div className="text-[6px] font-bold text-rose-600 uppercase tracking-widest mt-0.5">
                              {template.companyName}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Signature render with dynamic scale */}
                      <div 
                        className="relative z-20 ml-4 flex items-center origin-left transition-transform duration-150"
                        style={{ transform: `scale(${(template.signatureScale || 100) / 100})` }}
                      >
                        {template.signatureUrl ? (
                          <img 
                            src={template.signatureUrl} 
                            className="max-h-20 max-w-[150px] object-contain" 
                            alt="Signature" 
                          />
                        ) : (
                          <svg className="w-24 h-16 text-slate-700" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M30 85C45 40 70 15 80 30C88 42 75 75 60 88C50 96 40 90 45 75C55 45 90 20 110 50C125 70 120 90 145 95" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M70 45L70 98" stroke="#334155" strokeWidth="2.2" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1">
                      {template.signerName}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-600 font-medium">
                      {template.signerPosition}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-[9px] text-slate-400 pt-4 flex justify-between items-center border-t border-slate-100">
                  <span>Dokumen Resmi • {template.companyName}</span>
                  <span>Halaman 1 dari 1</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
