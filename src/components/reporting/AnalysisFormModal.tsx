import React, { useState } from 'react';
import { X } from 'lucide-react';
import CustomDatePicker from '../ui/CustomDatePicker';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Buat Analisis Performa</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <h3 className="font-semibold text-slate-800">Periode 1 (Acuan)</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mulai</label>
                <CustomDatePicker value={periodAStart} onChange={setPeriodAStart} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selesai</label>
                <CustomDatePicker value={periodAEnd} onChange={setPeriodAEnd} className="w-full" />
              </div>
            </div>
            
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50 border-blue-100">
              <h3 className="font-semibold text-blue-800">Periode 2 (Bandingkan)</h3>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Mulai</label>
                <CustomDatePicker value={periodBStart} onChange={setPeriodBStart} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Selesai</label>
                <CustomDatePicker value={periodBEnd} onChange={setPeriodBEnd} className="w-full" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Metrik */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Metrik Perbandingan</label>
              <div className="space-y-2">
                {METRICS_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedMetrics.includes(opt.value)}
                      onChange={() => handleMetricToggle(opt.value)}
                      className="w-4 h-4 text-brand-500 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <span className="text-sm text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi & Insight</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              placeholder="Tuliskan analisis atau temuan pada perbandingan dua periode ini..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Analisis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
