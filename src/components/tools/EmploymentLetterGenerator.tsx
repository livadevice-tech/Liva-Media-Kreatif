import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Download, 
  RotateCcw, 
  Sparkles, 
  UserCheck, 
  Building2, 
  Calendar, 
  FileCheck, 
  Hash, 
  Briefcase, 
  CreditCard,
  PenTool,
  Upload,
  Trash2,
  Check,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Sliders
} from 'lucide-react';
import { UserAccount } from '../../types/app';

interface EmploymentLetterData {
  letterNumber: string;
  employeeName: string;
  employeeNik: string;
  position: string;
  companyName: string;
  kopBrandName: string;
  kopBrandTagline: string;
  kopLogoUrl?: string;
  startDate: string;
  purpose: string;
  city: string;
  date: string;
  signerName: string;
  signerPosition: string;
  signatureUrl?: string;
  signatureScale: number; // 50 - 200 (%)
  includeStamp: boolean;
}

interface EmploymentLetterGeneratorProps {
  currentUser?: UserAccount | null;
  onBack?: () => void;
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

export const EmploymentLetterGenerator: React.FC<EmploymentLetterGeneratorProps> = ({
  currentUser,
  onBack,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentRomanMonth = toRomanMonth(today.getMonth());
  const defaultLetterNo = `001/LIVA/SK/${currentRomanMonth}/${currentYear}`;

  const [formData, setFormData] = useState<EmploymentLetterData>({
    letterNumber: defaultLetterNo,
    employeeName: 'Dwi Ikhtiar Larasati',
    employeeNik: '1809025708030001',
    position: 'Host Live Shopping',
    companyName: 'PT. Liva Media Kreatif',
    kopBrandName: 'Liva',
    kopBrandTagline: 'Specialist Live Shopping',
    kopLogoUrl: '',
    startDate: '2026-09-01',
    purpose: 'persyaratan pembuatan rekening payroll Maybank dan kartu ATM Maybank.',
    city: 'Bandar Lampung',
    date: today.toISOString().slice(0, 10),
    signerName: 'Mufthi Ali',
    signerPosition: 'Direktur PT Liva Media Kreatif',
    signatureUrl: '',
    signatureScale: 100,
    includeStamp: true,
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-fill signer from logged in user if available
  useEffect(() => {
    if (currentUser && currentUser.role === 'Master Admin') {
      if (currentUser.full_name && !formData.signerName) {
        setFormData(prev => ({
          ...prev,
          signerName: currentUser.full_name,
          signerPosition: currentUser.position || 'Direktur PT Liva Media Kreatif'
        }));
      }
    }
  }, [currentUser]);

  // Handle signature upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran gambar tanda tangan maksimal 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          signatureUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle kop surat logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran file logo maksimal 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          kopLogoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Print / PDF using isolated iframe
  const handlePrint = () => {
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

    const formattedStartDate = formatIndonesianDate(formData.startDate);
    const formattedLetterDate = formatIndonesianDate(formData.date);
    const printTitle = `Surat Keterangan Kerja - ${formData.employeeName}`;

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

            /* Decorative Background Waves */
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

            /* Header Logo */
            .logo-container {
              margin-bottom: 28px;
            }
            .brand-logo {
              display: inline-flex;
              align-items: center;
              gap: 8px;
            }
            .brand-icon {
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, #8b5cf6, #ec4899);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
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

            /* Title & Letter Number */
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

            /* Employee Info Table */
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
              font-weight: 500;
            }

            /* Narrative Paragraphs */
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

            /* Sign Section */
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
            .default-tanda-tangan {
              position: relative;
              z-index: 5;
              margin-left: 10px;
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
                    ${formData.kopLogoUrl ? `
                      <img src="${formData.kopLogoUrl}" alt="Logo Kop" style="max-height: 46px; max-width: 140px; object-fit: contain;" />
                    ` : `
                      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="10" fill="#8b5cf6"/>
                        <circle cx="15" cy="18" r="3.5" fill="white"/>
                        <circle cx="25" cy="18" r="3.5" fill="white"/>
                        <path d="M15 25C17.5 27.5 22.5 27.5 25 25" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    `}
                    ${(formData.kopBrandName || formData.kopBrandTagline) ? `
                      <div>
                        ${formData.kopBrandName ? `<div class="brand-text">${formData.kopBrandName}</div>` : ''}
                        ${formData.kopBrandTagline ? `<div class="brand-sub">${formData.kopBrandTagline}</div>` : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- Judul Surat -->
              <div class="letter-header">
                <h1 class="letter-title">Surat Keterangan Kerja</h1>
                <p class="letter-number">No: ${formData.letterNumber}</p>
              </div>

              <!-- Biodata Karyawan -->
              <table class="info-table">
                <tr>
                  <td class="label-col">Nama Karyawan</td>
                  <td class="sep-col">:</td>
                  <td class="val-col">${formData.employeeName}</td>
                </tr>
                <tr>
                  <td class="label-col">NIK Karyawan</td>
                  <td class="sep-col">:</td>
                  <td class="val-col">${formData.employeeNik}</td>
                </tr>
                <tr>
                  <td class="label-col">Jabatan</td>
                  <td class="sep-col">:</td>
                  <td class="val-col">${formData.position}</td>
                </tr>
              </table>

              <!-- Isi Pernyataan -->
              <p class="statement-body">
                Adalah benar karyawan ${formData.companyName} yang bekerja sebagai ${formData.position} dan telah bekerja sejak ${formattedStartDate} dengan sekarang.
              </p>

              <p class="closing-body">
                Demikian Surat Keterangan ini dibuat untuk ${formData.purpose.trim().endsWith('.') ? formData.purpose : formData.purpose + '.'}
              </p>

              <!-- Blok Tanda Tangan -->
              <div class="sign-section">
                <div class="city-date">
                  ${formData.city},<br/>
                  ${formattedLetterDate}
                </div>

                <div class="sign-box">
                  ${formData.includeStamp ? `
                    <div class="stamp-box">
                      <div>
                        <div class="stamp-inner">${formData.kopBrandName || 'Liva'}</div>
                        <div class="stamp-sub">${formData.companyName}</div>
                      </div>
                    </div>
                  ` : ''}

                  <div class="signature-wrapper" style="transform: scale(${formData.signatureScale / 100}); transform-origin: left center; display: inline-flex; align-items: center; position: relative; z-index: 5; margin-left: 10px;">
                    ${formData.signatureUrl ? `
                      <img src="${formData.signatureUrl}" class="signature-img" alt="Tanda Tangan" style="margin: 0;" />
                    ` : `
                      <!-- Default Stylized TTD Vector if no custom signature uploaded -->
                      <div class="default-tanda-tangan" style="margin-left: 0;">
                        <svg width="130" height="95" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M30 85C45 40 70 15 80 30C88 42 75 75 60 88C50 96 40 90 45 75C55 45 90 20 110 50C125 70 120 90 145 95" stroke="#334155" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M70 45L70 98" stroke="#334155" stroke-width="2.2" stroke-linecap="round"/>
                        </svg>
                      </div>
                    `}
                  </div>
                </div>

                <div class="signer-name">${formData.signerName}</div>
                <div class="signer-position">${formData.signerPosition}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);

    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 3000);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden animate-fadeIn">
      {/* Top Banner / Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Generator Surat Keterangan Kerja</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Template Resmi Liva
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Isi data karyawan, kebutuhan surat, dan cetak atau simpan langsung dalam format PDF resmi A4.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Kembali
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: 2-Columns (Form Input on Left, Live A4 Preview on Right) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT: FORM INPUT SECTION                                 */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Card 0: Kop Surat & Identitas Perusahaan */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Kop Surat & Perusahaan
                </h3>
              </div>

              <div className="space-y-3.5">
                {/* Logo Kop Surat Upload / Preset */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Logo Kop Surat</span>
                    {formData.kopLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, kopLogoUrl: '' }))}
                        className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Reset ke Logo Default</span>
                      </button>
                    )}
                  </label>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                      {formData.kopLogoUrl ? (
                        <img 
                          src={formData.kopLogoUrl} 
                          alt="Logo Preview" 
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-2xs">
                          <Briefcase className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*,.svg,.png,.jpg,.jpeg,.webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-slate-200"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formData.kopLogoUrl ? 'Ganti Logo Kop' : 'Upload Logo Kop Sendiri'}</span>
                      </button>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Format PNG, SVG, JPG atau WEBP transparan (Maks. 3MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Brand / Teks Kop <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.kopBrandName}
                      onChange={(e) => setFormData({ ...formData, kopBrandName: e.target.value })}
                      placeholder="Contoh: Liva"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tagline / Sub Kop
                    </label>
                    <input
                      type="text"
                      value={formData.kopBrandTagline}
                      onChange={(e) => setFormData({ ...formData, kopBrandTagline: e.target.value })}
                      placeholder="Specialist Live Shopping"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Legal PT / Badan Usaha <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Contoh: PT. Liva Media Kreatif"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Nama PT ini digunakan pada isi pernyataan surat dan cap stempel resmi.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 1: Data Karyawan */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Data Karyawan
                </h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Karyawan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    placeholder="Contoh: Dwi Ikhtiar Larasati"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NIK Karyawan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employeeNik}
                      onChange={(e) => setFormData({ ...formData, employeeNik: e.target.value })}
                      placeholder="1809025708030001"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jabatan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Host Live Shopping"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mulai Bekerja Sejak <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Keperluan Surat & Nomor Surat */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Hash className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Nomor & Keperluan Surat
                </h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Nomor Surat
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        letterNumber: `001/LIVA/SK/${currentRomanMonth}/${currentYear}`
                      }))}
                      className="text-[10px] text-indigo-600 font-semibold hover:underline"
                    >
                      Format Default
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.letterNumber}
                    onChange={(e) => setFormData({ ...formData, letterNumber: e.target.value })}
                    placeholder="001/LIVA/SK/IX/2026"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Surat ini dibuat untuk keperluan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Contoh: persyaratan pembuatan rekening payroll Maybank dan kartu ATM Maybank."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">Contoh cepat:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, purpose: 'persyaratan pembuatan rekening payroll Maybank dan kartu ATM Maybank.' })}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Rekening Payroll
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, purpose: 'pengajuan visa perjalanan dan keperluan administrasi kedutaan.' })}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Visa Perjalanan
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, purpose: 'kelengkapan administrasi pengajuan Kredit Pemilikan Rumah (KPR).' })}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                    >
                      KPR Bank
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Penandatangan & Lokasi */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <PenTool className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Penandatangan & Cap Stempel
                </h3>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kota Penerbitan
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Bandar Lampung"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Surat
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Penandatangan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.signerName}
                      onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                      placeholder="Mufthi Ali"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jabatan Penandatangan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.signerPosition}
                      onChange={(e) => setFormData({ ...formData, signerPosition: e.target.value })}
                      placeholder="Direktur PT Liva Media Kreatif"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Stempel & Upload TTD Custom */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.includeStamp}
                      onChange={(e) => setFormData({ ...formData, includeStamp: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Sertakan Stempel Merah Liva
                    </span>
                  </label>

                    <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                    {formData.signatureUrl ? (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, signatureUrl: '' })}
                        className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus TTD Upload</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Gambar TTD</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Pengatur Besar/Kecil Ukuran Tanda Tangan */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ukuran / Skala Tanda Tangan</span>
                    </label>
                    <span className="text-xs font-extrabold text-indigo-600 font-mono bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {formData.signatureScale}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, signatureScale: Math.max(50, prev.signatureScale - 10) }))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="Perkecil (-10%)"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="range"
                      min={50}
                      max={220}
                      step={5}
                      value={formData.signatureScale}
                      onChange={(e) => setFormData({ ...formData, signatureScale: Number(e.target.value) })}
                      className="flex-1 accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                    />

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, signatureScale: Math.min(220, prev.signatureScale + 10) }))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="Perbesar (+10%)"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Preset:</span>
                      {[
                        { label: 'Kecil', val: 75 },
                        { label: 'Normal', val: 100 },
                        { label: 'Besar', val: 135 },
                        { label: 'Ekstra', val: 175 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setFormData({ ...formData, signatureScale: preset.val })}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            formData.signatureScale === preset.val
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, signatureScale: 100 })}
                      className="text-[10px] text-slate-400 hover:text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Cetak / PDF Action */}
            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Download Surat PDF</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: LIVE A4 PREVIEW CONTAINER                          */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pratinjau Live Dokumen (A4)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">210mm x 297mm</span>
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
                      {formData.kopLogoUrl ? (
                        <img 
                          src={formData.kopLogoUrl} 
                          alt="Logo Kop" 
                          className="max-h-9 max-w-[120px] object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-xs">
                          <Briefcase className="w-4 h-4" />
                        </div>
                      )}
                      {(formData.kopBrandName || formData.kopBrandTagline) && (
                        <div>
                          {formData.kopBrandName && (
                            <div className="text-xl font-extrabold text-indigo-600 tracking-tight leading-none">
                              {formData.kopBrandName}
                            </div>
                          )}
                          {formData.kopBrandTagline && (
                            <div className="text-[7.5px] font-semibold text-slate-500 mt-0.5 tracking-wider">
                              {formData.kopBrandTagline}
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
                      No: {formData.letterNumber || '001/LIVA/SK/IX/2026'}
                    </p>
                  </div>

                  {/* Data Table */}
                  <div className="space-y-1 mb-5 text-[11px] sm:text-xs">
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">Nama Karyawan</span>
                      <span className="w-4 text-center">:</span>
                      <span className="flex-1 font-bold text-slate-900">{formData.employeeName || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">NIK Karyawan</span>
                      <span className="w-4 text-center">:</span>
                      <span className="flex-1 font-medium text-slate-800">{formData.employeeNik || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">Jabatan</span>
                      <span className="w-4 text-center">:</span>
                      <span className="flex-1 font-semibold text-slate-800">{formData.position || '-'}</span>
                    </div>
                  </div>

                  {/* Statement body */}
                  <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed mb-4 text-justify">
                    Adalah benar karyawan <strong>{formData.companyName}</strong> yang bekerja sebagai <strong>{formData.position}</strong> dan telah bekerja sejak <strong>{formatIndonesianDate(formData.startDate)}</strong> dengan sekarang.
                  </p>

                  <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed text-justify mb-8">
                    Demikian Surat Keterangan ini dibuat untuk {formData.purpose}
                  </p>

                  {/* Signature Section */}
                  <div className="w-56 mt-4">
                    <div className="text-[11px] sm:text-xs text-slate-700">
                      {formData.city},<br/>
                      {formatIndonesianDate(formData.date)}
                    </div>

                    <div className="h-20 my-1 relative flex items-center">
                      {/* Stamp badge */}
                      {formData.includeStamp && (
                        <div className="absolute left-0 top-3 border-2 border-rose-600/90 rounded-md px-2.5 py-1 bg-white/90 shadow-2xs rotate-[-4deg] z-10 flex items-center gap-1.5">
                          <div>
                            <div className="text-rose-600 font-black text-sm tracking-tight leading-none">
                              {formData.kopBrandName || 'Liva'}
                            </div>
                            <div className="text-[6px] font-bold text-rose-600 uppercase tracking-widest mt-0.5">
                              {formData.companyName}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Signature render with dynamic scale */}
                      <div 
                        className="relative z-20 ml-4 flex items-center origin-left transition-transform duration-150"
                        style={{ transform: `scale(${formData.signatureScale / 100})` }}
                      >
                        {formData.signatureUrl ? (
                          <img 
                            src={formData.signatureUrl} 
                            className="max-h-20 max-w-[150px] object-contain" 
                            alt="Signature" 
                          />
                        ) : (
                          <svg className="w-24 h-16 text-slate-700" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M30 85C45 40 70 15 80 30C88 42 75 75 60 88C50 96 40 90 45 75C55 45 90 20 110 50C125 70 120 90 145 95" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M70 45L70 98" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1">
                      {formData.signerName}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-600 font-medium">
                      {formData.signerPosition}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-[9px] text-slate-400 pt-4 flex justify-between items-center border-t border-slate-100">
                  <span>Dokumen Resmi • {formData.companyName}</span>
                  <span>Halaman 1 dari 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
