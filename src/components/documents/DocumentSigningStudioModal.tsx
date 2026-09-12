import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  PenTool, 
  CheckCircle2, 
  Clock, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  ExternalLink, 
  UploadCloud, 
  FileText, 
  Trash2, 
  RotateCcw, 
  FolderArchive, 
  Share2, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  Loader2, 
  Search, 
  MessageCircle, 
  AlertCircle 
} from 'lucide-react';
import { appApi } from '../../services/appApi';
import { SignedDocument, AssetFileItem, UserAccount } from '../../types/app';

interface DocumentSigningStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedAssets: AssetFileItem[];
  currentUser?: UserAccount | null;
  onDocumentSignedSuccess?: () => void;
}

export const DocumentSigningStudioModal: React.FC<DocumentSigningStudioModalProps> = ({
  isOpen,
  onClose,
  savedAssets,
  currentUser,
  onDocumentSignedSuccess,
}) => {
  // Tabs: 'new' (Buat Ttd Baru) vs 'list' (Daftar Berkas Ttd)
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');

  // STEP 1: Sumber Berkas (saved vs external)
  const [fileSource, setFileSource] = useState<'asset' | 'external'>('asset');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  
  // Custom file upload / input (diluar file yang disimpan)
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [customFileSize, setCustomFileSize] = useState<number | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // STEP 2: Mode Tanda Tangan (Internal vs Eksternal)
  const [signType, setSignType] = useState<'internal' | 'external'>('internal');

  // Internal Signer fields & Canvas
  const [internalSignerName, setInternalSignerName] = useState(() => currentUser?.full_name || 'Galang Taufik');
  const [internalSignerRole, setInternalSignerRole] = useState(() => currentUser?.position || 'Director / Founder');
  const [withCompanyStamp, setWithCompanyStamp] = useState(true);
  const [inkColor, setInkColor] = useState<'#0f172a' | '#1e3a8a'>('#0f172a');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // External Signer fields
  const [externalRecipientName, setExternalRecipientName] = useState('');
  const [externalRecipientRole, setExternalRecipientRole] = useState('');
  const [externalRecipientPhone, setExternalRecipientPhone] = useState('');
  const [externalNotes, setExternalNotes] = useState('');

  // Result state after creation
  const [createdDocResult, setCreatedDocResult] = useState<{
    id: string;
    signing_token: string;
    sign_type: 'internal' | 'external';
    title: string;
    share_url: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Document List State
  const [documentList, setDocumentList] = useState<SignedDocument[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<SignedDocument | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load Signed Documents List
  const loadDocuments = async () => {
    setLoadingList(true);
    try {
      const docs = await appApi.getSignedDocuments();
      setDocumentList(docs || []);
    } catch (err) {
      console.error('Failed to load signed documents:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
      setCreatedDocResult(null);
      if (savedAssets.length > 0 && !selectedAssetId) {
        setSelectedAssetId(savedAssets[0].id);
      }
    }
  }, [isOpen]);

  // Setup Canvas when signType === 'internal'
  useEffect(() => {
    if (!isOpen || signType !== 'internal' || activeTab !== 'new' || createdDocResult) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = inkColor;
    }
  }, [isOpen, signType, activeTab, inkColor, createdDocResult]);

  // Drawing Handlers for Internal Canvas
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
      e.preventDefault();
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

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Upload file from outside saved assets (via click or drag & drop)
  const processUploadedFile = async (file: File) => {
    if (!file) return;

    setIsUploadingFile(true);
    setCustomFileSize(file.size);
    try {
      const res = await appApi.uploadAssetFile(file);
      if (res.success && res.url) {
        setCustomUrl(res.url);
        const fileName = res.originalName || file.name;
        setCustomFileName(fileName);
        if (!customTitle.trim()) {
          setCustomTitle(fileName.replace(/\.[^/.]+$/, ''));
        }
      } else {
        alert('Gagal mengunggah berkas.');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah berkas.');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const handleRemoveCustomFile = () => {
    setCustomUrl('');
    setCustomFileName('');
    setCustomFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler: Create & Sign (Internal) or Create Link (External)
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    let docTitle = '';
    let docUrl = '';
    let docFileName = '';

    if (fileSource === 'asset') {
      const selected = savedAssets.find((a) => a.id === selectedAssetId);
      if (!selected) {
        alert('Silakan pilih salah satu file dari aset yang tersimpan.');
        return;
      }
      docTitle = selected.title;
      docUrl = selected.url;
      docFileName = selected.file_name || selected.title;
    } else {
      if (!customTitle.trim()) {
        alert('Silakan masukkan judul berkas / dokumen.');
        return;
      }
      docTitle = customTitle.trim();
      docUrl = customUrl.trim();
      docFileName = customFileName || docTitle;
    }

    let signatureDataUrl: string | null = null;
    if (signType === 'internal') {
      if (!hasDrawn || !canvasRef.current) {
        alert('Silakan bubuhkan goresan tanda tangan Anda pada kolom tanda tangan digital.');
        return;
      }
      if (!internalSignerName.trim()) {
        alert('Silakan masukkan nama penandatangan internal.');
        return;
      }
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    } else {
      if (!externalRecipientName.trim()) {
        alert('Silakan masukkan nama pihak penerima eksternal yang akan menandatangani.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: Partial<SignedDocument> = {
        title: docTitle,
        file_url: docUrl,
        file_name: docFileName,
        file_source: fileSource,
        sign_type: signType,
        signer_name: signType === 'internal' ? internalSignerName.trim() : externalRecipientName.trim(),
        signer_role: signType === 'internal' ? internalSignerRole.trim() : externalRecipientRole.trim(),
        signer_phone: externalRecipientPhone.trim(),
        signer_notes: externalNotes.trim(),
        signature_data_url: signatureDataUrl || undefined,
        created_by: currentUser?.full_name || 'Tim Liva',
      };

      const res = await appApi.createSignedDocument(payload);
      if (res.success) {
        // Construct clean public link
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/?sign_token=${res.signing_token}`;

        setCreatedDocResult({
          id: res.id,
          signing_token: res.signing_token,
          sign_type: signType,
          title: docTitle,
          share_url: shareUrl,
        });

        loadDocuments();
        if (onDocumentSignedSuccess) onDocumentSignedSuccess();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memproses tanda tangan dokumen.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!createdDocResult) return;
    navigator.clipboard.writeText(createdDocResult.share_url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data berkas "${title}"?`)) return;
    try {
      await appApi.deleteSignedDocument(id);
      loadDocuments();
      if (previewDoc?.id === id) setPreviewDoc(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus berkas.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full h-[92vh] max-h-[850px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="h-18 px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Ttd Berkas (Digital Document Signing)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Internal & Eksternal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tanda tangani berkas di tempat atau buat link tanda tangan publik tanpa perlu login
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs Toggle */}
            <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('new');
                  setCreatedDocResult(null);
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'new' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                + Buat Ttd Baru
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'list' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                <span>Daftar Berkas Ttd</span>
                {documentList.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center">
                    {documentList.length}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20">
          
          {activeTab === 'new' ? (
            /* TAB 1: CREATE NEW SIGNATURE OR VIEW CREATED RESULT */
            createdDocResult ? (
              /* RESULT SUCCESS CARD */
              <div className="max-w-xl mx-auto py-4 space-y-6 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {createdDocResult.sign_type === 'internal' ? 'Selesai Ditandatangani' : 'Tautan Ttd Eksternal Siap Digunakan'}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2.5">
                    {createdDocResult.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {createdDocResult.sign_type === 'internal'
                      ? 'Tanda tangan digital Anda telah berhasil disimpan dan disematkan ke dalam berkas.'
                      : 'Bagikan tautan berikut ke pihak eksternal (klien/mitra). Mereka dapat membuka & menandatangani langsung tanpa perlu login.'}
                  </p>
                </div>

                {createdDocResult.sign_type === 'external' ? (
                  /* External Link Box */
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-left space-y-3">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Link Tanda Tangan Publik (Tanpa Login):</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdDocResult.share_url}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Halo, mohon bantuan untuk membubuhkan tanda tangan digital pada berkas "${createdDocResult.title}" melalui tautan resmi Liva berikut (tanpa login):\n${createdDocResult.share_url}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Kirim via WhatsApp</span>
                      </a>

                      <a
                        href={createdDocResult.share_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Pratinjau Ttd</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Internal Signed Certificate */
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Penandatangan:</span>
                      <span className="font-bold text-slate-800">{internalSignerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Jabatan:</span>
                      <span className="font-medium text-slate-700">{internalSignerRole}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Status Dokumen:</span>
                      <span className="font-bold text-emerald-600">Sah & Selesai Ditandatangani</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedDocResult(null);
                      clearCanvas();
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    + Buat Ttd Berkas Baru Lagi
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Lihat di Daftar Berkas Ttd
                  </button>
                </div>
              </div>
            ) : (
              /* FORM: STEP 1 (SOURCE) & STEP 2 (SIGNATURE MODE) */
              <form onSubmit={handleCreateDocument} className="max-w-3xl mx-auto space-y-6">
                
                {/* 1. OPSI SUMBER BERKAS */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] flex items-center justify-center font-black">
                        1
                      </span>
                      <span>Pilih Sumber Berkas / Dokumen yang Ingin Ditandatangani</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5 ml-6">
                      Pilih dari koleksi file yang sudah disimpan di Asset File, atau gunakan berkas di luar sistem (upload file baru/link).
                    </p>
                  </div>

                  {/* Toggle: Dari File Tersimpan vs Diluar File Tersimpan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setFileSource('asset')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        fileSource === 'asset'
                          ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/10'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        fileSource === 'asset' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <FolderArchive className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Dari File yang Tersimpan
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Pilih berkas/link yang sudah ada di Asset File ({savedAssets.length} file)
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFileSource('external')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        fileSource === 'external'
                          ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/10'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        fileSource === 'external' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Diluar File yang Disimpan
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Unggah file dokumen baru (PDF/Gambar) atau masukkan judul dokumen baru
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Input Based on File Source */}
                  {fileSource === 'asset' ? (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Pilih Berkas dari Asset File <span className="text-rose-500">*</span>
                      </label>
                      {savedAssets.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                          Belum ada file di Asset File. Silakan gunakan opsi <strong>"Diluar File yang Disimpan"</strong> di atas.
                        </div>
                      ) : (
                        <select
                          value={selectedAssetId}
                          onChange={(e) => setSelectedAssetId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          {savedAssets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              [{asset.type.toUpperCase()}] {asset.title} {asset.project_type ? `(${asset.project_type})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3.5 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Judul / Nama Dokumen <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="Contoh: Surat Perjanjian Kerjasama Live Streaming Somethinc"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Drag and Drop or Select File (Link Input Dihapus) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          File Dokumen <span className="text-slate-400 font-normal">(Drag & Drop atau Pilih File)</span>
                        </label>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />

                        {customFileName || customUrl ? (
                          /* Card File Terunggah */
                          <div className="bg-indigo-50/50 border border-indigo-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                                    {customFileName || 'Berkas Dokumen'}
                                  </p>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1 shrink-0">
                                    <Check className="w-3 h-3" /> Berhasil Diunggah
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {customFileSize ? formatFileSize(customFileSize) : 'Berkas siap ditandatangani'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {customUrl && (
                                <a
                                  href={customUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer"
                                  title="Buka Pratinjau Berkas"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingFile}
                                className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                              >
                                Ganti File
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveCustomFile}
                                className="p-2 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                                title="Hapus Berkas"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Dropzone Area Drag & Drop / Pilih File */
                          <div
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer select-none ${
                              isDraggingFile
                                ? 'border-indigo-500 bg-indigo-50/80 ring-4 ring-indigo-500/10 scale-[1.005]'
                                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30'
                            }`}
                          >
                            {isUploadingFile ? (
                              <div className="py-2 flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                <p className="text-xs font-bold text-slate-800">Sedang mengunggah berkas dokumen...</p>
                                <p className="text-[11px] text-slate-400">Mohon tunggu sebentar hingga proses selesai</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-2.5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                  isDraggingFile ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-100/70 text-indigo-600'
                                }`}>
                                  <UploadCloud className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">
                                    {isDraggingFile ? 'Lepaskan berkas di sini untuk mengunggah' : 'Tarik & lepas file berkas ke sini, atau klik untuk memilih file'}
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Mendukung PDF, Word (.docx), atau Gambar (PNG, JPG) hingga 25MB
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="mt-1 px-4 py-1.5 bg-white border border-slate-200 text-indigo-600 text-xs font-bold rounded-xl shadow-2xs pointer-events-none"
                                >
                                  Pilih File dari Komputer / HP
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. PILIHAN MODE TANDA TANGAN (INTERNAL VS EKSTERNAL) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] flex items-center justify-center font-black">
                        2
                      </span>
                      <span>Pilih Jenis Penandatanganan (Internal vs Eksternal)</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5 ml-6">
                      Pilih apakah Anda ingin langsung menandatangani di sini (Internal), atau membuatkan tautan khusus untuk ditandatangani orang lain (Eksternal).
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setSignType('internal')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        signType === 'internal'
                          ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/10'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        signType === 'internal' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <PenTool className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Tanda Tangan Internal
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Langsung tanda tangan di situ menggunakan canvas digital sekarang
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignType('external')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        signType === 'external'
                          ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/10'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        signType === 'external' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Tanda Tangan Eksternal
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Buat link publik untuk di-share ke orang lain (buka tanpa login)
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* FORM FIELDS FOR INTERNAL MODE */}
                  {signType === 'internal' ? (
                    <div className="space-y-4 pt-3 border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Penandatangan <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={internalSignerName}
                            onChange={(e) => setInternalSignerName(e.target.value)}
                            placeholder="Nama Lengkap"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Jabatan / Peran
                          </label>
                          <input
                            type="text"
                            value={internalSignerRole}
                            onChange={(e) => setInternalSignerRole(e.target.value)}
                            placeholder="Contoh: Director / PIC Media"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Canvas Pad */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Goreskan Tanda Tangan Digital Anda</span>
                            <span className="text-rose-500">*</span>
                          </label>

                          <div className="flex items-center gap-2">
                            {/* Ink Color */}
                            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                              <button
                                type="button"
                                onClick={() => setInkColor('#0f172a')}
                                className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer ${
                                  inkColor === '#0f172a' ? 'bg-white shadow-2xs' : ''
                                }`}
                                title="Tinta Hitam Formal"
                              >
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setInkColor('#1e3a8a')}
                                className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer ${
                                  inkColor === '#1e3a8a' ? 'bg-white shadow-2xs' : ''
                                }`}
                                title="Tinta Biru Resmi"
                              >
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={clearCanvas}
                              disabled={!hasDrawn}
                              className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Ulangi</span>
                            </button>
                          </div>
                        </div>

                        <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl bg-white p-2 transition-colors touch-none overflow-hidden">
                          <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full h-36 bg-slate-50/50 rounded-xl cursor-crosshair shadow-inner"
                          />

                          {!hasDrawn && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                              <PenTool className="w-5 h-5 text-slate-300" />
                              <span>Goreskan tanda tangan dengan mouse atau sentuhan jari</span>
                            </div>
                          )}

                          <div className="absolute bottom-3 left-5 pointer-events-none text-[9px] text-slate-300 font-bold uppercase tracking-wider">
                            Signature Pad Liva Agency
                          </div>
                        </div>
                      </div>

                      {/* Optional Seal / Stamp Checkbox */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="stamp_check"
                          checked={withCompanyStamp}
                          onChange={(e) => setWithCompanyStamp(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="stamp_check" className="text-xs text-slate-600 cursor-pointer select-none">
                          Bubuhkan stempel digital resmi & cap verifikasi otomatis Liva Media Kreatif
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* FORM FIELDS FOR EXTERNAL MODE */
                    <div className="space-y-4 pt-3 border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Penerima / Pihak Eksternal <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={externalRecipientName}
                            onChange={(e) => setExternalRecipientName(e.target.value)}
                            placeholder="Contoh: Amanda (Brand Manager Wardah)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Jabatan / Perusahaan (Opsional)
                          </label>
                          <input
                            type="text"
                            value={externalRecipientRole}
                            onChange={(e) => setExternalRecipientRole(e.target.value)}
                            placeholder="Contoh: Client Representative"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          No. WhatsApp Penerima (Opsional, untuk share langsung)
                        </label>
                        <input
                          type="tel"
                          value={externalRecipientPhone}
                          onChange={(e) => setExternalRecipientPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Pesan / Instruksi untuk Penerima (Opsional)
                        </label>
                        <textarea
                          rows={2}
                          value={externalNotes}
                          onChange={(e) => setExternalNotes(e.target.value)}
                          placeholder="Contoh: Mohon review dan tandatangani berkas MoU ini paling lambat hari Jumat. Terima kasih!"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <strong>Tautan Khusus Tanpa Perlu Login:</strong> Setelah tombol di bawah ditekan, sistem akan mengenerate link khusus. Pihak penerima dapat langsung membuka link tersebut dari ponsel atau laptop mereka tanpa harus memiliki akun atau login ke sistem.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Action Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : signType === 'internal' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simpan & Tandatangani Berkas</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4" />
                        <span>Buat Tautan Tanda Tangan Eksternal</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          ) : (
            /* TAB 2: DAFTAR BERKAS TTD (SIGNED DOCUMENTS LIST) */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Semua Berkas & Permintaan Tanda Tangan ({documentList.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Riwayat dokumen internal yang telah ditandatangani dan link tanda tangan eksternal
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadDocuments}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingList ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
                  <span>Memuat daftar berkas...</span>
                </div>
              ) : documentList.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Belum Ada Dokumen Ditandatangani</div>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Mulai buat tanda tangan internal atau bagikan tautan tanda tangan untuk pihak eksternal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Buat Ttd Berkas Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentList.map((doc) => {
                    const isSigned = doc.status === 'signed';
                    const publicLink = `${window.location.origin}/?sign_token=${doc.signing_token}`;

                    return (
                      <div
                        key={doc.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isSigned
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {isSigned ? '✓ Sudah Ditandatangani' : '⏳ Menunggu TTD Eksternal'}
                            </span>

                            <span className="text-[10px] font-semibold text-slate-400">
                              {doc.sign_type === 'internal' ? 'Internal' : 'Eksternal'}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {doc.title}
                          </h4>

                          <div className="text-xs text-slate-500 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">Penandatangan:</span>
                              <span className="font-semibold text-slate-800">{doc.signer_name || '-'}</span>
                              {doc.signer_role && (
                                <span className="text-slate-400">({doc.signer_role})</span>
                              )}
                            </div>

                            {isSigned && doc.signed_at && (
                              <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  Ditandatangani pada: {new Date(doc.signed_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons on card */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {/* Preview Signature Modal */}
                            {isSigned && doc.signature_data_url && (
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat Bukti Ttd</span>
                              </button>
                            )}

                            {/* Copy Public Link (if external) */}
                            {doc.sign_type === 'external' && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(publicLink);
                                  alert('Link tanda tangan berhasil disalin!');
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                title="Salin Link Tanda Tangan"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Salin Link</span>
                              </button>
                            )}

                            {/* Open Original File if available */}
                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Buka berkas file"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc.id, doc.title)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus berkas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="h-14 px-6 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tanda tangan digital terenkripsi dengan sertifikat resmi Liva Media Kreatif</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* PREVIEW SIGNED DOCUMENT MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Bukti Tanda Tangan Digital</h4>
                <p className="text-[10px] text-slate-400">{previewDoc.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Penandatangan:</span>
                <span className="font-bold text-slate-800">{previewDoc.signer_name}</span>
              </div>
              {previewDoc.signer_role && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jabatan:</span>
                  <span className="font-medium text-slate-700">{previewDoc.signer_role}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tanggal Ditandatangani:</span>
                <span className="font-medium text-slate-700">
                  {previewDoc.signed_at ? new Date(previewDoc.signed_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Token Verifikasi:</span>
                <span className="font-mono text-[10px] text-indigo-600 font-semibold">{previewDoc.signing_token}</span>
              </div>
            </div>

            {previewDoc.signature_data_url && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center space-y-2 shadow-inner">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Spesimen Tanda Tangan
                </div>
                <img
                  src={previewDoc.signature_data_url}
                  alt="Tanda Tangan"
                  className="max-h-24 mx-auto object-contain"
                />
                <div className="text-xs font-bold text-slate-800 border-t border-slate-100 pt-2">
                  ( {previewDoc.signer_name} )
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
