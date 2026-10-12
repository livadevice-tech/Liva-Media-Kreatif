import { useState, useEffect, useMemo, useRef } from "react";
import {
  Download,
  X,
  FileText,
  FileSpreadsheet,
  Calendar,
  Layers,
  Clock,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Zap,
  CalendarRange,
  Check,
  ArrowUpDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
} from "lucide-react";
import { formatDateTimeSafe } from "../../shared/utils/dateTime";
import { SHIFTS } from "../../data";
import { CustomDatePicker } from "../ui/CustomDatePicker";

export interface ExportDownloadParams {
  selectedMetrics: string[];
  startDate: string;
  endDate: string;
  platform: string;
  shiftFilters?: string[];
  exportMode?: "sessions" | "daily";
  sortOrder?: "desc" | "asc";
}

interface ClientDownloadConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  platform: string;
  availablePlatforms?: string[];
  availableShifts?: string[];
  initialShiftFilters?: string[];
  reportType?: "live" | "product" | "engagement" | "pipeline";
  onDownloadExcel: (params: ExportDownloadParams) => void;
  onDownloadPdf: (params: ExportDownloadParams) => void;
}

interface MetricItem {
  id: string;
  label: string;
  group: "sales" | "funnel" | "engagement" | "general";
  description?: string;
}

export function ClientDownloadConfirmationModal({
  isOpen,
  onClose,
  startDate,
  endDate,
  platform,
  availablePlatforms = ["Semua Platform", "TikTok Live", "Shopee Live"],
  availableShifts = [],
  initialShiftFilters = [],
  reportType = "live",
  onDownloadExcel,
  onDownloadPdf,
}: ClientDownloadConfirmationModalProps) {
  // Ensure "Semua Platform" is an option
  const platformsList = useMemo(() => {
    const set = new Set<string>();
    set.add("Semua Platform");
    availablePlatforms.forEach((p) => {
      if (p && p.trim()) {
        if (p.toLowerCase() === "all" || p.toLowerCase() === "semua platform") {
          set.add("Semua Platform");
        } else {
          set.add(p);
        }
      }
    });
    return Array.from(set);
  }, [availablePlatforms]);

  // Clean available shifts list without duplicates, fallback to default SHIFTS
  const cleanedShiftsList = useMemo(() => {
    const srcList = availableShifts && availableShifts.length > 0 ? availableShifts : SHIFTS;
    return srcList.filter(
      (s) =>
        s &&
        s !== "All Time" &&
        s !== "All Session" &&
        s !== "Semua Sesi" &&
        s !== "Semua Shift" &&
        s.trim().length > 0
    );
  }, [availableShifts]);

  // Local state for interactive filtering inside sidebar
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Semua Platform");
  const [dateMode, setDateMode] = useState<"preset" | "custom">("preset");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [isShiftDropdownOpen, setIsShiftDropdownOpen] = useState(false);
  const shiftDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [exportMode, setExportMode] = useState<"sessions" | "daily">("sessions");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Synchronize on modal open or incoming props
  useEffect(() => {
    if (isOpen) {
      const initialPlat =
        !platform || platform === "all" || platform === "Semua Platform"
          ? "Semua Platform"
          : platform;
      setSelectedPlatform(initialPlat);
      setCustomStart(startDate || "");
      setCustomEnd(endDate || startDate || "");
      setDateMode("preset");
      setSelectedShifts(initialShiftFilters ? [...initialShiftFilters] : []);
      setIsShiftDropdownOpen(false);
      setExportMode("sessions");
      setSortOrder("desc");
    }
  }, [isOpen, startDate, endDate, platform, initialShiftFilters]);

  // Close shift dropdown on outside click
  useEffect(() => {
    if (!isShiftDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (shiftDropdownRef.current && !shiftDropdownRef.current.contains(e.target as Node)) {
        setIsShiftDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShiftDropdownOpen]);

  // Handler to toggle shift in multi-select
  const handleToggleShift = (sh: string) => {
    if (selectedShifts.length === 0) {
      setSelectedShifts([sh]);
    } else if (selectedShifts.includes(sh)) {
      const updated = selectedShifts.filter((s) => s !== sh);
      setSelectedShifts(updated);
    } else {
      setSelectedShifts([...selectedShifts, sh]);
    }
  };

  const isTikTok = selectedPlatform.toLowerCase().includes("tiktok");
  const isShopee = selectedPlatform.toLowerCase().includes("shopee");

  // Metrics definitions aligned with platforms
  const availableMetrics = useMemo<MetricItem[]>(() => {
    if (reportType === "product") {
      return [
        { id: "date", label: "Tanggal", group: "general" },
        { id: "platform", label: "Platform", group: "general" },
        { id: "sku", label: "Kode SKU", group: "sales", description: "Nomor SKU unik produk" },
        { id: "product_name", label: "Nama Produk", group: "sales", description: "Nama item / varian produk" },
        { id: "items_sold", label: "Jumlah Terjual (Qty)", group: "sales" },
        { id: "revenue", label: "Total Revenue / GMV (Rp)", group: "sales" },
      ];
    }

    if (reportType === "engagement") {
      if (isTikTok) {
        return [
          { id: "date", label: "Tanggal", group: "general" },
          { id: "time", label: "Jam Mulai", group: "general" },
          { id: "platform", label: "Platform", group: "general" },
          { id: "impressions", label: "Live Impressions", group: "funnel", description: "Tayangan live stream" },
          { id: "penonton", label: "Live Viewer", group: "funnel", description: "Penonton tayangan langsung" },
          { id: "new_followers", label: "New Followers", group: "engagement", description: "Pengikut baru" },
          { id: "likes", label: "Likes", group: "engagement" },
          { id: "comments", label: "Comments", group: "engagement" },
          { id: "shares", label: "Shares", group: "engagement" },
          { id: "avg_view_duration", label: "Avg. View Duration", group: "engagement" },
          { id: "err", label: "ERR %", group: "engagement", description: "Engagement Rate" },
        ];
      }
      if (isShopee) {
        return [
          { id: "date", label: "Tanggal", group: "general" },
          { id: "time", label: "Jam Mulai", group: "general" },
          { id: "platform", label: "Platform", group: "general" },
          { id: "penonton", label: "Views", group: "funnel", description: "Total penonton siaran" },
          { id: "live_viewer", label: "Viewer Active", group: "funnel", description: "Penonton aktif bersamaan" },
          { id: "peak_viewers", label: "Peak Viewer", group: "funnel", description: "Penonton puncak tertinggi" },
          { id: "new_followers", label: "New Followers", group: "engagement", description: "Pengikut baru" },
          { id: "likes", label: "Likes", group: "engagement" },
          { id: "comments", label: "Comments", group: "engagement" },
          { id: "shares", label: "Shares", group: "engagement" },
          { id: "avg_view_duration", label: "Avg. View Duration", group: "engagement" },
          { id: "err", label: "ERR %", group: "engagement", description: "Engagement Rate" },
        ];
      }
      return [
        { id: "date", label: "Tanggal", group: "general" },
        { id: "time", label: "Jam Mulai", group: "general" },
        { id: "platform", label: "Platform", group: "general" },
        { id: "penonton", label: "Views / Penonton", group: "funnel" },
        { id: "peak_viewers", label: "Peak Viewers (Tertinggi)", group: "funnel" },
        { id: "new_followers", label: "Pengikut Baru (Followers)", group: "engagement" },
        { id: "likes", label: "Total Likes", group: "engagement" },
        { id: "comments", label: "Total Komentar", group: "engagement" },
        { id: "shares", label: "Total Shares", group: "engagement" },
        { id: "avg_view_duration", label: "Avg. View Duration", group: "engagement" },
        { id: "err", label: "Engagement Rate / ERR (%)", group: "engagement" },
      ];
    }

    // Default: "live" report type
    // TIKTOK LIVE SPECIFIC METRICS
    if (isTikTok) {
      return [
        // Sesi & Waktu
        { id: "date", label: "Tanggal", group: "general" },
        { id: "time", label: "Jam Mulai", group: "general" },
        { id: "platform", label: "Platform", group: "general" },
        { id: "shift", label: "Shift", group: "general" },
        { id: "duration", label: "Durasi Live", group: "general" },

        // Metrik Penjualan & Revenue
        { id: "gmv", label: "GMV (Rp)", group: "sales", description: "Gross Merchandise Value" },
        { id: "items_sold", label: "Item Sold (Qty)", group: "sales", description: "Total produk terjual" },
        { id: "orders", label: "Orders", group: "sales", description: "Total pesanan dibuat" },
        { id: "buyers", label: "Customer", group: "sales", description: "Jumlah pembeli unik" },
        { id: "aov", label: "AOV (Rp)", group: "sales", description: "Average Order Value" },
        { id: "product_impressions", label: "Product Impressions", group: "sales", description: "Tayangan etalase produk TikTok" },
        { id: "product_clicks", label: "Product Clicks", group: "sales", description: "Klik ke produk dari live stream" },
        { id: "est_income", label: "GMV/Hours (Rp)", group: "sales", description: "Laju omset per jam siaran" },
        { id: "conversion_rate", label: "Conversion Rate (%)", group: "sales", description: "Rasio pesanan dibanding klik produk" },

        // Corong Penonton
        { id: "impressions", label: "Live Impressions", group: "funnel", description: "Total tayangan ruang siaran TikTok" },
        { id: "penonton", label: "Live Viewer", group: "funnel", description: "Penonton siaran langsung" },

        // Interaksi & Komunitas
        { id: "avg_view_duration", label: "Avg. View Duration (detik)", group: "engagement", description: "Rata-rata durasi tonton" },
        { id: "likes", label: "Likes", group: "engagement", description: "Total suka di TikTok" },
        { id: "comments", label: "Comments", group: "engagement", description: "Total komentar live" },
        { id: "shares", label: "Shares", group: "engagement", description: "Total dibagikan" },
        { id: "new_followers", label: "New Followers", group: "engagement", description: "Follower baru diperoleh" },
        { id: "err", label: "ERR %", group: "engagement", description: "Engagement Rate terhadap penonton" },
      ];
    }

    // SHOPEE LIVE SPECIFIC METRICS
    if (isShopee) {
      return [
        // Sesi & Waktu
        { id: "date", label: "Tanggal", group: "general" },
        { id: "time", label: "Jam Mulai", group: "general" },
        { id: "platform", label: "Platform", group: "general" },
        { id: "shift", label: "Shift", group: "general" },
        { id: "duration", label: "Durasi Live", group: "general" },

        // Metrik Penjualan & Revenue
        { id: "gmv", label: "GMV (Rp)", group: "sales", description: "Gross Merchandise Value" },
        { id: "items_sold", label: "Item Sold (Qty)", group: "sales", description: "Total produk terjual" },
        { id: "orders", label: "Purchase", group: "sales", description: "Total pesanan dibuat (Shopee Purchase)" },
        { id: "buyers", label: "Customer", group: "sales", description: "Jumlah pembeli unik" },
        { id: "aov", label: "AOV (Rp)", group: "sales", description: "Average Order Value" },
        { id: "product_clicks", label: "Add to Cart", group: "sales", description: "Penambahan produk ke keranjang" },
        { id: "est_income", label: "GMV/Hours (Rp)", group: "sales", description: "Laju omset per jam siaran" },
        { id: "shop_vouchers", label: "Voucher Claim", group: "sales", description: "Klaim voucher toko live Shopee" },
        { id: "conversion_rate", label: "Conversion Rate (%)", group: "sales", description: "Rasio pembeli dibanding penonton" },

        // Corong Penonton
        { id: "penonton", label: "Views", group: "funnel", description: "Total penonton tayangan Shopee" },
        { id: "live_viewer", label: "Viewer Active", group: "funnel", description: "Penonton aktif selama streaming" },
        { id: "peak_viewers", label: "Peak Viewer", group: "funnel", description: "Penonton bersamaan tertinggi" },

        // Interaksi & Komunitas
        { id: "avg_view_duration", label: "Avg. View Duration (detik)", group: "engagement", description: "Rata-rata durasi tonton" },
        { id: "likes", label: "Likes", group: "engagement", description: "Total suka di Shopee" },
        { id: "comments", label: "Comments", group: "engagement", description: "Total komentar penonton" },
        { id: "shares", label: "Shares", group: "engagement", description: "Total dibagikan" },
        { id: "new_followers", label: "New Followers", group: "engagement", description: "Pengikut baru diperoleh" },
        { id: "err", label: "ERR %", group: "engagement", description: "Engagement Rate terhadap views" },
      ];
    }

    // SEMUA PLATFORM (GENERIC/GABUNGAN)
    return [
      { id: "date", label: "Tanggal", group: "general" },
      { id: "time", label: "Jam Mulai", group: "general" },
      { id: "platform", label: "Platform", group: "general" },
      { id: "shift", label: "Shift", group: "general" },
      { id: "duration", label: "Durasi Live", group: "general" },

      { id: "gmv", label: "GMV (Rp)", group: "sales", description: "Gross Merchandise Value" },
      { id: "items_sold", label: "Item Sold (Qty)", group: "sales" },
      { id: "orders", label: "Orders / Purchase", group: "sales" },
      { id: "buyers", label: "Customer / Pembeli", group: "sales" },
      { id: "aov", label: "AOV (Rp)", group: "sales" },
      { id: "product_clicks", label: "Product Clicks / Add to Cart", group: "sales" },
      { id: "product_impressions", label: "Product Impressions (TikTok)", group: "sales" },
      { id: "shop_vouchers", label: "Voucher Claim (Shopee)", group: "sales" },
      { id: "est_income", label: "GMV/Hours (Rp)", group: "sales" },
      { id: "conversion_rate", label: "Conversion Rate (%)", group: "sales" },

      { id: "penonton", label: "Views / Live Viewer", group: "funnel" },
      { id: "live_viewer", label: "Viewer Active", group: "funnel" },
      { id: "peak_viewers", label: "Peak Viewers", group: "funnel" },

      { id: "avg_view_duration", label: "Avg. View Duration (detik)", group: "engagement" },
      { id: "likes", label: "Likes", group: "engagement" },
      { id: "comments", label: "Comments", group: "engagement" },
      { id: "shares", label: "Shares", group: "engagement" },
      { id: "new_followers", label: "New Followers", group: "engagement" },
      { id: "err", label: "ERR %", group: "engagement" },
    ];
  }, [reportType, isTikTok, isShopee]);

  // Set default selected metrics when platform or reportType changes
  useEffect(() => {
    setSelectedMetrics(availableMetrics.map((m) => m.id));
  }, [availableMetrics]);

  const toggleMetric = (id: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSelectAllMetrics = () => {
    if (selectedMetrics.length === availableMetrics.length) {
      // Keep at least basic info
      setSelectedMetrics(["date", "platform"]);
    } else {
      setSelectedMetrics(availableMetrics.map((m) => m.id));
    }
  };

  const isAllSelected = selectedMetrics.length === availableMetrics.length;

  const effectiveStartDate = dateMode === "custom" && customStart ? customStart : startDate;
  const effectiveEndDate =
    dateMode === "custom" ? (customEnd || customStart) : (endDate || startDate);

  const formattedStart = effectiveStartDate
    ? formatDateTimeSafe(effectiveStartDate, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const formattedEnd = effectiveEndDate
    ? formatDateTimeSafe(effectiveEndDate, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const formatIndonesianDateShort = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
    ];
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1] || "";
    const year = parts[0];
    return `${day} ${month} ${year}`;
  };

  const customDurationDays = useMemo(() => {
    if (!customStart || !customEnd) return null;
    const s = new Date(customStart).getTime();
    const e = new Date(customEnd).getTime();
    if (isNaN(s) || isNaN(e)) return null;
    return Math.round((e - s) / (1000 * 3600 * 24)) + 1;
  }, [customStart, customEnd]);

  const handleApplyPreset = (preset: "today" | "7d" | "30d" | "thisMonth") => {
    const today = new Date();
    const formatYmd = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (preset === "today") {
      const tStr = formatYmd(today);
      setCustomStart(tStr);
      setCustomEnd(tStr);
    } else if (preset === "7d") {
      const past = new Date(today);
      past.setDate(past.getDate() - 6);
      setCustomStart(formatYmd(past));
      setCustomEnd(formatYmd(today));
    } else if (preset === "30d") {
      const past = new Date(today);
      past.setDate(past.getDate() - 29);
      setCustomStart(formatYmd(past));
      setCustomEnd(formatYmd(today));
    } else if (preset === "thisMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setCustomStart(formatYmd(firstDay));
      setCustomEnd(formatYmd(today));
    }
  };

  const handleDownload = (format: "excel" | "pdf") => {
    const params: ExportDownloadParams = {
      selectedMetrics: selectedMetrics.length > 0 ? selectedMetrics : availableMetrics.map((m) => m.id),
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
      platform: selectedPlatform === "Semua Platform" ? "all" : selectedPlatform,
      shiftFilters: selectedShifts,
      exportMode,
      sortOrder,
    };

    if (format === "excel") {
      onDownloadExcel(params);
    } else {
      onDownloadPdf(params);
    }
    onClose();
  };

  // Group metrics for easy scanning
  const groups: Array<{ key: MetricItem["group"]; title: string }> = [
    { key: "general", title: "Informasi Sesi & Waktu" },
    { key: "sales", title: "Metrik Penjualan & Revenue" },
    { key: "funnel", title: "Metrik Corong Penonton & Klik" },
    { key: "engagement", title: "Interaksi & Komunitas" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel from right */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-out border-l border-slate-100">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Custom Export Laporan</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Sesuaikan rentang waktu, platform, & metriks data
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Configuration Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-left">
            
            {/* 0. EXPORT DATA MODE (PER SESI VS AKUMULASI HARIAN) */}
            {reportType === "live" && (
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                  Mode Data Ekspor
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExportMode("sessions")}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      exportMode === "sessions"
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Per Sesi (Start Time)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                        {exportMode === "sessions" ? "Dipilih" : "Rekomendasi"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Ekspor data per sesi live saat di-start dengan jam mulai individual (bukan akumulasi).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportMode("daily")}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      exportMode === "daily"
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Akumulasi Per Hari</span>
                      {exportMode === "daily" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                          Dipilih
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Total performa digabungkan dan diakumulasi menjadi satu baris per hari.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* 1. PLATFORM SELECTION */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Pilihan Platform
              </label>
              <div className="relative">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
                  {platformsList.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Metriks yang tersedia di bawah akan otomatis menyesuaikan dengan platform ini.
              </p>
            </div>

            {/* 2. DATE RANGE SELECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Rentang Waktu / Periode
                </label>
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setDateMode("preset")}
                    className={`rounded-md px-2.5 py-1 transition-all ${
                      dateMode === "preset"
                        ? "bg-white text-indigo-600 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Sesuai Filter Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateMode("custom")}
                    className={`rounded-md px-2.5 py-1 transition-all ${
                      dateMode === "custom"
                        ? "bg-white text-indigo-600 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Kustom Tanggal
                  </button>
                </div>
              </div>

              {dateMode === "preset" ? (
                <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50/90 via-indigo-50/30 to-purple-50/30 p-4 shadow-xs transition-all duration-300 animate-fadeIn flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                      <CalendarRange className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Periode Terpilih
                      </span>
                      <div className="text-xs font-bold text-slate-800">
                        {formattedStart && formattedEnd && formattedStart !== formattedEnd ? (
                          `${formattedStart} - ${formattedEnd}`
                        ) : (
                          formattedStart || formattedEnd || "Semua Waktu"
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                    Sesuai Filter
                  </span>
                </div>
              ) : (
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50/40 p-4 shadow-sm space-y-3.5 transition-all duration-300 animate-fadeIn">
                  {/* Quick Preset Shortcuts */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap pb-2 border-b border-indigo-100/60">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Pilihan Cepat:</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { id: "today", label: "Hari Ini" },
                        { id: "7d", label: "7 Hari" },
                        { id: "30d", label: "30 Hari" },
                        { id: "thisMonth", label: "Bulan Ini" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleApplyPreset(p.id as any)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200/90 bg-white hover:border-indigo-400 hover:bg-indigo-50/60 hover:text-indigo-700 text-slate-600 shadow-3xs transition-all active:scale-95 cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Date Pickers Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
                    {/* Start Date Card */}
                    <div className="group rounded-xl border border-slate-200/90 bg-white p-3 shadow-xs transition-all duration-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          Dari Tanggal
                        </label>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Mulai
                        </span>
                      </div>
                      <CustomDatePicker
                        value={customStart}
                        onChange={setCustomStart}
                        placeholder="Pilih Tanggal Mulai"
                        className="w-full"
                        formatDisplay={formatIndonesianDateShort}
                        buttonClassName="w-full flex items-center justify-between px-3 py-2 bg-slate-50/60 group-hover:bg-white border border-slate-200/80 rounded-lg text-xs font-bold text-slate-800 shadow-3xs hover:border-indigo-400 focus:border-indigo-500 transition-all cursor-pointer text-left"
                      />
                    </div>

                    {/* End Date Card */}
                    <div className="group rounded-xl border border-slate-200/90 bg-white p-3 shadow-xs transition-all duration-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          Sampai Tanggal
                        </label>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Akhir
                        </span>
                      </div>
                      <CustomDatePicker
                        value={customEnd}
                        onChange={setCustomEnd}
                        placeholder="Pilih Tanggal Akhir"
                        className="w-full"
                        align="right"
                        formatDisplay={formatIndonesianDateShort}
                        buttonClassName="w-full flex items-center justify-between px-3 py-2 bg-slate-50/60 group-hover:bg-white border border-slate-200/80 rounded-lg text-xs font-bold text-slate-800 shadow-3xs hover:border-indigo-400 focus:border-indigo-500 transition-all cursor-pointer text-left"
                      />
                    </div>
                  </div>

                  {/* Dynamic Range Summary Banner with Animation */}
                  {customStart && customEnd && (
                    <div className="pt-0.5">
                      {customDurationDays !== null && customDurationDays > 0 ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 px-3 text-xs flex items-center justify-between text-emerald-900 animate-fadeIn">
                          <div className="flex items-center gap-2 truncate">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium text-[11px] truncate">
                              <strong className="font-bold text-slate-800">{formatIndonesianDateShort(customStart)}</strong>
                              {" → "}
                              <strong className="font-bold text-slate-800">{formatIndonesianDateShort(customEnd)}</strong>
                            </span>
                          </div>
                          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shadow-3xs">
                            {customDurationDays} Hari
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 px-3 text-xs flex items-center gap-2 text-rose-800 animate-fadeIn">
                          <span className="text-[11px] font-bold">
                            ⚠️ Tanggal awal tidak boleh melebihi tanggal akhir.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. URUTAN TANGGAL & JAM MULAI (SORT ORDER) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
                  Urutan Data (Tanggal & Jam Mulai)
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                  {sortOrder === "desc" ? "DESC (Terbaru)" : "ASC (Terlama)"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Option DESC */}
                <button
                  type="button"
                  onClick={() => setSortOrder("desc")}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer relative ${
                    sortOrder === "desc"
                      ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-1 ring-indigo-200"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <ArrowDownWideNarrow className="w-4 h-4 text-indigo-600" />
                      <span>Terbaru → Terlama</span>
                    </div>
                    {sortOrder === "desc" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-extrabold bg-indigo-600 text-white">
                        DESC
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Tanggal & jam live terbaru di posisi baris paling atas.
                  </p>
                </button>

                {/* Option ASC */}
                <button
                  type="button"
                  onClick={() => setSortOrder("asc")}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer relative ${
                    sortOrder === "asc"
                      ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-1 ring-indigo-200"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <ArrowUpNarrowWide className="w-4 h-4 text-indigo-600" />
                      <span>Terlama → Terbaru</span>
                    </div>
                    {sortOrder === "asc" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-extrabold bg-indigo-600 text-white">
                        ASC
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Urutan kronologis, tanggal & jam awal di posisi paling atas.
                  </p>
                </button>
              </div>
            </div>

            {/* 4. SHIFT / SESSION SELECTION (Multi-Select) */}
            {cleanedShiftsList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Pilihan Shift / Sesi
                  </label>
                  {selectedShifts.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setSelectedShifts([])}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Reset (Pilih Semua)
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">
                      Semua Shift Aktif
                    </span>
                  )}
                </div>

                {/* Custom Multi-Select Dropdown Container */}
                <div className="relative" ref={shiftDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsShiftDropdownOpen((prev) => !prev)}
                    className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 shadow-sm outline-none transition flex items-center justify-between cursor-pointer ${
                      isShiftDropdownOpen
                        ? "border-indigo-500 bg-white ring-2 ring-indigo-100"
                        : selectedShifts.length > 0
                        ? "border-indigo-200 bg-indigo-50/40 text-indigo-900 hover:bg-indigo-50/70"
                        : "border-slate-200 bg-slate-50/50 hover:bg-white text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {selectedShifts.length === 0
                          ? "All Session (Semua Sesi / Shift)"
                          : selectedShifts.length === 1
                          ? `1 Shift: ${selectedShifts[0]}`
                          : `${selectedShifts.length} Shift Dipilih (${selectedShifts.join(", ")})`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {selectedShifts.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-2xs">
                          {selectedShifts.length} dipilih
                        </span>
                      )}
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                          isShiftDropdownOpen ? "rotate-180 text-indigo-600" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Multi-Select Floating Dropdown Menu */}
                  {isShiftDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in duration-200 space-y-1">
                      {/* All Session Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedShifts([]);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          selectedShifts.length === 0
                            ? "bg-indigo-50 text-indigo-900 border border-indigo-200/80 font-bold shadow-2xs"
                            : "hover:bg-slate-50 text-slate-700 font-medium border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {selectedShifts.length === 0 ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span className="font-bold text-slate-800">
                            All Session (Semua Sesi / Shift)
                          </span>
                        </div>
                        {selectedShifts.length === 0 && (
                          <span className="text-[10px] text-indigo-600 font-bold bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                            Aktif
                          </span>
                        )}
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      {/* Individual Shifts List */}
                      <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {cleanedShiftsList.map((sh) => {
                          const isSelected = selectedShifts.includes(sh);
                          return (
                            <button
                              key={sh}
                              type="button"
                              onClick={() => handleToggleShift(sh)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-50/80 text-indigo-900 border border-indigo-200/70 font-bold shadow-2xs"
                                  : "hover:bg-slate-50 text-slate-700 border border-transparent font-medium"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 truncate">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 shrink-0" />
                                )}
                                <span className="truncate">{sh}</span>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-indigo-600 stroke-[2.5] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">
                          {selectedShifts.length === 0
                            ? "Semua shift dipilih"
                            : `${selectedShifts.length} dari ${cleanedShiftsList.length} shift dipilih`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {selectedShifts.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedShifts([])}
                              className="px-2 py-1 text-slate-500 hover:text-slate-700 font-bold transition-colors cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsShiftDropdownOpen(false)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors cursor-pointer"
                          >
                            Selesai
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Interactive Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Pilihan Cepat:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedShifts([])}
                    className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      selectedShifts.length === 0
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    Semua Sesi
                  </button>
                  {cleanedShiftsList.map((sh) => {
                    const isSelected = selectedShifts.includes(sh);
                    return (
                      <button
                        key={sh}
                        type="button"
                        onClick={() => handleToggleShift(sh)}
                        className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-200 shadow-2xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-indigo-600 stroke-[3]" />}
                        <span>{sh}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Summary Helper Text */}
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {selectedShifts.length === 0 ||
                  selectedShifts[0] === "All Session" ||
                  selectedShifts[0] === "All Time"
                    ? "Menampilkan data dari seluruh sesi (All Session)."
                    : selectedShifts.length === 1
                    ? `Menyaring data khusus untuk 1 shift/sesi: ${selectedShifts[0]}`
                    : `Menyaring data khusus untuk ${selectedShifts.length} shift/sesi terpilih (${selectedShifts.join(", ")}).`}
                </p>
              </div>
            )}

            {/* 4. METRICS CHECKLIST */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  Pilihan Metriks ({selectedMetrics.length}/{availableMetrics.length})
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllMetrics}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  {isAllSelected ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" /> Batal Pilih Semua
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" /> Pilih Semua
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {groups.map((grp) => {
                  const grpMetrics = availableMetrics.filter((m) => m.group === grp.key);
                  if (grpMetrics.length === 0) return null;

                  return (
                    <div key={grp.key} className="space-y-1.5">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {grp.title}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {grpMetrics.map((metric) => {
                          const isChecked = selectedMetrics.includes(metric.id);
                          return (
                            <label
                              key={metric.id}
                              onClick={() => toggleMetric(metric.id)}
                              className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                                isChecked
                                  ? "border-indigo-200 bg-indigo-50/50 text-slate-900 font-semibold shadow-xs"
                                  : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // handled by label onClick
                                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="truncate">{metric.label}</div>
                                {metric.description && (
                                  <div className="text-[10px] text-slate-400 font-normal truncate">
                                    {metric.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. FORMAT CARDS */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Format File Unduhan
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Excel Option */}
                <button
                  type="button"
                  onClick={() => handleDownload("excel")}
                  disabled={selectedMetrics.length === 0}
                  className="group flex flex-col justify-between rounded-xl border-2 border-emerald-500/20 bg-emerald-50/40 p-3.5 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50/80 hover:shadow-md hover:shadow-emerald-500/10 active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                        Unduh Excel
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        .xlsx
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Tabel komplit, mudah diolah untuk spreadsheet.
                  </p>
                </button>

                {/* PDF Option */}
                <button
                  type="button"
                  onClick={() => handleDownload("pdf")}
                  disabled={selectedMetrics.length === 0}
                  className="group flex flex-col justify-between rounded-xl border-2 border-indigo-500/20 bg-indigo-50/40 p-3.5 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50/80 hover:shadow-md hover:shadow-indigo-500/10 active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                        Unduh PDF
                      </h3>
                      <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/70 px-1.5 py-0.5 rounded">
                        .pdf
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Format dokumen cetak rapi & siap dibagikan.
                  </p>
                </button>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {selectedMetrics.length} metriks akan diekspor
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Batal
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
