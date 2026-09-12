import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  PenTool, 
  Download, 
  RotateCcw, 
  Check, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  X, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  ArrowRight
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { UserAccount } from '../../types/app';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface ToolsViewProps {
  currentUser?: UserAccount | null;
  onNavigateToAssets?: () => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ currentUser }) => {
  // Step 1: File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // PDF Viewer Navigation & Zoom
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.1);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Signature Pad State
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [inkColor, setInkColor] = useState<'#0f172a' | '#1e3a8a'>('#0f172a');
  const [signerName, setSignerName] = useState(() => currentUser?.full_name || 'Galang Taufik');
  const [signerRole, setSignerRole] = useState(() => currentUser?.position || 'Director / Founder');
  const [withCompanyStamp, setWithCompanyStamp] = useState(true);
  const padCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Signature Position on Document (Relative 0 to 1)
  const [signaturePlacement, setSignaturePlacement] = useState<{
    page: number;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
  }>({
    page: 1,
    xPercent: 0.62,
    yPercent: 0.72,
    widthPercent: 0.28,
  });

  // Dragging Signature Box State
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialXPercent: number; initialYPercent: number }>({
    startX: 0,
    startY: 0,
    initialXPercent: 0.62,
    initialYPercent: 0.72,
  });

  // Export / Download State
  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [fileUrl, downloadUrl]);

  // Handle file selection
  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Reset previous
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setExportSuccess(false);
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setFileUrl(url);

    const isPdfFile = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImgFile = file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp)$/i.test(file.name);

    setIsPdf(isPdfFile);
    setIsImage(isImgFile);
    setCurrentPage(1);

    const arrayBuffer = await file.arrayBuffer();
    setPdfBytes(new Uint8Array(arrayBuffer));
  };

  // Render PDF using PDF.js
  useEffect(() => {
    if (!fileUrl || !isPdf) return;

    let isCancelled = false;
    setIsLoadingPdf(true);
    setPdfLoadError(null);

    const render = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
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

        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        setIsLoadingPdf(false);
      } catch (err: any) {
        console.error('Failed to render PDF preview:', err);
        if (!isCancelled) {
          setPdfLoadError(err.message || 'Gagal memuat pratinjau PDF.');
          setIsLoadingPdf(false);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl, isPdf, currentPage, zoomScale]);

  // Setup / Redraw Signature Pad Canvas
  useEffect(() => {
    const canvas = padCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = inkColor;
  }, [inkColor]);

  // Signature Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = padCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = padCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = padCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
  };

  const clearPad = () => {
    const canvas = padCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
    setHasDrawn(false);
  };

  // Dragging Signature Box Handlers
  const handleMouseDownOnBox = (e: React.MouseEvent) => {
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
    if (!isDraggingBox) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const newXPercent = Math.max(0.02, Math.min(0.95 - signaturePlacement.widthPercent, dragStartRef.current.initialXPercent + deltaX / rect.width));
      const newYPercent = Math.max(0.02, Math.min(0.92, dragStartRef.current.initialYPercent + deltaY / rect.height));

      setSignaturePlacement((p) => ({
        ...p,
        page: currentPage,
        xPercent: newXPercent,
        yPercent: newYPercent,
      }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const deltaX = e.touches[0].clientX - dragStartRef.current.startX;
      const deltaY = e.touches[0].clientY - dragStartRef.current.startY;

      const newXPercent = Math.max(0.02, Math.min(0.95 - signaturePlacement.widthPercent, dragStartRef.current.initialXPercent + deltaX / rect.width));
      const newYPercent = Math.max(0.02, Math.min(0.92, dragStartRef.current.initialYPercent + deltaY / rect.height));

      setSignaturePlacement((p) => ({
        ...p,
        page: currentPage,
        xPercent: newXPercent,
        yPercent: newYPercent,
      }));
    };

    const handleMouseUp = () => setIsDraggingBox(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingBox, currentPage, signaturePlacement.widthPercent]);

  // Click on Document to move signature box
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setSignaturePlacement((p) => ({
      ...p,
      page: currentPage,
      xPercent: Math.max(0.02, Math.min(0.95 - p.widthPercent, x - p.widthPercent / 2)),
      yPercent: Math.max(0.02, Math.min(0.92, y - 0.05)),
    }));
  };

  // Stamping and Saving PDF directly on client with pdf-lib
  const handleStampAndDownload = async () => {
    if (!signatureDataUrl) {
      alert('Silakan goreskan tanda tangan Anda terlebih dahulu di kolom tanda tangan.');
      return;
    }

    setIsExporting(true);
    try {
      let finalPdfDoc: PDFDocument;

      if (isPdf && pdfBytes) {
        // Load original uploaded PDF
        finalPdfDoc = await PDFDocument.load(pdfBytes);
      } else if (isImage && pdfBytes) {
        // Convert image file to PDF
        finalPdfDoc = await PDFDocument.create();
        const img = selectedFile?.name.toLowerCase().endsWith('.png')
          ? await finalPdfDoc.embedPng(pdfBytes)
          : await finalPdfDoc.embedJpg(pdfBytes);
        const imgPage = finalPdfDoc.addPage([img.width, img.height]);
        imgPage.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      } else {
        // Create standard A4 document
        finalPdfDoc = await PDFDocument.create();
        const page = finalPdfDoc.addPage([595.28, 841.89]);
        const fontBold = await finalPdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await finalPdfDoc.embedFont(StandardFonts.Helvetica);
        const { width, height } = page.getSize();

        page.drawText('LIVA MEDIA KREATIF', {
          x: 50,
          y: height - 80,
          size: 16,
          font: fontBold,
          color: rgb(0.2, 0.25, 0.6),
        });
        page.drawText('DOKUMEN PENGESAHAN RESMI', {
          x: 50,
          y: height - 105,
          size: 11,
          font: fontRegular,
          color: rgb(0.4, 0.45, 0.5),
        });
      }

      // Embed signature image
      const cleanBase64 = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const sigBytes = Uint8Array.from(atob(cleanBase64), (c) => c.charCodeAt(0));
      const embeddedSig = await finalPdfDoc.embedPng(sigBytes);

      const pages = finalPdfDoc.getPages();
      const targetPageIndex = Math.max(0, Math.min(signaturePlacement.page - 1, pages.length - 1));
      const targetPage = pages[targetPageIndex];
      const { width: pageWidth, height: pageHeight } = targetPage.getSize();

      const sigWidth = pageWidth * signaturePlacement.widthPercent;
      const sigHeight = (sigWidth / embeddedSig.width) * embeddedSig.height;

      const sigX = Math.max(15, Math.min(pageWidth * signaturePlacement.xPercent, pageWidth - sigWidth - 15));
      // In PDF coordinate system, Y=0 is bottom-left
      const sigY = Math.max(15, Math.min(pageHeight - (pageHeight * signaturePlacement.yPercent) - sigHeight, pageHeight - sigHeight - 15));

      // Draw Signature
      targetPage.drawImage(embeddedSig, {
        x: sigX,
        y: sigY,
        width: sigWidth,
        height: sigHeight,
      });

      const fontBold = await finalPdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await finalPdfDoc.embedFont(StandardFonts.Helvetica);

      // Underline
      targetPage.drawLine({
        start: { x: sigX, y: sigY - 2 },
        end: { x: sigX + sigWidth, y: sigY - 2 },
        thickness: 1,
        color: rgb(0.2, 0.25, 0.35),
      });

      // Name & Role
      if (signerName.trim()) {
        targetPage.drawText(signerName.trim(), {
          x: sigX,
          y: sigY - 14,
          size: 9.5,
          font: fontBold,
          color: rgb(0.1, 0.12, 0.18),
        });
      }

      if (signerRole.trim()) {
        targetPage.drawText(signerRole.trim(), {
          x: sigX,
          y: sigY - 25,
          size: 8,
          font: fontRegular,
          color: rgb(0.4, 0.45, 0.5),
        });
      }

      // Stamp
      if (withCompanyStamp) {
        const stampX = sigX - 25;
        const stampY = sigY - 15;
        targetPage.drawRectangle({
          x: stampX,
          y: stampY,
          width: 80,
          height: 24,
          color: rgb(0.9, 0.96, 0.93),
          borderColor: rgb(0.05, 0.6, 0.3),
          borderWidth: 1,
          opacity: 0.85,
        });
        targetPage.drawText('VERIFIED / SAH', {
          x: stampX + 8,
          y: stampY + 14,
          size: 7,
          font: fontBold,
          color: rgb(0.05, 0.55, 0.25),
        });
        targetPage.drawText('LIVA MEDIA', {
          x: stampX + 8,
          y: stampY + 5,
          size: 6,
          font: fontRegular,
          color: rgb(0.05, 0.55, 0.25),
        });
      }

      const stampedPdfBytes = await finalPdfDoc.save();
      const blob = new Blob([stampedPdfBytes], { type: 'application/pdf' });
      const dlUrl = URL.createObjectURL(blob);
      setDownloadUrl(dlUrl);
      setExportSuccess(true);

      // Auto trigger download
      const a = document.createElement('a');
      a.href = dlUrl;
      const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'dokumen';
      a.download = `${baseName}_bertandatangan.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error stamping PDF:', err);
      alert('Gagal membubuhkan tanda tangan ke PDF: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/70 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Tanda Tangan Dokumen (TTD PDF)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Simpel & Cepat
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Alur 3 langkah mudah: 1. Upload File PDF &rarr; 2. Gores Tanda Tangan & Tentukan Posisi &rarr; 3. Unduh Dokumen Bertanda Tangan.
            </p>
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setFileUrl(null);
                setPdfBytes(null);
                setDownloadUrl(null);
                setExportSuccess(false);
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ganti File</span>
            </button>

            <button
              type="button"
              onClick={handleStampAndDownload}
              disabled={isExporting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membubuhkan Ttd...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Selesai & Unduh PDF</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace */}
      {!selectedFile ? (
        /* STEP 1: UPLOAD FILE AREA */
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-xl w-full text-center space-y-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileChange(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed rounded-3xl transition-all cursor-pointer bg-white shadow-xs ${
                isDraggingFile
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-slate-800">
                Pilih atau Tarik File PDF ke Sini
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Mendukung dokumen format <strong>PDF</strong> atau gambar invoice/surat (PNG, JPG). Berkas akan diproses langsung secara aman di browser Anda.
              </p>

              <button
                type="button"
                className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2 pointer-events-none"
              >
                <PenTool className="w-4 h-4" />
                <span>Pilih File PDF dari Komputer</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Tanpa batas ukuran berkas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Tanda tangan langsung menempel di PDF
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: SPLIT SCREEN (LEFT: SIGNATURE CONTROLS, RIGHT: VISUAL PDF VIEWER) */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Panel: Drawing Signature & Information */}
          <div className="w-full lg:w-96 shrink-0 bg-white border-r border-slate-200/90 flex flex-col h-full overflow-y-auto custom-scrollbar p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Langkah 1: Goreskan Tanda Tangan
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  {hasDrawn ? 'Sudah Ada Goresan' : 'Wajib Diisi'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gunakan kursor mouse atau jari di layar sentuh untuk membuat tanda tangan.
              </p>
            </div>

            {/* Canvas Sign Pad */}
            <div className="space-y-2">
              <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-2xl overflow-hidden bg-slate-50/70 transition-colors">
                <canvas
                  ref={padCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ width: '100%', height: '170px' }}
                  className="block cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 text-xs gap-1">
                    <PenTool className="w-4 h-4 text-slate-400" />
                    <span>Gores tanda tangan di kotak ini...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearPad}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Ulang / Bersihkan</span>
                </button>

                {/* Ink Color */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium">Tinta:</span>
                  <button
                    type="button"
                    onClick={() => setInkColor('#0f172a')}
                    className={`w-4 h-4 rounded-full border ${
                      inkColor === '#0f172a' ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-slate-300'
                    } bg-slate-900 cursor-pointer`}
                    title="Hitam"
                  />
                  <button
                    type="button"
                    onClick={() => setInkColor('#1e3a8a')}
                    className={`w-4 h-4 rounded-full border ${
                      inkColor === '#1e3a8a' ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-slate-300'
                    } bg-blue-900 cursor-pointer`}
                    title="Biru"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Langkah 2: Data Penandatangan
              </h3>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Nama Terang</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Misal: Galang Taufik"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Jabatan / Keterangan (Opsional)</label>
                <input
                  type="text"
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value)}
                  placeholder="Misal: Direktur Utama / Founder"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Company Stamp Checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={withCompanyStamp}
                  onChange={(e) => setWithCompanyStamp(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs font-medium text-slate-700">
                  Sertakan Stempel Validasi Resmi (VERIFIED)
                </span>
              </label>
            </div>

            {/* Instruction Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-emerald-600" />
                <span>Langkah 3: Tempelkan Tanda Tangan</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Di panel sebelah kanan, <strong>klik di mana saja pada lembar berkas</strong> atau <strong>tarik kotak tanda tangan</strong> untuk meletakkannya di posisi yang pas.
              </p>
            </div>

            {/* Finish & Download CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStampAndDownload}
                disabled={isExporting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Menyematkan ke Dokumen...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Selesai & Unduh PDF Sekarang</span>
                  </>
                )}
              </button>

              {exportSuccess && downloadUrl && (
                <div className="mt-2 text-center">
                  <a
                    href={downloadUrl}
                    download={`${selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'dokumen'}_bertandatangan.pdf`}
                    className="text-[11px] font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Klik di sini jika download tidak berjalan otomatis</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Interactive PDF Viewport with Stamping Box */}
          <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
            {/* Toolbar Above PDF Canvas */}
            <div className="bg-slate-800/90 border-b border-slate-700/80 px-4 py-2.5 flex items-center justify-between text-xs text-white shrink-0">
              <div className="flex items-center gap-2 truncate max-w-sm">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold truncate">{selectedFile.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>

              {/* Page Navigator */}
              {isPdf && (
                <div className="flex items-center gap-2 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = Math.max(1, currentPage - 1);
                      setCurrentPage(prev);
                      setSignaturePlacement((p) => ({ ...p, page: prev }));
                    }}
                    disabled={currentPage <= 1 || isLoadingPdf}
                    className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded-lg cursor-pointer"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-300">
                    Hal {currentPage} / {numPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(numPages, currentPage + 1);
                      setCurrentPage(next);
                      setSignaturePlacement((p) => ({ ...p, page: next }));
                    }}
                    disabled={currentPage >= numPages || isLoadingPdf}
                    className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded-lg cursor-pointer"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
                  className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                  title="Perkecil"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
                  className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                  title="Perbesar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Viewport */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center custom-scrollbar">
              {isLoadingPdf && (
                <div className="flex flex-col items-center justify-center gap-2 text-white">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  <span className="text-xs text-slate-400">Memuat halaman dokumen PDF...</span>
                </div>
              )}

              {pdfLoadError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{pdfLoadError}</span>
                </div>
              )}

              {/* PDF / Image Page Sheet */}
              <div
                ref={containerRef}
                onClick={handleContainerClick}
                className="relative bg-white shadow-2xl rounded-sm transition-all overflow-hidden cursor-crosshair shrink-0"
              >
                {isPdf ? (
                  <canvas ref={pdfCanvasRef} className="block select-none pointer-events-none" />
                ) : isImage && fileUrl ? (
                  <img
                    src={fileUrl}
                    alt="Pratinjau Dokumen"
                    className="block max-w-2xl h-auto select-none pointer-events-none"
                  />
                ) : null}

                {/* SIGNATURE PLACEMENT BOX (DRAGGABLE) */}
                {signaturePlacement.page === currentPage && (
                  <div
                    onMouseDown={handleMouseDownOnBox}
                    onTouchStart={handleTouchStartOnBox}
                    style={{
                      left: `${signaturePlacement.xPercent * 100}%`,
                      top: `${signaturePlacement.yPercent * 100}%`,
                      width: `${signaturePlacement.widthPercent * 100}%`,
                    }}
                    className="absolute select-none z-20 group cursor-grab active:cursor-grabbing border-2 border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-xl p-2 shadow-xl ring-4 ring-emerald-500/10"
                  >
                    {/* Move Badge */}
                    <div className="absolute -top-3 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-md shadow flex items-center gap-1 pointer-events-none">
                      <Move className="w-2.5 h-2.5" />
                      <span>Geser Posisi Ttd</span>
                    </div>

                    {/* Signature Preview */}
                    {signatureDataUrl ? (
                      <div className="relative">
                        <img
                          src={signatureDataUrl}
                          alt="Tanda Tangan"
                          className="w-full h-auto max-h-20 object-contain drop-shadow-xs"
                        />
                        {withCompanyStamp && (
                          <div className="absolute right-0 -bottom-2 px-1.5 py-0.2 bg-emerald-50 border border-emerald-600 text-emerald-700 text-[7px] font-black rounded rotate-[-4deg] shadow-2xs">
                            VERIFIED OFFICIAL
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-3 border border-dashed border-emerald-400 bg-white/80 rounded-lg flex flex-col items-center justify-center text-emerald-700">
                        <PenTool className="w-4 h-4 text-emerald-600" />
                        <span className="text-[9px] font-bold mt-1">Gores Tanda Tangan di Kiri</span>
                      </div>
                    )}

                    {/* Signer Underline & Details */}
                    <div className="mt-1 border-t border-slate-800/80 pt-1 text-left">
                      <p className="text-[10px] font-black text-slate-900 leading-tight">
                        {signerName || 'Penandatangan'}
                      </p>
                      {signerRole && (
                        <p className="text-[8px] text-slate-500 leading-tight">
                          {signerRole}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
