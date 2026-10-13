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
  initialData?: BrandPerformanceAnalysis;
}

const SHOPEE_METRICS = [
  { value: 'gmv', label: 'GMV (Revenue)' },
  { value: 'items_sold', label: 'Item Sold (Produk Terjual)' },
  { value: 'orders', label: 'Purchase (Pesanan Dibuat)' },
  { value: 'buyers', label: 'Customer (Pembeli Unik)' },
  { value: 'aov', label: 'AOV (Rata-rata Nilai Pesanan)' },
  { value: 'clicks', label: 'Add to Cart (Keranjang)' },
  { value: 'views', label: 'Views (Total Penonton)' },
  { value: 'viewers_active', label: 'Viewer Active (Penonton Aktif)' },
  { value: 'peak_viewers', label: 'Peak Viewer (Penonton Puncak)' },
  { value: 'vouchers', label: 'Voucher Claim (Klaim Voucher Toko)' },
  { value: 'gmv_per_hour', label: 'GMV / Jam (Laju Omzet)' },
  { value: 'avg_view_duration', label: 'Rata-rata Durasi Tonton' },
  { value: 'likes', label: 'Likes (Jumlah Suka)' },
  { value: 'comments', label: 'Komentar Penonton' },
  { value: 'shares', label: 'Shares (Dibagikan)' },
  { value: 'err', label: 'ERR % (Engagement Rate)' },
];

const TIKTOK_METRICS = [
  { value: 'gmv', label: 'GMV (Revenue)' },
  { value: 'items_sold', label: 'Item Sold (Produk Terjual)' },
  { value: 'orders', label: 'Orders (Pesanan Teratribusi)' },
  { value: 'buyers', label: 'Customer (Pembeli)' },
  { value: 'aov', label: 'AOV (Rata-rata Nilai Pesanan)' },
  { value: 'product_impressions', label: 'Product Impressions (Tayangan Produk)' },
  { value: 'product_clicks', label: 'Product Clicks (Klik Produk)' },
  { value: 'impressions', label: 'Live Impressions (Tayangan Langsung)' },
  { value: 'viewers', label: 'Live Viewer / Penonton' },
  { value: 'new_followers', label: 'Pengikut Baru (New Followers)' },
  { value: 'gmv_per_hour', label: 'GMV / Jam (Laju Omzet)' },
  { value: 'avg_view_duration', label: 'Rata-rata Durasi Tonton' },
  { value: 'likes', label: 'Likes (Jumlah Suka)' },
  { value: 'comments', label: 'Komentar Penonton' },
  { value: 'shares', label: 'Shares (Dibagikan)' },
  { value: 'err', label: 'ERR % (Engagement Rate)' },
];

export default function AnalysisFormModal({ isOpen, onClose, brandId, onSuccess, initialData }: Props) {
  const [name, setName] = useState("");
  const [periodAStart, setPeriodAStart] = useState("");
  const [periodAEnd, setPeriodAEnd] = useState("");
  const [periodBStart, setPeriodBStart] = useState("");
  const [periodBEnd, setPeriodBEnd] = useState("");
  const [platform, setPlatform] = useState("Shopee");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [nextPlan, setNextPlan] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchMetric, setSearchMetric] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setPeriodAStart(initialData.period_a_start || "");
        setPeriodAEnd(initialData.period_a_end || "");
        setPeriodBStart(initialData.period_b_start || "");
        setPeriodBEnd(initialData.period_b_end || "");
        setPlatform(initialData.platform || "Shopee");
        setSelectedMetrics(initialData.comparison_metrics || []);
        setDescription(initialData.description || "");
        setNextPlan(initialData.next_plan || "");
      } else {
        setName("");
        setPeriodAStart("");
        setPeriodAEnd("");
        setPeriodBStart("");
        setPeriodBEnd("");
        setPlatform("Shopee");
        setSelectedMetrics(['gmv', 'items_sold', 'orders', 'aov']);
        setDescription("");
        setNextPlan("");
      }
      setSearchMetric("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isShopee = (platform || "").toLowerCase().includes("shopee");
  const currentMetricsOptions = isShopee ? SHOPEE_METRICS : TIKTOK_METRICS;
  
  const filteredMetrics = currentMetricsOptions.filter(m => 
    m.label.toLowerCase().includes(searchMetric.toLowerCase())
  );

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlatform = e.target.value;
    setPlatform(newPlatform);
    const newIsShopee = newPlatform.toLowerCase().includes("shopee");
    const validMetricKeys = (newIsShopee ? SHOPEE_METRICS : TIKTOK_METRICS).map(m => m.value);

    // Keep overlapping metrics or map equivalents between platforms
    setSelectedMetrics(prev => {
      const retained = prev.filter(m => validMetricKeys.includes(m));
      if (newIsShopee) {
        if (prev.includes('product_clicks') && !retained.includes('clicks')) retained.push('clicks');
        if (prev.includes('impressions') && !retained.includes('views')) retained.push('views');
      } else {
        if (prev.includes('clicks') && !retained.includes('product_clicks')) retained.push('product_clicks');
        if (prev.includes('views') && !retained.includes('impressions')) retained.push('impressions');
      }
      return retained;
    });
    setSearchMetric("");
  };

  const toggleMetric = (value: string) => {
    setSelectedMetrics(prev => 
      prev.includes(value) 
        ? prev.filter(m => m !== value)
        : [...prev, value]
    );
  };

  const getAutoEndDate = (startStr: string) => {
    if (!startStr) return "";
    try {
      const start = new Date(startStr + "T00:00:00Z");
      start.setUTCDate(start.getUTCDate() + 6);
      return start.toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  const handlePeriodAStartChange = (date: string) => {
    setPeriodAStart(date);
    if (date) {
      setPeriodAEnd(getAutoEndDate(date));
    } else {
      setPeriodAEnd("");
    }
  };

  const handlePeriodBStartChange = (date: string) => {
    setPeriodBStart(date);
    if (date) {
      setPeriodBEnd(getAutoEndDate(date));
    } else {
      setPeriodBEnd("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
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
      const payload = {
        name: name.trim(),
        period_a_start: periodAStart,
        period_a_end: periodAEnd,
        period_b_start: periodBStart,
        period_b_end: periodBEnd,
        platform,
        comparison_metrics: selectedMetrics,
        description,
        next_plan: nextPlan,
        brand_id: brandId
      };

      if (initialData) {
        await reportingBrandApi.updateAnalysis(initialData.id, payload);
      } else {
        await reportingBrandApi.createAnalysis(payload);
      }
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
    <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white w-full sm:w-[600px] h-[90vh] sm:h-[85vh] sm:max-h-[800px] flex flex-col sm:rounded-2xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8 duration-300">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Analisis Performa' : 'Buat Analisis Performa'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
            
            {/* Nama Analisis */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Nama Analisis</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Analisis Campaign Lebaran"
                className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
              />
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">Pilih Platform</label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isShopee 
                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}>
                  {isShopee ? 'Shopee Live' : 'TikTok Live'}
                </span>
              </div>
              <select 
                value={isShopee ? "Shopee" : "TikTok"}
                onChange={handlePlatformChange}
                className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-medium cursor-pointer"
              >
                <option value="Shopee">Shopee</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>

            {/* Metrics Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">Pilih Metrik Perbandingan</label>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isShopee
                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  Daftar Metrik {isShopee ? 'Shopee' : 'TikTok'}
                </span>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Cari metrik ${isShopee ? 'Shopee' : 'TikTok'}...`}
                  value={searchMetric}
                  onChange={(e) => setSearchMetric(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg pl-9 pr-3 py-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-xl max-h-60 sm:max-h-72 overflow-y-auto custom-scrollbar shadow-sm divide-y divide-slate-100">
                {filteredMetrics.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">
                    Tidak ada metrik yang cocok dengan "{searchMetric}"
                  </div>
                ) : (
                  filteredMetrics.map(metric => {
                    const isSelected = selectedMetrics.includes(metric.value);
                    return (
                      <button
                        key={metric.value}
                        type="button"
                        onClick={() => toggleMetric(metric.value)}
                        className={`w-full flex items-center justify-between p-3 transition-colors text-left ${
                          isSelected 
                            ? isShopee 
                              ? 'bg-orange-50/50 hover:bg-orange-50' 
                              : 'bg-indigo-50/40 hover:bg-indigo-50/60'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className={`text-sm ${
                            isSelected 
                              ? isShopee ? 'font-semibold text-orange-950' : 'font-semibold text-indigo-950'
                              : 'text-slate-700'
                          }`}>
                            {metric.label}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                          isSelected 
                            ? isShopee ? 'bg-orange-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <p className="text-xs text-slate-500 font-medium">{selectedMetrics.length} metrik dipilih</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMetrics(currentMetricsOptions.map(m => m.value))}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Pilih Semua
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedMetrics([])}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:underline"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Date Periods */}
            <div className="space-y-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/20 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      Periode 1 (Acuan)
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      Data Terbaru
                    </span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Tanggal Mulai</label>
                    <CustomDatePicker
                      value={periodAStart}
                      onChange={handlePeriodAStartChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Tanggal Selesai</label>
                    <CustomDatePicker
                      value={periodAEnd}
                      onChange={setPeriodAEnd}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      Periode 2 (Bandingkan)
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Masa Lampau
                    </span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Tanggal Mulai</label>
                    <CustomDatePicker
                      value={periodBStart}
                      onChange={handlePeriodBStartChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Tanggal Selesai</label>
                    <CustomDatePicker
                      value={periodBEnd}
                      onChange={setPeriodBEnd}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                * Periode 1 (Acuan) adalah <strong>data terbaru</strong> yang akan dibandingkan dengan Periode 2 (<strong>masa lampau</strong>) untuk mengukur persentase kenaikan (+) atau penurunan (-) performa.
              </p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Insight dan Analysis</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 resize-y"
                placeholder="Tuliskan insight dan analisis performa..."
              />
            </div>
            
            {/* Next Plan */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Next Plan / Improvement</label>
              <textarea 
                value={nextPlan}
                onChange={e => setNextPlan(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 resize-y"
                placeholder="Tuliskan rencana perbaikan atau next plan..."
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
