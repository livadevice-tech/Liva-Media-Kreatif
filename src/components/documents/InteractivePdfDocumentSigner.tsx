import React, { useState, useEffect, useRef } from 'react';
import {
  PenTool,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  FileText,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export interface SignaturePlacement {
  page: number;
  xPercent: number; // 0 to 1 relative to document width
  yPercent: number; // 0 to 1 relative to document height from top
  widthPercent: number; // e.g. 0.28 (28% of document width)
  signerName: string;
  signerRole: string;
  withCompanyStamp: boolean;
  inkColor: '#0f172a' | '#1e3a8a';
}

interface InteractivePdfDocumentSignerProps {
  fileUrl?: string | null;
  fileName?: string | null;
  documentTitle: string;
  signerName: string;
  signerRole: string;
  isReadOnlyPreview?: boolean; // If true, only shows final stamped document
  signedPdfUrl?: string | null;
  initialSignatureDataUrl?: string | null;
  initialPosition?: Partial<SignaturePlacement> | null;
  onSignatureChange?: (signatureDataUrl: string | null) => void;
  onPositionChange?: (position: SignaturePlacement) => void;
}

export const InteractivePdfDocumentSigner: React.FC<InteractivePdfDocumentSignerProps> = ({
  fileUrl,
  fileName,
  documentTitle,
  signerName,
  signerRole,
  isReadOnlyPreview = false,
  signedPdfUrl,
  initialSignatureDataUrl = null,
  initialPosition = null,
  onSignatureChange,
  onPositionChange,
}) => {
  // Document Page state
  const [currentPage, setCurrentPage] = useState(initialPosition?.page || 1);
  const [numPages, setNumPages] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.1);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  const [isPdfDocument, setIsPdfDocument] = useState(false);
  const [isImageDocument, setIsImageDocument] = useState(false);

  // Canvas Refs
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [documentDimensions, setDocumentDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 840,
  });

  // Signature Position & State
  const [signaturePlacement, setSignaturePlacement] = useState<SignaturePlacement>({
    page: initialPosition?.page || 1,
    xPercent: initialPosition?.xPercent !== undefined ? initialPosition.xPercent : 0.60,
    yPercent: initialPosition?.yPercent !== undefined ? initialPosition.yPercent : 0.72,
    widthPercent: initialPosition?.widthPercent || 0.28,
    signerName: signerName || 'Penandatangan',
    signerRole: signerRole || '',
    withCompanyStamp: initialPosition?.withCompanyStamp !== undefined ? initialPosition.withCompanyStamp : true,
    inkColor: initialPosition?.inkColor || '#0f172a',
  });

  // Signature Draw Pad State
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(initialSignatureDataUrl);
  const [isSignPadOpen, setIsSignPadOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnInPad, setHasDrawnInPad] = useState(false);
  const signPadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dragging Signature Box State
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialXPercent: number; initialYPercent: number }>({
    startX: 0,
    startY: 0,
    initialXPercent: 0.6,
    initialYPercent: 0.72,
  });

  // Determine file type
  useEffect(() => {
    const targetUrl = signedPdfUrl || fileUrl;
    if (!targetUrl) {
      setIsPdfDocument(false);
      setIsImageDocument(false);
      return;
    }
    const cleanUrl = targetUrl.split('?')[0].toLowerCase();
    if (cleanUrl.endsWith('.pdf')) {
      setIsPdfDocument(true);
      setIsImageDocument(false);
    } else if (['.png', '.jpg', '.jpeg', '.webp'].some((ext) => cleanUrl.endsWith(ext))) {
      setIsPdfDocument(false);
      setIsImageDocument(true);
    } else {
      setIsPdfDocument(false);
      setIsImageDocument(false);
    }
  }, [fileUrl, signedPdfUrl]);

  // Update signer info in placement
  useEffect(() => {
    setSignaturePlacement((prev) => {
      const updated = {
        ...prev,
        signerName: signerName || prev.signerName,
        signerRole: signerRole || prev.signerRole,
      };
      onPositionChange?.(updated);
      return updated;
    });
  }, [signerName, signerRole]);

  // Load and Render PDF
  useEffect(() => {
    const targetUrl = signedPdfUrl || fileUrl;
    if (!targetUrl || !isPdfDocument) return;

    let isCancelled = false;
    setIsLoadingPdf(true);
    setPdfLoadError(null);

    const renderPage = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: targetUrl,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        setNumPages(pdf.numPages);
        const safePageNum = Math.min(Math.max(1, currentPage), pdf.numPages);
        const page = await pdf.getPage(safePageNum);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: zoomScale });
        const canvas = pdfCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // High DPI Support
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        setDocumentDimensions({
          width: viewport.width,
          height: viewport.height,
        });

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        setIsLoadingPdf(false);
      } catch (err: any) {
        console.error('PDF render error:', err);
        if (!isCancelled) {
          setPdfLoadError(err.message || 'Gagal memuat pratinjau PDF.');
          setIsLoadingPdf(false);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl, signedPdfUrl, isPdfDocument, currentPage, zoomScale]);

  // Setup Signature Pad Canvas
  useEffect(() => {
    if (!isSignPadOpen) return;
    const canvas = signPadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = signaturePlacement.inkColor;
  }, [isSignPadOpen, signaturePlacement.inkColor]);

  // Handle Dragging of Signature Box across Document
  const handleMouseDownOnBox = (e: React.MouseEvent) => {
    if (isReadOnlyPreview) return;
    e.stopPropagation();
    setIsDraggingBox(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialXPercent: signaturePlacement.xPercent,
      initialYPercent: signaturePlacement.yPercent,
    };
  };

  const handleTouchStartOnBox = (e: React.TouchEvent) => {
    if (isReadOnlyPreview) return;
    e.stopPropagation();
    setIsDraggingBox(true);
    dragStartRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      initialXPercent: signaturePlacement.xPercent,
      initialYPercent: signaturePlacement.yPercent,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingBox || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const newXPercent = Math.max(0.02, Math.min(0.95 - signaturePlacement.widthPercent, dragStartRef.current.initialXPercent + deltaX / rect.width));
      const newYPercent = Math.max(0.02, Math.min(0.88, dragStartRef.current.initialYPercent + deltaY / rect.height));

      const updated = {
        ...signaturePlacement,
        page: currentPage,
        xPercent: newXPercent,
        yPercent: newYPercent,
      };
      setSignaturePlacement(updated);
      onPositionChange?.(updated);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingBox || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = e.touches[0].clientX - dragStartRef.current.startX;
      const deltaY = e.touches[0].clientY - dragStartRef.current.startY;

      const newXPercent = Math.max(0.02, Math.min(0.95 - signaturePlacement.widthPercent, dragStartRef.current.initialXPercent + deltaX / rect.width));
      const newYPercent = Math.max(0.02, Math.min(0.88, dragStartRef.current.initialYPercent + deltaY / rect.height));

      const updated = {
        ...signaturePlacement,
        page: currentPage,
        xPercent: newXPercent,
        yPercent: newYPercent,
      };
      setSignaturePlacement(updated);
      onPositionChange?.(updated);
    };

    const handleMouseUp = () => {
      setIsDraggingBox(false);
    };

    if (isDraggingBox) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingBox, signaturePlacement, currentPage, onPositionChange]);

  // Click on Document Page to reposition Signature Box
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReadOnlyPreview || isDraggingBox) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.max(0.02, Math.min(0.95 - signaturePlacement.widthPercent, (clickX - 60) / rect.width));
    const yPercent = Math.max(0.02, Math.min(0.85, (clickY - 30) / rect.height));

    const updated = {
      ...signaturePlacement,
      page: currentPage,
      xPercent,
      yPercent,
    };
    setSignaturePlacement(updated);
    onPositionChange?.(updated);
  };

  // Sign Pad Drawing
  const startDrawingInPad = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signPadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const drawInPad = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signPadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if ('touches' in e) e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawnInPad(true);
  };

  const clearSignPad = () => {
    const canvas = signPadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnInPad(false);
  };

  const saveSignatureFromPad = () => {
    const canvas = signPadCanvasRef.current;
    if (!canvas || !hasDrawnInPad) {
      alert('Silakan goreskan tanda tangan Anda terlebih dahulu.');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
    onSignatureChange?.(dataUrl);
    setIsSignPadOpen(false);
  };

  return (
    <div className="w-full flex flex-col bg-slate-900/95 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl">
      {/* 1. TOP VIEWER TOOLBAR */}
      <div className="bg-slate-800/90 px-4 py-2.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200 select-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white truncate max-w-xs block">
              {fileName || documentTitle || 'Pratinjau Dokumen'}
            </span>
            <span className="text-[10px] text-slate-400">
              {signedPdfUrl ? 'Dokumen Resmi Bertanda Tangan' : 'Pratinjau Berkas & Penempatan Tanda Tangan Langsung'}
            </span>
          </div>
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || isLoadingPdf}
            className="p-1 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-slate-300 px-1">
            Halaman {currentPage} / {numPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages || isLoadingPdf}
            className="p-1 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls & Sign Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 px-1.5 py-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
              title="Perkecil (Zoom Out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-semibold text-slate-400 px-1">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
              title="Perbesar (Zoom In)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {!isReadOnlyPreview && (
            <button
              type="button"
              onClick={() => setIsSignPadOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{signatureDataUrl ? 'Ganti Ttd' : 'Goreskan Ttd'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN DOCUMENT CANVAS VIEWPORT */}
      <div className="relative w-full overflow-auto max-h-[580px] p-4 sm:p-6 flex justify-center bg-slate-950/60 select-none">
        {isLoadingPdf && (
          <div className="absolute inset-0 z-30 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-xs font-semibold text-slate-300">Memuat halaman dokumen PDF...</p>
          </div>
        )}

        {/* The Document Page Paper Sheet */}
        <div
          ref={containerRef}
          onClick={handleDocumentClick}
          style={{
            width: documentDimensions.width,
            minHeight: documentDimensions.height,
          }}
          className={`relative bg-white shadow-2xl rounded-sm transition-all duration-150 overflow-hidden ${
            !isReadOnlyPreview ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          {/* PDF Page Canvas */}
          {isPdfDocument ? (
            <canvas ref={pdfCanvasRef} className="block w-full h-auto" />
          ) : isImageDocument ? (
            <img
              src={fileUrl || undefined}
              alt="Dokumen"
              onLoad={(e) => {
                const img = e.currentTarget;
                setDocumentDimensions({
                  width: Math.min(img.naturalWidth, 800) * zoomScale,
                  height: (Math.min(img.naturalWidth, 800) * (img.naturalHeight / img.naturalWidth)) * zoomScale,
                });
              }}
              className="w-full h-auto block select-none pointer-events-none"
            />
          ) : (
            /* Fallback Formal Document Template Sheet */
            <div className="p-8 sm:p-12 text-slate-800 flex flex-col justify-between" style={{ minHeight: 840 }}>
              <div>
                <div className="border-b-2 border-indigo-600 pb-4 mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">LIVA MEDIA KREATIF</h2>
                    <p className="text-[11px] text-slate-500">Official Digital Contract & Legal Document</p>
                  </div>
                  <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg uppercase">
                    E-Signature Ready
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">{documentTitle || 'Surat Perjanjian Kerjasama'}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dokumen ini disahkan oleh para pihak secara digital melalui platform resmi Liva Media Kreatif. Seluruh
                    keterangan dan tanda tangan yang dibubuhkan pada dokumen ini diakui secara sah dan mengikat.
                  </p>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Dokumen:</span>
                      <span className="font-semibold text-slate-800">{documentTitle || 'Dokumen Resmi'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tanggal Pengesahan:</span>
                      <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-24 text-[10px] text-slate-400 border-t border-slate-200 flex justify-between">
                <span>Liva Media Kreatif Verified Document</span>
                <span>Halaman 1 dari 1</span>
              </div>
            </div>
          )}

          {/* 3. DIRECT SIGNATURE BOX OVERLAY ON PDF */}
          {(!isReadOnlyPreview || signatureDataUrl) && signaturePlacement.page === currentPage && (
            <div
              onMouseDown={handleMouseDownOnBox}
              onTouchStart={handleTouchStartOnBox}
              style={{
                left: `${signaturePlacement.xPercent * 100}%`,
                top: `${signaturePlacement.yPercent * 100}%`,
                width: `${signaturePlacement.widthPercent * 100}%`,
              }}
              className={`absolute select-none z-20 group transition-shadow ${
                !isReadOnlyPreview
                  ? 'cursor-grab active:cursor-grabbing border-2 border-indigo-500/80 bg-indigo-50/20 hover:bg-indigo-50/40 rounded-xl p-2.5 shadow-lg ring-4 ring-indigo-500/10'
                  : 'border border-transparent p-2'
              }`}
            >
              {/* Drag Handle Label */}
              {!isReadOnlyPreview && (
                <div className="absolute -top-3 left-2 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-md shadow flex items-center gap-1 opacity-90 group-hover:opacity-100">
                  <Move className="w-2.5 h-2.5" />
                  <span>Geser Posisi Ttd</span>
                </div>
              )}

              {/* Signature Visual (Drawn or Placeholder) */}
              {signatureDataUrl ? (
                <div className="relative">
                  <img
                    src={signatureDataUrl}
                    alt="Tanda Tangan Digital"
                    className="w-full h-auto max-h-24 object-contain filter drop-shadow-xs"
                  />
                  {signaturePlacement.withCompanyStamp && (
                    <div className="absolute right-0 -bottom-2 px-2 py-0.5 bg-emerald-50 border border-emerald-500 text-emerald-700 text-[8px] font-black rounded-md rotate-[-4deg] shadow-2xs">
                      VERIFIED OFFICIAL
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSignPadOpen(true);
                  }}
                  className="py-4 border border-dashed border-indigo-400 hover:border-indigo-600 rounded-lg flex flex-col items-center justify-center gap-1 bg-white/80 backdrop-blur-2xs cursor-pointer text-indigo-600 hover:bg-indigo-50/60 transition-colors"
                >
                  <PenTool className="w-5 h-5 text-indigo-500" />
                  <span className="text-[10px] font-bold">Klik untuk Tanda Tangan</span>
                </div>
              )}

              {/* Signer Underline & Details */}
              <div className="mt-1.5 border-t border-slate-700/80 pt-1 text-left">
                <p className="text-[10px] font-black text-slate-900 leading-tight">
                  {signaturePlacement.signerName || signerName || 'Penandatangan'}
                </p>
                {(signaturePlacement.signerRole || signerRole) && (
                  <p className="text-[8px] text-slate-500 leading-tight">
                    {signaturePlacement.signerRole || signerRole}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. SIGNATURE SETTINGS & PLACEMENT HELPER BAR */}
      {!isReadOnlyPreview && (
        <div className="bg-slate-800/90 px-4 py-2.5 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-amber-400">💡</span>
            <span className="text-[11px]">
              <strong>Tips:</strong> Klik di mana saja pada lembar berkas atau geser kotak tanda tangan untuk menentukan posisi tanda tangan di PDF.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Ink Color Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400">Tinta:</span>
              <button
                type="button"
                onClick={() => setSignaturePlacement((p) => ({ ...p, inkColor: '#0f172a' }))}
                className={`w-4 h-4 rounded-full border ${
                  signaturePlacement.inkColor === '#0f172a' ? 'border-white ring-2 ring-indigo-500' : 'border-slate-600'
                } bg-slate-900 cursor-pointer`}
                title="Tinta Hitam"
              />
              <button
                type="button"
                onClick={() => setSignaturePlacement((p) => ({ ...p, inkColor: '#1e3a8a' }))}
                className={`w-4 h-4 rounded-full border ${
                  signaturePlacement.inkColor === '#1e3a8a' ? 'border-white ring-2 ring-indigo-500' : 'border-slate-600'
                } bg-blue-900 cursor-pointer`}
                title="Tinta Biru Gelap"
              />
            </div>

            {/* Stamp Toggle */}
            <button
              type="button"
              onClick={() =>
                setSignaturePlacement((p) => {
                  const updated = { ...p, withCompanyStamp: !p.withCompanyStamp };
                  onPositionChange?.(updated);
                  return updated;
                })
              }
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                signaturePlacement.withCompanyStamp
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Stempel Resmi</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. POPUP SIGNATURE PAD MODAL */}
      {isSignPadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Goreskan Tanda Tangan Digital</h4>
                  <p className="text-[11px] text-slate-400">Gunakan mouse atau jari di layar sentuh</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSignPadOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 space-y-3">
              <div className="relative border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl overflow-hidden bg-slate-50/70 transition-colors">
                <canvas
                  ref={signPadCanvasRef}
                  onMouseDown={startDrawingInPad}
                  onMouseMove={drawInPad}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  onTouchStart={startDrawingInPad}
                  onTouchMove={drawInPad}
                  onTouchEnd={() => setIsDrawing(false)}
                  style={{ width: '100%', height: '180px' }}
                  className="block cursor-crosshair touch-none"
                />
                {!hasDrawnInPad && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                    Goreskan tanda tangan di sini...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearSignPad}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hapus / Ulang</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSignPadOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={saveSignatureFromPad}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Pasang ke PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
