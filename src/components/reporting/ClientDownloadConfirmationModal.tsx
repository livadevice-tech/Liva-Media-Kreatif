import { useState, useEffect, useMemo } from "react";
import {
  Download,
  X,
  FileText,
  FileSpreadsheet,
  Calendar,
  Layers,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { formatDateTimeSafe } from "../../shared/utils/dateTime";

export interface ExportDownloadParams {
  selectedMetrics: string[];
  startDate: string;
  endDate: string;
  platform: string;
}

interface ClientDownloadConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  platform: string;
  availablePlatforms?: string[];
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

  // Local state for interactive filtering inside sidebar
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Semua Platform");
  const [dateMode, setDateMode] = useState<"preset" | "custom">("preset");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

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
    }
  }, [isOpen, startDate, endDate, platform]);

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
      return [
        { id: "date", label: "Tanggal", group: "general" },
        { id: "time", label: "Jam Mulai", group: "general" },
        { id: "platform", label: "Platform", group: "general" },
        { id: "views", label: isShopee ? "Views / Penonton" : "Live Impressions", group: "funnel" },
        { id: "peak_viewers", label: "Peak Viewers (Tertinggi)", group: "funnel" },
        { id: "new_followers", label: "Pengikut Baru (Followers)", group: "engagement" },
        { id: "likes", label: "Total Likes", group: "engagement" },
        { id: "comments", label: "Total Komentar", group: "engagement" },
        { id: "shares", label: "Total Shares", group: "engagement" },
        { id: "engagement_rate", label: "Engagement Rate / ERR (%)", group: "engagement" },
      ];
    }

    // Default: "live" report type
    const metrics: MetricItem[] = [
      { id: "date", label: "Tanggal", group: "general" },
      { id: "time", label: "Jam Mulai", group: "general" },
      { id: "platform", label: "Platform", group: "general" },
      { id: "shift", label: "Shift", group: "general" },
      { id: "duration", label: "Durasi Live", group: "general" },

      // Sales metrics
      { id: "gmv", label: "GMV / Omset (Rp)", group: "sales", description: "Gross Merchandise Value" },
      { id: "items_sold", label: "Produk Terjual (Qty)", group: "sales" },
      { id: "orders", label: "Total Orders", group: "sales" },
      { id: "buyers", label: "Total Customer / Pembeli", group: "sales" },
      { id: "aov", label: "AOV (Rata-rata Order)", group: "sales" },
      { id: "est_income", label: "GMV / Jam (Laju Penjualan)", group: "sales" },

      // Funnel & view metrics
      {
        id: "impressions",
        label: isTikTok ? "Live Impressions" : isShopee ? "Live Views" : "Tayangan / View",
        group: "funnel",
      },
      {
        id: "live_viewer",
        label: isShopee ? "Viewer Aktif" : "Penonton Langsung",
        group: "funnel",
      },
      {
        id: "penonton",
        label: "Total Penonton",
        group: "funnel",
      },
    ];

    if (isTikTok) {
      metrics.push({
        id: "product_impressions",
        label: "Product Impressions",
        group: "funnel",
        description: "Tayangan etalase produk di TikTok",
      });
      metrics.push({
        id: "product_clicks",
        label: "Product Clicks (Klik Produk)",
        group: "funnel",
        description: "Jumlah klik ke produk dari live stream",
      });
    } else if (isShopee) {
      metrics.push({
        id: "product_clicks",
        label: "Add to Cart (Keranjang)",
        group: "funnel",
        description: "Jumlah penambahan ke keranjang dari live Shopee",
      });
      metrics.push({
        id: "shop_vouchers",
        label: "Voucher Diklaim",
        group: "sales",
        description: "Klaim voucher toko live Shopee",
      });
    } else {
      // Semua Platform
      metrics.push({
        id: "product_impressions",
        label: "Product Impressions",
        group: "funnel",
      });
      metrics.push({
        id: "product_clicks",
        label: "Klik Produk / Add to Cart",
        group: "funnel",
      });
      metrics.push({
        id: "shop_vouchers",
        label: "Voucher Toko",
        group: "sales",
      });
    }

    metrics.push({
      id: "conversion_rate",
      label: "Conversion Rate (%)",
      group: "funnel",
      description: "Persentase pembeli dibanding penonton",
    });

    // Engagement metrics
    metrics.push(
      { id: "peak_viewers", label: "Peak Viewers (Penonton Puncak)", group: "engagement" },
      { id: "avg_view_duration", label: "Rata-rata Durasi Tonton (detik)", group: "engagement" },
      { id: "likes", label: "Total Likes", group: "engagement" },
      { id: "comments", label: "Total Komentar", group: "engagement" },
      { id: "shares", label: "Total Shares", group: "engagement" },
      { id: "new_followers", label: "Pengikut Baru", group: "engagement" },
      { id: "err", label: "Engagement Rate / ERR (%)", group: "engagement" },
    );

    return metrics;
  }, [reportType, isTikTok, isShopee]);

  // Set default selected metrics when platform or reportType changes
  useEffect(() => {
    setSelectedMetrics(availableMetrics.map((m) => m.id));
  }, [availableMetrics]);

  if (!isOpen) return null;

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

  const handleDownload = (format: "excel" | "pdf") => {
    const params: ExportDownloadParams = {
      selectedMetrics: selectedMetrics.length > 0 ? selectedMetrics : availableMetrics.map((m) => m.id),
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
      platform: selectedPlatform === "Semua Platform" ? "all" : selectedPlatform,
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
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-xs flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Periode Terpilih:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {formattedStart && formattedEnd && formattedStart !== formattedEnd ? (
                      `${formattedStart} - ${formattedEnd}`
                    ) : (
                      formattedStart || formattedEnd || "Semua Waktu"
                    )}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Dari Tanggal
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Sampai Tanggal
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. METRICS CHECKLIST */}
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
