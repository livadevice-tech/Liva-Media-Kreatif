import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  PenTool, 
  ShieldCheck, 
  FileCheck2, 
  ExternalLink, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  FileText, 
  QrCode, 
  Link2, 
  Image as ImageIcon, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Share2
} from 'lucide-react';
import { appApi } from '../../services/appApi';
import { AssetFileItem, UserAccount, SignedDocument } from '../../types/app';
import { DocumentSigningStudioModal } from '../documents/DocumentSigningStudioModal';

interface ToolsViewProps {
  currentUser?: UserAccount | null;
  savedAssets?: AssetFileItem[];
  onNavigateToAssets?: () => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  currentUser,
  savedAssets = [],
  onNavigateToAssets,
}) => {
  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
  const [signedDocs, setSignedDocs] = useState<SignedDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'documents' | 'media' | 'utility'>('all');

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const docs = await appApi.getSignedDocuments();
      setSignedDocs(docs);
    } catch (e) {
      console.warn('Gagal memuat dokumen bertanda tangan:', e);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const completedCount = signedDocs.filter(d => d.status === 'completed').length;
  const pendingCount = signedDocs.filter(d => d.status === 'pending').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/60 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-5 shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-100">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Tools & Productivity Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Hub Utilitas
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kumpulan alat bantu kerja profesional, digital signature (tanda tangan berkas), dan generator utilitas agensi.
            </p>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-1.5 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{completedCount} Berkas Ditandatangani</span>
            </div>
            {pendingCount > 0 && (
              <>
                <div className="w-px h-3.5 bg-slate-200" />
                <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{pendingCount} Menunggu</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Featured Hero Banner: E-Sign (Ttd File) */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Alat Utama Unggulan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                E-Sign Studio (Ttd Berkas Digital)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tanda tangani dokumen kontrak, invoice, SPK, dan persetujuan secara digital langsung di atas PDF (internal) atau bagikan tautan tanda tangan resmi untuk klien eksternal tanpa perlu login.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verifikasi Stempel Resmi & Token Kripto
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Visual Interactive Placement PDF
                </span>
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  Akses Publik Klien Instan
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsSigningModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <PenTool className="w-4 h-4" />
                <span>Buka E-Sign Studio</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories / Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'Semua Tools' },
              { id: 'documents', label: 'Dokumen & Legal' },
              { id: 'media', label: 'Media & Aset' },
              { id: 'utility', label: 'Utilitas Tambahan' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-semibold text-slate-400">
            {signedDocs.length} Total Berkas Dikelola
          </span>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* TOOL 1: E-Sign (Ttd File) */}
          {(activeCategory === 'all' || activeCategory === 'documents') && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Aktif & Terintegrasi
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  E-Sign (Tanda Tangan Berkas)
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Studio digital signature untuk dokumen PDF/kontrak/invoice. Tanda tangani langsung di canvas atau undang klien via tautan publik yang aman.
                </p>

                {/* Substats */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-50 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400 font-medium">Selesai</div>
                    <div className="font-bold text-slate-800">{completedCount} Dokumen</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400 font-medium">Menunggu</div>
                    <div className="font-bold text-amber-700">{pendingCount} Dokumen</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsSigningModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Buka E-Sign (Ttd File)</span>
                </button>
              </div>
            </div>
          )}

          {/* TOOL 2: Media Asset Hub Shortcut */}
          {(activeCategory === 'all' || activeCategory === 'media') && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Penyimpanan Terpusat
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Asset & Media Hub
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Kelola tautan master Google Drive, Figma canvas, template Canva, dan unggahan foto/dokumen untuk proyek internal maupun klien.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                  <span>Aset Tersimpan:</span>
                  <span className="font-bold text-slate-800">{savedAssets.length} Aset</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onNavigateToAssets}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Kelola di Asset File</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TOOL 3: Quick PDF / Document Inspector */}
          {(activeCategory === 'all' || activeCategory === 'documents') && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    Riwayat Ttd
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Daftar Berkas Bertanda Tangan
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Pantau status dokumen yang sedang berjalan, salin tautan verifikasi penandatanganan klien, atau unduh hasil PDF yang sudah tertera stempel resmi.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  {signedDocs.slice(0, 2).map((doc) => (
                    <div key={doc.id} className="text-[11px] flex items-center justify-between text-slate-600 truncate">
                      <span className="truncate max-w-[170px] font-medium">• {doc.title}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        doc.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {doc.status === 'completed' ? 'Selesai' : 'Menunggu'}
                      </span>
                    </div>
                  ))}
                  {signedDocs.length === 0 && (
                    <div className="text-[11px] text-slate-400 italic">Belum ada dokumen yang dibuat</div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSigningModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Lihat Seluruh Dokumen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TOOL 4: QR Code & Fast Share Generator */}
          {(activeCategory === 'all' || activeCategory === 'utility') && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between opacity-90">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Segera Hadir
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  QR Code & Link Shortener
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Buat kode QR instan untuk materi cetak, standing banner acara, atau kartu nama yang mengarah langsung ke portofolio atau media kit agency.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 font-semibold">Dalam Pengembangan v2.1</span>
              </div>
            </div>
          )}

          {/* TOOL 5: AI Copy & Prompt Enhancer */}
          {(activeCategory === 'all' || activeCategory === 'utility') && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between opacity-90">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Segera Hadir
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  AI Caption & Brief Generator
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Asisten penulisan caption media sosial instan dengan berbagai tone of voice (formal, santai, promo hard-selling, atau edukasi).
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 font-semibold">Dalam Pengembangan v2.1</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Signing Studio Modal */}
      <DocumentSigningStudioModal
        isOpen={isSigningModalOpen}
        onClose={() => {
          setIsSigningModalOpen(false);
          loadDocuments();
        }}
        savedAssets={savedAssets}
        currentUser={currentUser}
        onDocumentSignedSuccess={() => {
          loadDocuments();
        }}
      />
    </div>
  );
};
