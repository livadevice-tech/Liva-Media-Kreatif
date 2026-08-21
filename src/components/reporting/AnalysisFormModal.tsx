import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { reportingBrandApi } from '../../api';
import { BrandPerformanceAnalysis } from '../../shared/types/reporting';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  onSuccess: () => void;
}

const METRICS_OPTIONS = [
  { value: 'gmv', label: 'Omzet (GMV)' },
  { value: 'orders', label: 'Pesanan (Orders)' },
  { value: 'views', label: 'Views (Impresi)' },
  { value: 'penonton', label: 'Penonton' },
  { value: 'buyers', label: 'Pembeli' }
];

import { createPortal } from 'react-dom';

export default function AnalysisFormModal({ isOpen, onClose, brandId, onSuccess }: Props) {
  const [periodAStart, setPeriodAStart] = useState("");
  const [periodAEnd, setPeriodAEnd] = useState("");
  const [periodBStart, setPeriodBStart] = useState("");
  const [periodBEnd, setPeriodBEnd] = useState("");
  const [platform, setPlatform] = useState("Semua Platform");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

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
              
              <div className="space-y-4 p-5 border rounded-xl bg-brand-50/30 border-brand-100/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <h3 className="font-medium text-brand-700">Periode 2 (Bandingkan)</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-700/80 mb-1.5">Tanggal Mulai</label>
                  <CustomDatePicker value={periodBStart} onChange={setPeriodBStart} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-700/80 mb-1.5">Tanggal Selesai</label>
                  <CustomDatePicker value={periodBEnd} onChange={setPeriodBEnd} className="w-full" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Metrik */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">Metrik Perbandingan</label>
                <div className="space-y-3">
                  {METRICS_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={selectedMetrics.includes(opt.value)}
                          onChange={() => handleMetricToggle(opt.value)}
                          className="peer appearance-none w-5 h-5 border border-slate-300 rounded cursor-pointer checked:bg-brand-500 checked:border-brand-500 transition-all"
                        />
                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Platform */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-700 transition-all outline-none"
                >
                  <option value="Semua Platform">Semua Platform</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Shopee">Shopee</option>
                  <option value="Tokopedia">Tokopedia</option>
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">Deskripsi & Insight</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-700 transition-all outline-none resize-y"
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
                className="px-6 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
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
