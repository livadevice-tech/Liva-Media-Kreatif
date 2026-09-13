import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  RotateCcw, 
  ShieldCheck, 
  PenTool, 
  Building, 
  User, 
  Clock, 
  Download, 
  Lock,
  Sparkles,
  Eye,
  Check
} from 'lucide-react';
import { appApi } from '../../services/appApi';
import { SignedDocument } from '../../types/app';
import { InteractivePdfDocumentSigner, SignaturePlacement } from './InteractivePdfDocumentSigner';

interface PublicDocumentSigningViewProps {
  token: string;
}

export const PublicDocumentSigningView: React.FC<PublicDocumentSigningViewProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<SignedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [signedAtTimestamp, setSignedAtTimestamp] = useState<string>('');
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);

  // Placed Signature on PDF
  const [placedSignatureData, setPlacedSignatureData] = useState<string | null>(null);
  const [placedPosition, setPlacedPosition] = useState<SignaturePlacement | null>(null);

  // Canvas Signature Pad (Fallback / Local)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [inkColor, setInkColor] = useState<'#0f172a' | '#1e3a8a'>('#0f172a');

  // Load Document Details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    appApi.getPublicDocumentForSigning(token)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.document) {
          setDocument(res.document);
          setSignerName(res.document.signer_name || '');
          setSignerRole(res.document.signer_role || '');
          if (res.document.signed_file_url) {
            setSignedPdfUrl(res.document.signed_file_url);
          }
          if (res.document.signature_position) {
            try {
              const parsed = typeof res.document.signature_position === 'string'
                ? JSON.parse(res.document.signature_position)
                : res.document.signature_position;
              setPlacedPosition(parsed);
            } catch (e) {
              console.warn('Failed to parse signature_position', e);
            }
          }
          if (res.document.status === 'signed') {
            setIsSuccess(true);
            setSignedAtTimestamp(res.document.signed_at || '');
          }
        } else {
          setError('Dokumen tidak ditemukan atau tautan sudah tidak berlaku.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Gagal memuat dokumen tanda tangan.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Canvas Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = inkColor;
  }, [document, isSuccess, inkColor]);

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if ('touches' in e) {
      e.preventDefault(); // prevent touch scroll
    }

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    const signatureData = placedSignatureData || (hasDrawn && canvasRef.current ? canvasRef.current.toDataURL('image/png') : null);
    if (!signatureData) {
      alert('Silakan bubuhkan tanda tangan Anda langsung pada lembar dokumen PDF di bawah.');
      return;
    }
    if (!signerName.trim()) {
      alert('Silakan masukkan nama lengkap penandatangan.');
      return;
    }
    if (!consentChecked) {
      alert('Silakan setujui pernyataan keabsahan tanda tangan digital.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await appApi.submitPublicSignature(token, {
        signature_data_url: signatureData,
        signature_position: placedPosition,
        signer_name: signerName.trim(),
        signer_role: signerRole.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
        setSignedAtTimestamp(res.signed_at || new Date().toISOString());
        setSignedPdfUrl(res.signed_file_url || null);
        setDocument((prev) => prev ? {
          ...prev,
          status: 'signed',
          signer_name: signerName,
          signer_role: signerRole,
          signature_data_url: signatureData,
          signed_file_url: res.signed_file_url || prev.signed_file_url,
          signed_at: res.signed_at || new Date().toISOString(),
        } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim tanda tangan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadProof = () => {
    if (!document) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Bukti Tanda Tangan Digital - ${document.title}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 650px; margin: 0 auto; line-height: 1.6; }
              .header { border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
              .badge { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 12px; }
              .detail { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; }
              .signature-box { border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-top: 24px; }
              .footer { margin-top: 40px; font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h2 style="margin: 0; color: #4f46e5;">Liva Media Kreatif</h2>
                <div style="font-size: 12px; color: #64748b;">Official Digital Signature Certificate</div>
              </div>
              <div class="badge">VERIFIED SIGNED</div>
            </div>
            <h3>${document.title}</h3>
            <div class="detail">
              <p><strong>Nama Penandatangan:</strong> ${signerName || document.signer_name}</p>
              <p><strong>Jabatan / Lembaga:</strong> ${signerRole || document.signer_role || '-'}</p>
              <p><strong>Waktu Penandatanganan:</strong> ${signedAtTimestamp ? new Date(signedAtTimestamp).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' }) : new Date().toLocaleString('id-ID')}</p>
              <p><strong>Status Berkas:</strong> Berhasil Ditandatangani Secara Sah</p>
              <p><strong>Token Dokumen:</strong> ${token}</p>
            </div>
            ${document.signature_data_url ? `
              <div class="signature-box">
                <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Spesimen Tanda Tangan Digital:</div>
                <img src="${document.signature_data_url}" style="max-height: 120px; max-width: 250px;" alt="Signature" />
                <div style="font-size: 11px; font-weight: bold; margin-top: 8px;">( ${signerName || document.signer_name} )</div>
              </div>
            ` : ''}
            <div class="footer">
              Sertifikat tanda tangan ini dihasilkan secara otomatis oleh sistem Liva Media Kreatif dan memiliki kekuatan pembuktian digital yang mengikat.
            </div>
          </body>
        </html>
      `);
      win.document.close();
      win.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Memuat Dokumen...</h3>
            <p className="text-xs text-slate-400 mt-1">Menyiapkan portal tanda tangan digital aman</p>
          </div>
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Tautan Tidak Tersedia</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {error || 'Dokumen yang Anda cari tidak ditemukan atau masa berlaku tautan telah habis.'}
            </p>
          </div>
          <a
            href="/"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white flex flex-col">
      {/* Top Brand Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            L
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Liva Media Kreatif
            </h1>
            <p className="text-[10px] font-semibold text-slate-400">
              Portal Tanda Tangan Berkas Digital Resmi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Koneksi Aman & Terverifikasi</span>
          <span className="sm:hidden">Aman</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {isSuccess ? (
          /* SUCCESS STATE: DOCUMENT SIGNED */
          <div className="bg-white border border-emerald-200/80 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Dokumen Berhasil Ditandatangani
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3">
                {document.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Terima kasih, tanda tangan digital Anda telah berhasil terekam dan tersimpan secara sah ke dalam sistem.
              </p>
            </div>

            {/* Signed Info Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 max-w-lg mx-auto text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Penandatangan:</span>
                <span className="font-bold text-slate-800">{signerName || document.signer_name}</span>
              </div>
              {signerRole && (
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400">Jabatan / Lembaga:</span>
                  <span className="font-medium text-slate-800">{signerRole}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Waktu Penandatanganan:</span>
                <span className="font-medium text-slate-800">
                  {signedAtTimestamp ? new Date(signedAtTimestamp).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Token Sertifikat:</span>
                <span className="font-mono text-[11px] text-indigo-600 font-semibold">{token}</span>
              </div>
            </div>

            {/* Live Stamped PDF Document Preview */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Pratinjau Dokumen PDF Resmi Bertanda Tangan:</span>
                </span>
                {(signedPdfUrl || document.signed_file_url) && (
                  <a
                    href={signedPdfUrl || document.signed_file_url!}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF Resmi</span>
                  </a>
                )}
              </div>
              <InteractivePdfDocumentSigner
                isReadOnlyPreview={true}
                signedPdfUrl={signedPdfUrl || document.signed_file_url}
                fileUrl={document.file_url}
                fileName={document.file_name}
                documentTitle={document.title}
                signerName={signerName || document.signer_name}
                signerRole={signerRole || document.signer_role || ''}
                initialSignatureDataUrl={document.signature_data_url || placedSignatureData}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {(signedPdfUrl || document.signed_file_url) && (
                <a
                  href={signedPdfUrl || document.signed_file_url!}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen PDF Resmi</span>
                </a>
              )}

              <button
                type="button"
                onClick={downloadProof}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Cetak Lembar Sertifikat</span>
              </button>

              {document.file_url && (
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Buka Berkas Asli</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          /* FORM STATE: PROCEED WITH SIGNING */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Document Header Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Menunggu Tanda Tangan Anda
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Diterbitkan oleh Liva Media Kreatif
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {document.title}
                  </h2>
                </div>

                {document.file_url && (
                  <a
                    href={document.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat & Baca Berkas</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
              </div>

              {document.signer_notes && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
                  <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Pesan / Pengantar Berkas:</span>
                  </div>
                  {document.signer_notes}
                </div>
              )}
            </div>

            {/* Signature Form */}
            <form onSubmit={handleSubmitSignature} className="space-y-6">
              {/* Signer Identity Box */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Identitas Penandatangan</span>
                </h3>

                <div className="max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Lengkap Anda <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Contoh: Amanda Putri"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive PDF Document Signer */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-indigo-600" />
                      <span>Lembar Dokumen PDF & Bubuhkan Tanda Tangan Langsung</span>
                      <span className="text-rose-500">*</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Klik lembar dokumen atau geser kotak tanda tangan ke posisi yang sesuai, lalu tekan tombol <strong>"Goreskan Ttd"</strong>.
                    </p>
                  </div>
                  {placedSignatureData && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Tanda Tangan Tertempel di Lembar PDF
                    </span>
                  )}
                </div>

                <InteractivePdfDocumentSigner
                  fileUrl={document.file_url}
                  fileName={document.file_name}
                  documentTitle={document.title}
                  signerName={signerName || document.signer_name || 'Penandatangan'}
                  signerRole={signerRole || document.signer_role || ''}
                  initialSignatureDataUrl={placedSignatureData}
                  initialPosition={placedPosition}
                  onSignatureChange={(sig) => setPlacedSignatureData(sig)}
                  onPositionChange={(pos) => setPlacedPosition(pos)}
                />
              </div>

              {/* Legal Consent Checkbox */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent_check"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="consent_check" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                  Saya menyatakan bahwa saya adalah pihak yang berwenang untuk menandatangani dokumen ini. Tanda tangan digital ini dibubuhkan secara sadar dan memiliki keabsahan hukum atas persetujuan berkas <strong>{document.title}</strong>.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !placedSignatureData || !signerName.trim() || !consentChecked}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses & Menyimpan Tanda Tangan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tandatangani & Kirim Dokumen Sekarang</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Liva Media Kreatif • Layanan Digital Document Signing
      </footer>
    </div>
  );
};
