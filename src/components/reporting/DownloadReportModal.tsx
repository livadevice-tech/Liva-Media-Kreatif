import React, { useState, useEffect } from "react";
import { Download, X, CheckSquare, Square } from "lucide-react";

export type MetricOption = {
  id: string;
  label: string;
};

type DownloadReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reportType: "live" | "product" | "engagement" | "pipeline";
  showAdvancedFilters?: boolean;
  onDownload: (
    selectedMetricIds: string[],
    platform?: string,
    startDate?: string,
    endDate?: string
  ) => void;
};

const METRIC_OPTIONS = {
  live: [
    { id: "date", label: "Tanggal" },
    { id: "time", label: "Jam (Waktu Mulai)" },
    { id: "platform", label: "Platform" },
    { id: "viewers", label: "Viewers (Penonton)" },
    { id: "gmv", label: "GMV (Revenue)" },
    { id: "products_sold", label: "Produk Terjual" },
    { id: "buyers", label: "Total Pembeli" },
    { id: "conversion_rate", label: "Conversion Rate (%)" },
    { id: "avg_view_duration", label: "Rata-rata Waktu Tonton (detik)" },
    { id: "peak_viewers", label: "Peak Viewers" },
    { id: "clicks", label: "Total Clicks" },
    { id: "shares", label: "Total Shares" },
  ],
  product: [
    { id: "date", label: "Tanggal" },
    { id: "platform", label: "Platform" },
    { id: "sku", label: "SKU" },
    { id: "product_name", label: "Nama Produk" },
    { id: "sold", label: "Jumlah Terjual" },
    { id: "revenue", label: "GMV / Revenue (Rp)" },
  ],
  engagement: [
    { id: "date", label: "Tanggal" },
    { id: "time", label: "Jam (Waktu Mulai)" },
    { id: "platform", label: "Platform" },
    { id: "viewers", label: "Viewers (Penonton)" },
    { id: "new_followers", label: "Pengikut Baru" },
    { id: "comments", label: "Komentar" },
    { id: "shares", label: "Total Shares" },
    { id: "likes", label: "Total Likes" },
    { id: "peak_viewers", label: "Peak Viewers" },
  ],
  pipeline: [
    { id: "date", label: "Tanggal" },
    { id: "name", label: "Nama Lead" },
    { id: "status", label: "Status" },
  ],
};

export function DownloadReportModal({
  isOpen,
  onClose,
  reportType,
  showAdvancedFilters,
  onDownload,
}: DownloadReportModalProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Semua Platform");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const options = METRIC_OPTIONS[reportType] || [];

  useEffect(() => {
    if (isOpen) {
      // Default to all selected
      setSelectedMetrics(options.map((o) => o.id));
      setSelectedPlatform("Semua Platform");
      setStartDate("");
      setEndDate("");
    }
  }, [isOpen, options]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedMetrics.length === options.length) {
      setSelectedMetrics([]);
    } else {
      setSelectedMetrics(options.map((o) => o.id));
    }
  };

  const handleDownload = () => {
    if (selectedMetrics.length === 0) return;
    onDownload(
      selectedMetrics,
      showAdvancedFilters ? selectedPlatform : undefined,
      showAdvancedFilters ? startDate : undefined,
      showAdvancedFilters ? endDate : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-500" />
              Unduh Laporan (Excel)
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Sesuaikan data laporan yang ingin diunduh.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {showAdvancedFilters && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Semua Platform">Semua Platform</option>
                  <option value="Shopee">Shopee</option>
                  <option value="TikTok">TikTok</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <hr className="border-slate-100 my-4" />
            </div>
          )}

          <div
            className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 cursor-pointer group"
            onClick={handleToggleAll}
          >
            <div className="text-indigo-500 group-hover:text-indigo-600 transition-colors">
              {selectedMetrics.length === options.length ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
              )}
            </div>
            <span className="text-sm font-bold text-slate-700">Pilih Semua Metrik</span>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => handleToggle(option.id)}
              >
                <div
                  className={`transition-colors ${
                    selectedMetrics.includes(option.id)
                      ? "text-indigo-500"
                      : "text-slate-300 group-hover:text-slate-400"
                  }`}
                >
                  {selectedMetrics.includes(option.id) ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDownload}
            disabled={selectedMetrics.length === 0}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Unduh
          </button>
        </div>
      </div>
    </div>
  );
}
