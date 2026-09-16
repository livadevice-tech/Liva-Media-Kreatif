import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  PenTool, 
  Download, 
  RotateCcw, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Share2,
  Clock,
  Eye,
  Sparkles,
  Layers,
  ArrowRight,
  FolderArchive,
  QrCode,
  MessageCircle,
  FileCheck,
  UserCheck,
  Send,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  Maximize2,
  Minimize2,
  X,
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  Plus,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { UserAccount, SignedDocument, SavedSignature } from '../../types/app';
import { appApi } from '../../services/appApi';
import { EmploymentLetterGenerator } from './EmploymentLetterGenerator';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface ToolsViewProps {
  currentUser?: UserAccount | null;
  onNavigateToAssets?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

type ActiveToolId = 'hub' | 'pdf-sign' | 'sign-history' | 'employment-letter';

export const ToolsView: React.FC<ToolsViewProps> = ({ 
  currentUser,
  onNavigateToAssets,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  // Current view state: 'hub' (List/Cards of Tools) vs specific tool view
  const [activeTool, setActiveTool] = useState<ActiveToolId>('hub');

  // Mode in E-Sign: 'internal' (Langsung di tempat) vs 'external' (Kirim link eksternal tanpa login)
  const [signMode, setSignMode] = useState<'internal' | 'external'>('internal');

  // ==========================================
  // E-SIGN STATE
  // ==========================================
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
  const [zoomScale, setZoomScale] = useState(0.85);
  const [fitMode, setFitMode] = useState<'fit-width' | 'fit-page' | 'custom'>('fit-page');
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportWrapperRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }>({ width: 595, height: 842 });

  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatureInputMethod, setSignatureInputMethod] = useState<'draw' | 'upload'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [inkColor, setInkColor] = useState<'#0f172a' | '#1e3a8a'>('#0f172a');
  const padCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sigFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedSigFileName, setUploadedSigFileName] = useState<string | null>(null);

  // Saved Signatures State (Khusus TTD Internal)
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>([]);
  const [selectedSavedSigId, setSelectedSavedSigId] = useState<string | null>(null);
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [showSaveSigInput, setShowSaveSigInput] = useState(false);
  const [newSigLabel, setNewSigLabel] = useState('');

  // Signature Placement Box on Document (Relative 0 to 1)
  const [signaturePlacement, setSignaturePlacement] = useState<{
    page: number;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
  }>({
    page: 1,
    xPercent: 0.65,
    yPercent: 0.75,
    widthPercent: 0.22,
  });

  // Dragging Signature Box State
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialXPercent: number; initialYPercent: number }>({
    startX: 0,
    startY: 0,
    initialXPercent: 0.65,
    initialYPercent: 0.75,
  });

  // Internal Sign & Download State
  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // External Sign Request Fields
  const [externalTitle, setExternalTitle] = useState('');
  const [externalRecipientName, setExternalRecipientName] = useState('');
  const [externalRecipientRole, setExternalRecipientRole] = useState('');
  const [externalRecipientPhone, setExternalRecipientPhone] = useState('');
  const [externalNotes, setExternalNotes] = useState('');
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [createdExternalResult, setCreatedExternalResult] = useState<{
    id: string;
    signing_token: string;
    share_url: string;
    title: string;
    recipientName: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Document List & History State
  const [documentList, setDocumentList] = useState<SignedDocument[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<SignedDocument | null>(null);

  // Auto-collapse sidebar when opening studio with file
  useEffect(() => {
    if (activeTool === 'pdf-sign' && selectedFile && isSidebarOpen && onToggleSidebar) {
      onToggleSidebar();
    }
  }, [activeTool, selectedFile]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [fileUrl, downloadUrl]);

  // Load document list when visiting history or switching tools
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

  // Load saved signatures for internal signing
  const loadSavedSignatures = async () => {
    try {
      const sigs = await appApi.getSavedSignatures(currentUser?.id);
      setSavedSignatures(sigs || []);
    } catch (err) {
      console.error('Failed to load saved signatures:', err);
    }
  };

  useEffect(() => {
    if (activeTool === 'sign-history' || activeTool === 'hub') {
      loadDocuments();
    }
    if (activeTool === 'pdf-sign') {
      loadSavedSignatures();
    }
  }, [activeTool, currentUser?.id]);

  // Handle file selection
  const handleFileChange = async (file: File) => {
    if (!file) return;

    if (fileUrl) URL.revokeObjectURL(fileUrl);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setExportSuccess(false);
    setCreatedExternalResult(null);
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setFileUrl(url);

    const isPdfFile = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImgFile = file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp)$/i.test(file.name);

    setIsPdf(isPdfFile);
    setIsImage(isImgFile);
    setCurrentPage(1);

    if (!externalTitle.trim()) {
      setExternalTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const arrayBuffer = await file.arrayBuffer();
    setPdfBytes(new Uint8Array(arrayBuffer));
  };

  // Calculate & Apply Fit Scale (Fit ke Lebar / Fit ke Halaman)
  const calculateAndApplyFit = (mode: 'fit-width' | 'fit-page') => {
    const wrapper = viewportWrapperRef.current;
    if (!wrapper) return;

    // Available viewport size minus margins
    const availWidth = Math.max(260, wrapper.clientWidth - 32);
    const availHeight = Math.max(260, wrapper.clientHeight - 32);

    const pdfW = pdfDimensions.width || 595;
    const pdfH = pdfDimensions.height || 842;

    let targetScale = 1.0;
    if (mode === 'fit-width') {
      targetScale = availWidth / pdfW;
    } else {
      // Fit full page (both width & height) cleanly into viewport
      const scaleX = availWidth / pdfW;
      const scaleY = availHeight / pdfH;
      targetScale = Math.min(scaleX, scaleY);
    }

    const clampedScale = Math.max(0.3, Math.min(3.0, Number(targetScale.toFixed(2))));
    setZoomScale(clampedScale);
    setFitMode(mode);
  };

  // Re-calculate fit scale on window resize if in fit mode
  useEffect(() => {
    const handleResize = () => {
      if (fitMode === 'fit-width' || fitMode === 'fit-page') {
        calculateAndApplyFit(fitMode);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitMode, pdfDimensions]);

  // Render PDF page safely without concurrent canvas conflict
  useEffect(() => {
    if (!fileUrl || !isPdf) return;

    let isCancelled = false;
    setIsLoadingPdf(true);
    setPdfLoadError(null);

    // Cancel previous ongoing render task if any
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) {
        // ignore cancel error
      }
      renderTaskRef.current = null;
    }

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

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        setPdfDimensions({ width: unscaledViewport.width, height: unscaledViewport.height });

        // Calculate target scale if fitMode is active
        let effectiveScale = zoomScale;
        const wrapper = viewportWrapperRef.current;
        if (wrapper && (fitMode === 'fit-page' || fitMode === 'fit-width')) {
          const availW = Math.max(260, wrapper.clientWidth - 32);
          const availH = Math.max(260, wrapper.clientHeight - 32);

          if (fitMode === 'fit-width') {
            effectiveScale = Math.max(0.3, Math.min(3.0, Number((availW / unscaledViewport.width).toFixed(2))));
          } else {
            const sX = availW / unscaledViewport.width;
            const sY = availH / unscaledViewport.height;
            effectiveScale = Math.max(0.3, Math.min(3.0, Number(Math.min(sX, sY).toFixed(2))));
          }
        }

        const viewport = page.getViewport({ scale: effectiveScale });
        const canvas = pdfCanvasRef.current;
        if (!canvas || isCancelled) return;

        const ctx = canvas.getContext('2d');
        if (!ctx || isCancelled) return;

        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport: viewport,
        });
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;

        if (!isCancelled) {
          setIsLoadingPdf(false);
        }
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException') {
          // Expected when cancelling previous render, ignore
          return;
        }
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
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // ignore
        }
        renderTaskRef.current = null;
      }
    };
  }, [fileUrl, isPdf, currentPage, zoomScale, fitMode]);

  // Setup Signature Pad Canvas for Internal Mode
  useEffect(() => {
    if (activeTool !== 'pdf-sign' || signMode !== 'internal') return;
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
  }, [inkColor, selectedFile, activeTool, signMode]);

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
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureDataUrl(null);
    setHasDrawn(false);
    setSelectedSavedSigId(null);
    setUploadedSigFileName(null);
    if (sigFileInputRef.current) {
      sigFileInputRef.current.value = '';
    }
  };

  // Upload file gambar tanda tangan (PNG transparan / JPG)
  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Berkas harus berupa gambar (PNG, JPG, atau WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (!result) return;

      setSignatureDataUrl(result);
      setHasDrawn(true);
      setSelectedSavedSigId(null);
      setUploadedSigFileName(file.name);

      // Render to canvas pad preview
      const canvas = padCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
          };
          img.src = result;
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Pilih tanda tangan dari daftar simpanan
  const handleSelectSavedSignature = (sig: SavedSignature) => {
    setSelectedSavedSigId(sig.id);
    setSignatureDataUrl(sig.signature_data_url);
    setHasDrawn(true);

    // Render preview to canvas pad
    const canvas = padCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
        };
        img.src = sig.signature_data_url;
      }
    }
  };

  // Simpan tanda tangan yang sedang digambar ke daftar tersimpan
  const handleSaveCurrentSignature = async () => {
    if (!signatureDataUrl) {
      alert('Silakan goreskan tanda tangan Anda terlebih dahulu sebelum menyimpannya.');
      return;
    }

    const label = newSigLabel.trim() || `TTD ${currentUser?.full_name || 'Internal'}`;
    setIsSavingSignature(true);
    try {
      const res = await appApi.saveSignature({
        name: label,
        signature_data_url: signatureDataUrl,
        user_id: currentUser?.id,
        created_by: currentUser?.full_name || 'User',
      });
      if (res.success) {
        setNewSigLabel('');
        setShowSaveSigInput(false);
        await loadSavedSignatures();
        setSelectedSavedSigId(res.id);
      }
    } catch (err: any) {
      console.error('Failed to save signature:', err);
      alert(err.message || 'Gagal menyimpan tanda tangan.');
    } finally {
      setIsSavingSignature(false);
    }
  };

  // Hapus tanda tangan dari database tersimpan
  const handleDeleteSavedSignature = async (e: React.MouseEvent, sigId: string) => {
    e.stopPropagation();
    if (!window.confirm('Hapus tanda tangan tersimpan ini?')) return;
    try {
      await appApi.deleteSavedSignature(sigId);
      if (selectedSavedSigId === sigId) {
        clearPad();
      }
      await loadSavedSignatures();
    } catch (err: any) {
      console.error('Failed to delete saved signature:', err);
      alert(err.message || 'Gagal menghapus tanda tangan.');
    }
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

      const newXPercent = Math.max(0.01, Math.min(0.98 - signaturePlacement.widthPercent, dragStartRef.current.initialXPercent + deltaX / rect.width));
      const newYPercent = Math.max(0.01, Math.min(0.95, dragStartRef.current.initialYPercent + deltaY / rect.height));

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

      const newXPercent = Math.max(0.01, Math.min(0.98 - signaturePlacement.widthPercent, dragStartRef.current.initialXPercent + deltaX / rect.width));
      const newYPercent = Math.max(0.01, Math.min(0.95, dragStartRef.current.initialYPercent + deltaY / rect.height));

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

  // Click on Document to immediately move signature box there
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setSignaturePlacement((p) => ({
      ...p,
      page: currentPage,
      xPercent: Math.max(0.01, Math.min(0.98 - p.widthPercent, x - p.widthPercent / 2)),
      yPercent: Math.max(0.01, Math.min(0.95, y - 0.04)),
    }));
  };

  // 1. TTD INTERNAL: Stamping ONLY pure signature directly onto PDF & download
  const handleInternalStampAndDownload = async () => {
    if (!signatureDataUrl) {
      alert('Silakan goreskan tanda tangan Anda terlebih dahulu di kotak sebelah kiri.');
      return;
    }

    setIsExporting(true);
    try {
      let finalPdfDoc: PDFDocument;

      if (isPdf && pdfBytes) {
        finalPdfDoc = await PDFDocument.load(pdfBytes);
      } else if (isImage && pdfBytes) {
        finalPdfDoc = await PDFDocument.create();
        const img = selectedFile?.name.toLowerCase().endsWith('.png')
          ? await finalPdfDoc.embedPng(pdfBytes)
          : await finalPdfDoc.embedJpg(pdfBytes);
        const imgPage = finalPdfDoc.addPage([img.width, img.height]);
        imgPage.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      } else {
        throw new Error('Berkas file tidak valid.');
      }

      // Embed signature image ONLY (pure transparent PNG)
      const cleanBase64 = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const sigBytes = Uint8Array.from(atob(cleanBase64), (c) => c.charCodeAt(0));
      const embeddedSig = await finalPdfDoc.embedPng(sigBytes);

      const pages = finalPdfDoc.getPages();
      const targetPageIndex = Math.max(0, Math.min(signaturePlacement.page - 1, pages.length - 1));
      const targetPage = pages[targetPageIndex];
      const { width: pageWidth, height: pageHeight } = targetPage.getSize();

      const sigWidth = pageWidth * signaturePlacement.widthPercent;
      const sigHeight = (sigWidth / embeddedSig.width) * embeddedSig.height;

      const sigX = Math.max(10, Math.min(pageWidth * signaturePlacement.xPercent, pageWidth - sigWidth - 10));
      // In PDF coordinate system, Y=0 is bottom-left, DOM Y=0 is top-left
      const sigY = Math.max(10, Math.min(pageHeight - (pageHeight * signaturePlacement.yPercent) - sigHeight, pageHeight - sigHeight - 10));

      // Draw ONLY the pure signature graphic (NO text, NO names, NO stamps, NO underlines)
      targetPage.drawImage(embeddedSig, {
        x: sigX,
        y: sigY,
        width: sigWidth,
        height: sigHeight,
      });

      const stampedPdfBytes = await finalPdfDoc.save();
      const blob = new Blob([stampedPdfBytes], { type: 'application/pdf' });
      const dlUrl = URL.createObjectURL(blob);
      setDownloadUrl(dlUrl);
      setExportSuccess(true);

      // Auto trigger download with _Signed suffix
      const a = document.createElement('a');
      a.href = dlUrl;
      const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'dokumen';
      a.download = `${baseName}_Signed.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Optionally record to backend if user is logged in
      try {
        if (selectedFile) {
          const uploadRes = await appApi.uploadAssetFile(selectedFile);
          if (uploadRes.success) {
            await appApi.createSignedDocument({
              title: baseName,
              file_url: uploadRes.url,
              file_name: selectedFile.name,
              file_source: 'external',
              sign_type: 'internal',
              signer_name: currentUser?.full_name || 'Penandatangan Internal',
              signer_role: currentUser?.position || 'Internal',
              signature_data_url: signatureDataUrl,
              signature_position: signaturePlacement,
              created_by: currentUser?.full_name || 'Tim Liva',
            });
            loadDocuments();
          }
        }
      } catch (logErr) {
        console.warn('Could not auto-save signed log to database:', logErr);
      }
    } catch (err: any) {
      console.error('Error stamping PDF:', err);
      alert('Gagal membubuhkan tanda tangan ke PDF: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsExporting(false);
    }
  };

  // 2. TTD EKSTERNAL: Upload file to server -> Generate public link without login
  const handleGenerateExternalLink = async () => {
    if (!selectedFile) {
      alert('Silakan pilih berkas PDF terlebih dahulu.');
      return;
    }
    if (!externalRecipientName.trim()) {
      alert('Silakan isi nama penerima eksternal yang akan menandatangani.');
      return;
    }

    setIsCreatingLink(true);
    try {
      // Step 1: Upload file to server so it has a permanent public URL
      const uploadRes = await appApi.uploadAssetFile(selectedFile);
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error('Gagal mengunggah berkas ke server.');
      }

      // Step 2: Create signed document record with pending status
      const docTitle = externalTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');
      const createRes = await appApi.createSignedDocument({
        title: docTitle,
        file_url: uploadRes.url,
        file_name: selectedFile.name,
        file_source: 'external',
        sign_type: 'external',
        signer_name: externalRecipientName.trim(),
        signer_role: externalRecipientRole.trim(),
        signer_phone: externalRecipientPhone.trim(),
        signer_notes: externalNotes.trim(),
        signature_position: signaturePlacement,
        created_by: currentUser?.full_name || 'Tim Liva',
      });

      if (createRes.success && createRes.signing_token) {
        const baseUrl = window.location.origin;
        const publicShareUrl = `${baseUrl}/?sign_token=${createRes.signing_token}`;

        setCreatedExternalResult({
          id: createRes.id,
          signing_token: createRes.signing_token,
          share_url: publicShareUrl,
          title: docTitle,
          recipientName: externalRecipientName.trim(),
        });

        loadDocuments();
      } else {
        throw new Error('Gagal membuat tautan tanda tangan eksternal.');
      }
    } catch (err: any) {
      console.error('Error creating external signing request:', err);
      alert(err.message || 'Terjadi kesalahan saat membuat link tanda tangan eksternal.');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = (url: string, recipientName: string, title: string) => {
    const text = encodeURIComponent(
      `Halo ${recipientName || 'Bapak/Ibu'},\n\nBerikut tautan untuk menandatangani dokumen "${title}" dari Liva Media Kreatif:\n\n${url}\n\nAnda dapat menandatangani langsung di HP atau laptop tanpa perlu login akun. Terima kasih.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDeleteDocument = async (id: string, title: string) => {
    if (!confirm(`Hapus riwayat berkas "${title}"?`)) return;
    try {
      await appApi.deleteSignedDocument(id);
      loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus berkas.');
    }
  };

  // Reset file selection
  const handleResetFile = () => {
    setSelectedFile(null);
    setFileUrl(null);
    setPdfBytes(null);
    setDownloadUrl(null);
    setExportSuccess(false);
    setCreatedExternalResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/70 overflow-hidden font-sans">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-3.5 shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
          )}

          {activeTool !== 'hub' ? (
            <button
              type="button"
              onClick={() => {
                setActiveTool('hub');
                handleResetFile();
              }}
              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Semua Tools</span>
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
          )}

          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {activeTool === 'hub' && 'Liva Tools Hub'}
              {activeTool === 'pdf-sign' && 'E-Sign — Tanda Tangan Dokumen (TTD PDF)'}
              {activeTool === 'sign-history' && 'Riwayat Berkas TTD & Link Eksternal'}
              {activeTool === 'employment-letter' && 'Surat Keterangan Kerja (Generator Surat Karyawan)'}
            </h1>
            <p className="text-[11px] text-slate-500">
              {activeTool === 'hub' && 'Pusat peralatan kerja digital, e-sign dokumen, utilitas konten & media.'}
              {activeTool === 'pdf-sign' && 'Pilih TTD Internal langsung atau minta TTD Eksternal tanpa perlu login.'}
              {activeTool === 'sign-history' && 'Pantau dokumen yang telah ditandatangani atau menunggu pihak luar.'}
              {activeTool === 'employment-letter' && 'Buat surat keterangan kerja resmi Liva dengan format standar A4, nomor otomatis, dan stempel.'}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {activeTool === 'hub' && (
            <button
              type="button"
              onClick={() => setActiveTool('sign-history')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Riwayat TTD ({documentList.length})</span>
            </button>
          )}

          {activeTool === 'pdf-sign' && selectedFile && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFile}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ganti File</span>
              </button>

              {signMode === 'internal' ? (
                <button
                  type="button"
                  onClick={handleInternalStampAndDownload}
                  disabled={isExporting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Membubuhkan...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Selesai & Unduh PDF</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateExternalLink}
                  disabled={isCreatingLink || !externalRecipientName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isCreatingLink ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Membuat Link...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Buat Link TTD Eksternal</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: TOOLS HUB (LIST / CARD VIEW OF AVAILABLE & UPCOMING TOOLS)       */}
      {/* ========================================================================= */}
      {activeTool === 'hub' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Tools E-Sign Aktif</div>
                <div className="text-lg font-bold text-slate-900">Dual Signing Mode</div>
                <div className="text-[11px] text-emerald-600 font-medium">Internal & Eksternal (No Login)</div>
              </div>
            </div>

            <div 
              onClick={() => setActiveTool('sign-history')}
              className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-4 flex items-center gap-4 shadow-xs cursor-pointer transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Total Berkas TTD</div>
                <div className="text-lg font-bold text-slate-900">{documentList.length} Dokumen</div>
                <div className="text-[11px] text-indigo-600 font-medium">
                  {documentList.filter(d => d.status === 'signed').length} selesai · {documentList.filter(d => d.status === 'pending').length} menunggu
                </div>
              </div>
            </div>

            <div 
              onClick={onNavigateToAssets}
              className="bg-white border border-slate-200/90 hover:border-violet-300 rounded-2xl p-4 flex items-center gap-4 shadow-xs cursor-pointer transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Penyimpanan Berkas</div>
                <div className="text-lg font-bold text-slate-900">Asset File Hub</div>
                <div className="text-[11px] text-violet-600 font-medium">Buka Manajemen File &rarr;</div>
              </div>
            </div>
          </div>

          {/* Section: Available & Planned Tools Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Katalog Tools</h3>
                <p className="text-xs text-slate-500">Pilih tool yang ingin Anda gunakan</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* TOOL CARD: SURAT KETERANGAN KERJA (BARU) */}
              <div className="group relative bg-white border-2 border-indigo-500/80 hover:border-indigo-600 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Format Resmi Liva
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Surat Keterangan Kerja
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Generate surat keterangan kerja resmi untuk karyawan Liva (pembukaan rekening bank/payroll, pengajuan visa, KPR, dll) lengkap dengan nomor surat, kop logo, stempel resmi, dan tanda tangan digital.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span><strong>Input Lengkap:</strong> Nama, NIK, Jabatan, Tanggal Mulai & Keperluan.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span><strong>Nomor Otomatis:</strong> Sesuai format standar Liva (001/LIVA/SK/Bulan/Tahun).</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span><strong>Pratinjau & Cetak:</strong> Live preview A4 langsung siap print atau simpan PDF.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTool('employment-letter')}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Buat Surat Keterangan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TOOL CARD 1: E-SIGN TTD PDF (ACTIVE & PRIMARY) */}
              <div className="group relative bg-white border-2 border-emerald-500/80 hover:border-emerald-600 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Aktif & Siap Digunakan
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      E-Sign (TTD PDF)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Bubuhkan tanda tangan murni pada PDF secara langsung di tempat, atau buat tautan tanda tangan untuk pihak luar/klien tanpa perlu mereka memiliki akun atau login.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>TTD Internal:</strong> Gores & tempelkan di PDF &rarr; download instan.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>TTD Eksternal:</strong> Kirim link publik via WhatsApp / Salin Link.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Only Tanda Tangan:</strong> Hasil bersih tanpa coretan teks/stempel otomatis.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTool('pdf-sign')}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Buka Tool E-Sign</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TOOL CARD 2: RIWAYAT & LINK TTD EKSTERNAL */}
              <div className="group bg-white border border-slate-200/90 hover:border-indigo-400 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {documentList.length} Berkas Tersimpan
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Daftar Status Berkas TTD
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Pantau progres tanda tangan pihak eksternal, salin kembali link tanda tangan, dan unduh berkas yang sudah berhasil ditandatangani oleh penerima.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Lihat dokumen yang masih pending / menunggu tanda tangan.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Salin tautan atau bagikan langsung ke WhatsApp klien.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTool('sign-history')}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lihat Riwayat & Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TOOL CARD 3: ASSET & MEDIA HUB */}
              <div className="group bg-white border border-slate-200/90 hover:border-violet-400 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-600/30 group-hover:scale-105 transition-transform">
                      <FolderArchive className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                      Terintegrasi
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      Asset & Media Library
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Penyimpanan terpusat untuk berkas gambar, logo brand, video, PDF kontrak, dan dokumen penting Liva Media Kreatif dengan fitur CRUD lengkap.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <span>Kategori Brand, Project & Dokumen Legal.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <span>Pratinjau cepat gambar dan dokumen.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    type="button"
                    onClick={onNavigateToAssets}
                    className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Buka Asset File</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TOOL CARD 4: QR CODE & SHORTENER (UPCOMING / PLANNED) */}
              <div className="bg-slate-50/80 border border-dashed border-slate-300 rounded-3xl p-6 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-600">
                      Rencana Rilis Berikutnya
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-800">
                      QR Code & Smart Link Generator
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Pembuat kode QR dinamis dengan logo Liva/Brand untuk materi cetak, kemasan, profil sosial media, dan landing page kampanye.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-slate-200 text-slate-400 text-xs font-semibold rounded-2xl cursor-not-allowed"
                  >
                    Segera Hadir
                  </button>
                </div>
              </div>

              {/* TOOL CARD 5: AI BRIEF & CONTENT ASSISTANT (UPCOMING / PLANNED) */}
              <div className="bg-slate-50/80 border border-dashed border-slate-300 rounded-3xl p-6 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-600">
                      Rencana Rilis Berikutnya
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-800">
                      AI Content & Copywriting Studio
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Bantu tim merancang konsep feed Instagram, copy caption, hook TikTok, hingga struktur brief video dalam hitungan detik.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-slate-200 text-slate-400 text-xs font-semibold rounded-2xl cursor-not-allowed"
                  >
                    Segera Hadir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: E-SIGN STUDIO (TTD INTERNAL & TTD EKSTERNAAL NO-LOGIN)            */}
      {/* ========================================================================= */}
      {activeTool === 'pdf-sign' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Studio Sub-Header with Flow Switcher */}
          <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Pilih Mode TTD:</span>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSignMode('internal')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    signMode === 'internal'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>1. TTD Internal (Langsung di Tempat)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignMode('external')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    signMode === 'external'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>2. TTD Eksternal (Kirim Link Tanpa Login)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                {signMode === 'internal'
                  ? 'Goreskan tanda tangan & unduh PDF berstempel instan.'
                  : 'Tentukan posisi tanda tangan & dapatkan link publik untuk klien.'}
              </span>
            </div>
          </div>

          {/* If No File Selected: Upload Screen */}
          {!selectedFile ? (
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
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      handleFileChange(files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-10 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 bg-white shadow-sm ${
                    isDraggingFile
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                      : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/50'
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

                  <div className="w-16 h-16 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">
                      Pilih Dokumen PDF yang Ingin Ditandatangani
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tarik & lepas berkas ke sini, atau klik untuk memilih dari komputer Anda
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[11px] text-slate-600 font-medium">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mendukung PDF, PNG, JPG (Maks 25MB)</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-xs flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800">Alur Sangat Simpel & Fleksibel:</div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      <li><strong>Mode Internal:</strong> Upload PDF &rarr; gores tanda tangan &rarr; geser posisi &rarr; unduh langsung.</li>
                      <li><strong>Mode Eksternal:</strong> Upload PDF &rarr; atur posisi tanda tangan pihak luar &rarr; bagikan tautan tanpa login via WhatsApp.</li>
                      <li><strong>Only Tanda Tangan:</strong> Menghasilkan goresan tanda tangan murni tanpa teks/stempel otomatis.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: WORKSPACE PREVIEW & CONTROLS */
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-900">
              {/* SIDEBAR PANEL */}
              <div className="w-full md:w-84 bg-white border-r border-slate-200 p-4 shrink-0 flex flex-col overflow-y-auto space-y-4 shadow-xl z-20">
                {/* File info */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Berkas Terpilih</div>
                    <div className="text-xs font-bold text-slate-800 truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFile}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Hapus / Ganti File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* MODE 1: INTERNAL SIGN PAD */}
                {signMode === 'internal' && (
                  <div className="space-y-3">
                    {/* Saved Signatures Shelf (Khusus Internal) */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tanda Tangan Tersimpan</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                          Khusus Internal
                        </span>
                      </div>

                      {savedSignatures.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-0.5 custom-scrollbar">
                          {savedSignatures.map((sig) => {
                            const isSelected = selectedSavedSigId === sig.id;
                            return (
                              <div
                                key={sig.id}
                                onClick={() => handleSelectSavedSignature(sig)}
                                className={`relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-between group ${
                                  isSelected
                                    ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                                    : 'border-slate-200 bg-white/80 hover:bg-white hover:border-emerald-300'
                                }`}
                              >
                                <div className="h-10 w-full flex items-center justify-center overflow-hidden">
                                  <img
                                    src={sig.signature_data_url}
                                    alt={sig.name}
                                    className="max-h-full max-w-full object-contain pointer-events-none"
                                  />
                                </div>
                                <div className="text-[10px] font-medium text-slate-700 truncate w-full text-center mt-1">
                                  {sig.name}
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteSavedSignature(e, sig.id)}
                                  className="absolute top-1 right-1 p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Hapus tanda tangan ini"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 text-center py-1.5">
                          Belum ada tanda tangan tersimpan. Buat tanda tangan di bawah lalu simpan untuk digunakan kembali kapan saja.
                        </div>
                      )}
                    </div>

                    {/* TABS: GORES LANGSUNG vs UNGGAH GAMBAR TTD */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setSignatureInputMethod('draw')}
                          className={`px-2.5 py-1 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            signatureInputMethod === 'draw'
                              ? 'bg-white text-emerald-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <PenTool className="w-3 h-3" />
                          <span>Gores Langsung</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureInputMethod('upload')}
                          className={`px-2.5 py-1 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            signatureInputMethod === 'upload'
                              ? 'bg-white text-emerald-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload Gambar TTD</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={clearPad}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>

                    {/* METHOD 1: CANVAS GORES LANGSUNG */}
                    {signatureInputMethod === 'draw' && (
                      <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white p-1 overflow-hidden shadow-inner">
                        <canvas
                          ref={padCanvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-32 bg-slate-50/50 rounded-xl cursor-crosshair touch-none"
                        />
                        {!hasDrawn && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                            Tulis tanda tangan Anda di sini
                          </div>
                        )}
                      </div>
                    )}

                    {/* METHOD 2: UPLOAD FILE GAMBAR TTD */}
                    {signatureInputMethod === 'upload' && (
                      <div className="space-y-2">
                        <input
                          ref={sigFileInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden"
                          onChange={handleSignatureImageUpload}
                        />

                        {signatureDataUrl ? (
                          <div className="p-3 bg-white border-2 border-emerald-400 rounded-2xl flex flex-col items-center justify-center relative group shadow-sm">
                            <div className="h-24 w-full flex items-center justify-center overflow-hidden">
                              <img
                                src={signatureDataUrl}
                                alt="Pratinjau TTD Upload"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium truncate max-w-full mt-2">
                              {uploadedSigFileName || 'Gambar Tanda Tangan Terpilih'}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => sigFileInputRef.current?.click()}
                                className="px-2.5 py-1 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                              >
                                Ganti Gambar
                              </button>
                              <button
                                type="button"
                                onClick={clearPad}
                                className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => sigFileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-300 transition-colors">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800">
                                Klik untuk Unggah Gambar TTD
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Format PNG (Transparan), JPG, atau WEBP
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Save Signature Action Row */}
                    <div className="pt-0.5">
                      {showSaveSigInput ? (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <label className="block text-[10px] font-bold text-slate-600">
                            Nama / Label Tanda Tangan:
                          </label>
                          <input
                            type="text"
                            value={newSigLabel}
                            onChange={(e) => setNewSigLabel(e.target.value)}
                            placeholder={`Contoh: TTD ${currentUser?.full_name || 'Galang'}`}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-emerald-500"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setShowSaveSigInput(false)}
                              className="px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveCurrentSignature}
                              disabled={isSavingSignature || !hasDrawn}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              {isSavingSignature ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookmarkPlus className="w-3 h-3" />}
                              <span>Simpan</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setShowSaveSigInput(true)}
                            disabled={!hasDrawn}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-emerald-50 transition-colors"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            <span>Simpan Tanda Tangan Ini</span>
                          </button>
                          <span className="text-[10px] text-slate-400">Siap pakai lagi</span>
                        </div>
                      )}
                    </div>

                    {/* Ink Selector (Hanya untuk Gores Langsung) */}
                    {signatureInputMethod === 'draw' && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">Warna Tinta:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInkColor('#0f172a')}
                            className={`w-5 h-5 rounded-full bg-slate-900 border ${
                              inkColor === '#0f172a' ? 'ring-2 ring-emerald-500 border-white' : 'border-slate-300'
                            } cursor-pointer`}
                            title="Hitam"
                          />
                          <button
                            type="button"
                            onClick={() => setInkColor('#1e3a8a')}
                            className={`w-5 h-5 rounded-full bg-blue-900 border ${
                              inkColor === '#1e3a8a' ? 'ring-2 ring-emerald-500 border-white' : 'border-slate-300'
                            } cursor-pointer`}
                            title="Biru Gelap"
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Only Tanda Tangan:</span>
                      </div>
                      <p>
                        Kotak hijau di pratinjau PDF dapat Anda klik atau geser ke halaman dan posisi yang Anda inginkan.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleInternalStampAndDownload}
                      disabled={isExporting || !hasDrawn}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Membubuhkan TTD...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Tempelkan & Unduh PDF Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* MODE 2: EXTERNAL RECIPIENT SETTINGS */}
                {signMode === 'external' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl text-indigo-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Minta Tanda Tangan Eksternal</span>
                      </div>
                      <p className="text-[11px] text-indigo-700 leading-relaxed">
                        Penerima dapat membuka tautan tanda tangan dari HP atau komputer mereka <strong>tanpa harus login</strong>.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nama Penerima Eksternal <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={externalRecipientName}
                          onChange={(e) => setExternalRecipientName(e.target.value)}
                          placeholder="Contoh: Bpk. Bambang Pamungkas"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-950 text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-indigo-700">
                        <Move className="w-3.5 h-3.5" />
                        <span>Posisi Tanda Tangan:</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Geser kotak hijau penanda di lembar PDF ke area tempat pihak luar harus menandatangani.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateExternalLink}
                      disabled={isCreatingLink || !externalRecipientName.trim()}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isCreatingLink ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Membuat Tautan Publik...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Buat Link Tanda Tangan</span>
                        </>
                      )}
                    </button>

                    {/* Result Link Modal / Box */}
                    {createdExternalResult && (
                      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Link Tanda Tangan Siap Dikirim!</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Pihak luar dapat membuka link ini langsung tanpa perlu login:
                        </p>
                        <div className="p-2 bg-white rounded-xl border border-slate-200 text-[10px] font-mono text-slate-700 break-all select-all">
                          {createdExternalResult.share_url}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(createdExternalResult.share_url)}
                            className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleShareWhatsApp(
                                createdExternalResult.share_url,
                                createdExternalResult.recipientName,
                                createdExternalResult.title
                              )
                            }
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* DOCUMENT VIEWPORT & CANVAS VIEWER */}
              <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
                {/* PDF Viewer Bar */}
                <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 shrink-0 flex items-center justify-between text-xs text-white z-10">
                  <div className="flex items-center gap-2">
                    {numPages > 1 && (
                      <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage <= 1}
                          className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded-lg cursor-pointer"
                          title="Halaman Sebelumnya"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[11px] font-mono px-1">
                          Hal {currentPage} dari {numPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                          disabled={currentPage >= numPages}
                          className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded-lg cursor-pointer"
                          title="Halaman Selanjutnya"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      Klik pada halaman PDF untuk memindahkan kotak tanda tangan
                    </span>
                  </div>

                  {/* Zoom & Fit controls */}
                  <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode('fit-page');
                        calculateAndApplyFit('fit-page');
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                        fitMode === 'fit-page'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                      title="Sesuaikan ukuran penuh ke layar"
                    >
                      Fit Halaman
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFitMode('fit-width');
                        calculateAndApplyFit('fit-width');
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                        fitMode === 'fit-width'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                      title="Sesuaikan dengan lebar layar"
                    >
                      Fit Lebar
                    </button>

                    <div className="w-px h-3 bg-slate-700 mx-0.5" />

                    <button
                      type="button"
                      onClick={() => {
                        setFitMode('custom');
                        setZoomScale((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))));
                      }}
                      className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                      title="Perkecil"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono min-w-8 text-center">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode('custom');
                        setZoomScale((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))));
                      }}
                      className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                      title="Perbesar"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Document Canvas Viewport */}
                <div 
                  ref={viewportWrapperRef}
                  className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center custom-scrollbar"
                >
                  {isLoadingPdf && (
                    <div className="flex flex-col items-center justify-center gap-2 text-white">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                      <span className="text-xs text-slate-400">Memuat halaman PDF...</span>
                    </div>
                  )}

                  {pdfLoadError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{pdfLoadError}</span>
                    </div>
                  )}

                  {/* Document Sheet */}
                  <div
                    ref={containerRef}
                    onClick={handleContainerClick}
                    className="relative bg-white shadow-2xl rounded-xs transition-all overflow-hidden cursor-crosshair shrink-0"
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

                    {/* SIGNATURE PLACEMENT BOX (ONLY TANDA TANGAN) */}
                    {signaturePlacement.page === currentPage && (
                      <div
                        onMouseDown={handleMouseDownOnBox}
                        onTouchStart={handleTouchStartOnBox}
                        style={{
                          left: `${signaturePlacement.xPercent * 100}%`,
                          top: `${signaturePlacement.yPercent * 100}%`,
                          width: `${signaturePlacement.widthPercent * 100}%`,
                        }}
                        className={`absolute select-none z-20 group cursor-grab active:cursor-grabbing border-2 border-dashed rounded-lg p-1.5 shadow-lg ${
                          signMode === 'internal'
                            ? 'border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20'
                            : 'border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20'
                        }`}
                      >
                        {/* Badge Handle */}
                        <div
                          className={`absolute -top-3 left-1 px-1.5 py-0.2 text-white text-[8px] font-bold rounded shadow flex items-center gap-1 pointer-events-none ${
                            signMode === 'internal' ? 'bg-emerald-600' : 'bg-indigo-600'
                          }`}
                        >
                          <Move className="w-2.5 h-2.5" />
                          <span>{signMode === 'internal' ? 'Posisi TTD Anda' : 'Posisi TTD Pihak Luar'}</span>
                        </div>

                        {/* ONLY SIGNATURE IMAGE OR EXTERNAL PLACEHOLDER */}
                        {signMode === 'internal' ? (
                          signatureDataUrl ? (
                            <img
                              src={signatureDataUrl}
                              alt="Tanda Tangan"
                              className="w-full h-auto max-h-24 object-contain drop-shadow-xs"
                            />
                          ) : (
                            <div className="py-3 bg-white/80 rounded flex flex-col items-center justify-center text-emerald-700">
                              <PenTool className="w-4 h-4 text-emerald-600" />
                              <span className="text-[9px] font-bold mt-0.5">Gores Ttd di Samping</span>
                            </div>
                          )
                        ) : (
                          <div className="py-3 bg-white/90 rounded flex flex-col items-center justify-center text-indigo-700 text-center p-2">
                            <PenTool className="w-4 h-4 text-indigo-600" />
                            <span className="text-[9px] font-bold mt-0.5">
                              Area Tanda Tangan {externalRecipientName ? `(${externalRecipientName})` : 'Penerima Eksternal'}
                            </span>
                            <span className="text-[8px] text-slate-500">
                              Penerima akan menandatangani di titik ini
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: DAFTAR RIWAYAT BERKAS TTD & MONITOR STATUS LINK EKSTERNAL         */}
      {/* ========================================================================= */}
      {activeTool === 'sign-history' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Daftar Dokumen & Tanda Tangan Digital
              </h2>
              <p className="text-xs text-slate-500">
                Kelola berkas yang telah ditandatangani serta tautan tanda tangan untuk pihak eksternal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDocuments}
                className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Muat Ulang"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('pdf-sign')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Buat TTD Baru</span>
              </button>
            </div>
          </div>

          {loadingList ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
              <span className="text-xs text-slate-500">Memuat daftar berkas tanda tangan...</span>
            </div>
          ) : documentList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Berkas Tanda Tangan</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Anda belum membuat berkas tanda tangan digital. Mulai sekarang dengan mengunggah PDF dan pilih tanda tangan internal atau kirim tautan ke pihak eksternal.
              </p>
              <button
                type="button"
                onClick={() => setActiveTool('pdf-sign')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Mulai Tanda Tangan PDF</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-3.5 px-4">Nama Dokumen</th>
                      <th className="py-3.5 px-4">Tipe TTD</th>
                      <th className="py-3.5 px-4">Penandatangan</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Waktu</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documentList.map((doc) => {
                      const shareUrl = `${window.location.origin}/?sign_token=${doc.signing_token}`;
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate max-w-xs" title={doc.title}>
                                  {doc.title}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {doc.file_name || 'Dokumen PDF'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {doc.sign_type === 'internal' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                <PenTool className="w-2.5 h-2.5" />
                                <span>Internal</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                                <Share2 className="w-2.5 h-2.5" />
                                <span>Eksternal Link</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">
                              {doc.signer_name || '-'}
                            </div>
                            {doc.signer_role && (
                              <div className="text-[10px] text-slate-400">{doc.signer_role}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {doc.status === 'signed' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Ditandatangani</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                                <Clock className="w-3 h-3" />
                                <span>Menunggu Pihak Luar</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {doc.signed_at 
                              ? new Date(doc.signed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                              : (doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-')}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {/* If external pending: copy link button */}
                              {doc.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(shareUrl)}
                                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                    title="Salin Link Tanda Tangan"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleShareWhatsApp(shareUrl, doc.signer_name || 'Klien', doc.title)}
                                    className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                    title="Bagikan via WhatsApp"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {/* Download signed PDF if available */}
                              {doc.signed_file_url && (
                                <a
                                  href={doc.signed_file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={`${(doc.file_name || doc.title || 'dokumen').replace(/\.[^/.]+$/, '')}_Signed.pdf`}
                                  className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title="Unduh PDF Bertanda Tangan"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}

                              {/* View original file */}
                              {doc.file_url && (
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Buka Berkas"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(doc.id, doc.title)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Berkas"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: SURAT KETERANGAN KERJA GENERATOR                                  */}
      {/* ========================================================================= */}
      {activeTool === 'employment-letter' && (
        <EmploymentLetterGenerator
          currentUser={currentUser}
          onBack={() => setActiveTool('hub')}
        />
      )}
    </div>
  );
};
