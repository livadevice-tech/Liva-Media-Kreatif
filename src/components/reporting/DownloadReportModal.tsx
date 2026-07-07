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
  onDownload: (selectedMetricIds: string[]) => void;
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
  onDownload,
}: DownloadReportModalProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const options = METRIC_OPTIONS[reportType] || [];

  useEffect(() => {
    if (isOpen) {
      // Default to all selected
      setSelectedMetrics(options.map((o) => o.id));
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
    onDownload(selectedMetrics);
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
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-500" />
              Unduh Laporan (Excel)
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Pilih metrik yang ingin disertakan di laporan.
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
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
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
            <span className="text-sm font-bold text-slate-700">Pilih Semua</span>
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
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDownload}
            disabled={selectedMetrics.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Unduh XLSX
          </button>
        </div>
      </div>
    </div>
  );
}
