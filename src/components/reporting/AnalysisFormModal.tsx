import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { reportingBrandApi } from '../../api';
import { BrandPerformanceAnalysis } from '../../shared/types/reporting';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  onSuccess: () => void;
}

const SHOPEE_METRICS = [
  { value: 'gmv', label: 'GMV (Revenue)' },
  { value: 'items_sold', label: 'Item Terjual' },
  { value: 'orders', label: 'Pesanan' },
  { value: 'aov', label: 'AOV (Rata-rata Nilai Pesanan)' },
  { value: 'clicks', label: 'Add to Cart' },
  { value: 'avg_view_duration', label: 'Rata-rata Durasi Tonton' },
  { value: 'viewers_active', label: 'Viewer Active' },
  { value: 'gmv_per_hour', label: 'GMV / Jam' },
  { value: 'impressions', label: 'Live Impressions / Viewer' },
  { value: 'peak_viewers', label: 'Peak Viewer' },
  { value: 'vouchers', label: 'Voucher Claim' },
  { value: 'buyers', label: 'Customer / Pembeli' },
  { value: 'likes', label: 'Likes' },
  { value: 'comments', label: 'Komentar' },
  { value: 'shares', label: 'Shares' },
  { value: 'err', label: 'ERR % (Engagement Rate)' },
];

const TIKTOK_METRICS = [
  { value: 'gmv', label: 'GMV (Revenue)' },
  { value: 'items_sold', label: 'Item Terjual' },
  { value: 'orders', label: 'Pesanan' },
  { value: 'aov', label: 'AOV (Rata-rata Nilai Pesanan)' },
  { value: 'buyers', label: 'Customer / Pembeli' },
  { value: 'product_impressions', label: 'Product Impressions' },
  { value: 'product_clicks', label: 'Product Clicks' },
  { value: 'gmv_per_hour', label: 'GMV / Jam' },
  { value: 'impressions', label: 'Live Impressions' },
  { value: 'viewers', label: 'Live Viewer / Penonton' },
  { value: 'likes', label: 'Likes' },
  { value: 'comments', label: 'Komentar' },
  { value: 'shares', label: 'Shares' },
  { value: 'new_followers', label: 'Pengikut Baru' },
  { value: 'avg_view_duration', label: 'Rata-rata Durasi Tonton' },
  { value: 'err', label: 'ERR % (Engagement Rate)' },
];

export default function AnalysisFormModal({ isOpen, onClose, brandId, onSuccess }: Props) {
  const [periodAStart, setPeriodAStart] = useState("");
  const [periodAEnd, setPeriodAEnd] = useState("");
  const [periodBStart, setPeriodBStart] = useState("");
  const [periodBEnd, setPeriodBEnd] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchMetric, setSearchMetric] = useState("");

  useEffect(() => {
    // Reset selected metrics when platform changes
    setSelectedMetrics([]);
    setSearchMetric("");
  }, [platform, isOpen]);

  if (!isOpen) return null;

  const currentMetricsOptions = platform === "Shopee" ? SHOPEE_METRICS : TIKTOK_METRICS;
  
  const filteredMetrics = currentMetricsOptions.filter(m => 
    m.label.toLowerCase().includes(searchMetric.toLowerCase())
  );

  const handleMetricToggle = (val: string) => {
    setSelectedMetrics(prev => prev.includes(val) ? prev.filter(m => m !== val) : [...prev, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodAStart || !periodAEnd || !periodBStart || !periodBEnd) {
      alert("Harap lengkapi semua tanggal periode.");
      return;
    }
    if (selectedMetrics.length === 0) {
      alert("Pilih minimal 1 metrik untuk dianalisis.");
      return;
    }

    setIsSaving(true);
    try {
      await reportingBrandApi.createAnalysis({
        brand_id: brandId,
        period_a_start: periodAStart,
        period_a_end: periodAEnd,
        period_b_start: periodBStart,
        period_b_end: periodBEnd,
        platform,
        comparison_metrics: selectedMetrics,
        description
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan analisis.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/50 overflow-y-auto animate-fadeIn">
      <div className="min-h-full flex items-center justify-center p-4 py-12">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col relative">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Buat Analisis Performa</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">Pilih Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-700 transition-all outline-none"
              >
                <option value="TikTok">TikTok</option>
                <option value="Shopee">Shopee</option>
              </select>
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-5 border rounded-xl bg-slate-50/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <h3 className="font-medium text-slate-700">Periode 1 (Acuan)</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Tanggal Mulai</label>
                  <CustomDatePicker value={periodAStart} onChange={setPeriodAStart} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Tanggal Selesai</label>
                  <CustomDatePicker value={periodAEnd} onChange={setPeriodAEnd} className="w-full" />
                </div>
              </div>
              
              <div className="space-y-4 p-5 border rounded-xl bg-indigo-50/30 border-indigo-100/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h3 className="font-medium text-indigo-700">Periode 2 (Bandingkan)</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-700/80 mb-1.5">Tanggal Mulai</label>
                  <CustomDatePicker value={periodBStart} onChange={setPeriodBStart} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-700/80 mb-1.5">Tanggal Selesai</label>
                  <CustomDatePicker value={periodBEnd} onChange={setPeriodBEnd} className="w-full" />
                </div>
              </div>
            </div>

            {/* Metrik Selection with Search */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">Pilih Metrik Perbandingan</label>
              
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari metrik..."
                  value={searchMetric}
                  onChange={(e) => setSearchMetric(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-700 outline-none transition-all"
                />
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col h-[240px]">
                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-2 space-y-1">
                  {filteredMetrics.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      Metrik tidak ditemukan.
                    </div>
                  ) : (
                    filteredMetrics.map(opt => {
                      const isSelected = selectedMetrics.includes(opt.value);
                      return (
                        <div 
                          key={opt.value} 
                          onClick={() => handleMetricToggle(opt.value)}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-white border border-transparent'
                          }`}
                        >
                          <span className={`text-sm ${isSelected ? 'font-medium text-indigo-700' : 'text-slate-600'}`}>
                            {opt.label}
                          </span>
                          <button
                            type="button"
                            className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors ${
                              isSelected 
                                ? 'bg-indigo-500 text-white' 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {selectedMetrics.length > 0 && (
                <div className="mt-2 text-xs text-slate-500">
                  {selectedMetrics.length} metrik dipilih
                </div>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">Deskripsi & Insight</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-700 transition-all outline-none resize-y"
                placeholder="Tuliskan analisis atau temuan pada perbandingan dua periode ini..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isSaving ? "Menyimpan..." : "Simpan Analisis"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
