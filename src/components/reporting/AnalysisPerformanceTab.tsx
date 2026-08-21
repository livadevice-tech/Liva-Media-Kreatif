import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportingBrandApi } from '../../api';
import { BrandPerformanceAnalysis, BrandPerformanceLogEntry } from '../../shared/types/reporting';
import AnalysisFormModal from './AnalysisFormModal';

interface Props {
  brandId: string;
  logs: BrandPerformanceLogEntry[];
}

const METRICS_MAP: Record<string, { label: string; key: keyof BrandPerformanceLogEntry }> = {
  gmv: { label: 'Omzet (GMV)', key: 'gmv' },
  orders: { label: 'Pesanan (Orders)', key: 'orders' },
  views: { label: 'Views (Impresi)', key: 'views' },
  penonton: { label: 'Penonton', key: 'penonton' },
  buyers: { label: 'Pembeli', key: 'buyers' },
  items_sold: { label: 'Item Terjual', key: 'items_sold' },
  aov: { label: 'AOV', key: 'aov' },
  clicks: { label: 'Add to Cart', key: 'clicks' },
  avg_view_duration: { label: 'Rata-rata Durasi Tonton', key: 'avg_view_duration' },
  viewers_active: { label: 'Viewer Active', key: 'viewers_active' },
  gmv_per_hour: { label: 'GMV / Jam', key: 'gmv_per_hour' },
  impressions: { label: 'Live Impressions', key: 'impressions' },
  peak_viewers: { label: 'Peak Viewer', key: 'peak_viewers' },
  vouchers: { label: 'Voucher Claim', key: 'vouchers' },
  likes: { label: 'Likes', key: 'likes' },
  comments: { label: 'Komentar', key: 'comments' },
  shares: { label: 'Shares', key: 'shares' },
  err: { label: 'ERR %', key: 'err' },
  product_impressions: { label: 'Product Impressions', key: 'product_impressions' },
  product_clicks: { label: 'Product Clicks', key: 'product_clicks' },
  new_followers: { label: 'Pengikut Baru', key: 'new_followers' },
};

export default function AnalysisPerformanceTab({ brandId, logs }: Props) {
  const [analyses, setAnalyses] = useState<BrandPerformanceAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAnalyses = async () => {
    setIsLoading(true);
    try {
      const data = await reportingBrandApi.getAnalyses(brandId);
      setAnalyses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (brandId) fetchAnalyses();
  }, [brandId]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus analisis ini?')) {
      try {
        await reportingBrandApi.deleteAnalysis(id);
        fetchAnalyses();
      } catch (e) {
        console.error(e);
        alert("Gagal menghapus analisis");
      }
    }
  };

  const aggregateData = (analysis: BrandPerformanceAnalysis) => {
    // Filter logs for Period A
    const logsA = logs.filter(l => {
      const d = l.date || l.dateTime?.split(' ')[0];
      if (!d) return false;
      const matchPlatform = analysis.platform === 'Semua Platform' || l.platform === analysis.platform;
      return matchPlatform && d >= analysis.period_a_start && d <= analysis.period_a_end;
    });

    // Filter logs for Period B
    const logsB = logs.filter(l => {
      const d = l.date || l.dateTime?.split(' ')[0];
      if (!d) return false;
      const matchPlatform = analysis.platform === 'Semua Platform' || l.platform === analysis.platform;
      return matchPlatform && d >= analysis.period_b_start && d <= analysis.period_b_end;
    });

    return analysis.comparison_metrics.map(metric => {
      const mapInfo = METRICS_MAP[metric];
      if (!mapInfo) return null;
      
      const sumA = logsA.reduce((acc, curr) => acc + (Number(curr[mapInfo.key]) || 0), 0);
      const sumB = logsB.reduce((acc, curr) => acc + (Number(curr[mapInfo.key]) || 0), 0);

      return {
        metricId: metric,
        metricLabel: mapInfo.label,
        data: [
          {
            name: mapInfo.label,
            "Periode 1": sumA,
            "Periode 2": sumB,
          }
        ]
      };
    }).filter(Boolean);
  };

  const formatNumber = (num: number, isCurrency: boolean = false) => {
    if (isCurrency) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    }
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Analisis Performa
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 max-w-xl">
            Bandingkan metrik performa brand Anda antar dua rentang waktu yang berbeda untuk mendapatkan insight pertumbuhan.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm shadow-indigo-600/20 active:scale-[0.98] whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Analisis
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-slate-500 font-medium animate-pulse">Memuat data analisis...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 rotate-3 hover:rotate-0 transition-transform">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Belum ada data analisis</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6 max-w-sm leading-relaxed">
            Mulai analisis performa dengan membandingkan dua rentang waktu berbeda. Temukan insight berharga untuk strategi brand ke depan.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2 text-slate-400" />
            Buat Analisis Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {analyses.map(analysis => {
            const chartDataArray = aggregateData(analysis);
            
            // Determine grid columns based on number of charts to avoid awkward whitespace
            const numCharts = chartDataArray.length;
            const gridClass = numCharts === 1 
              ? "grid-cols-1" 
              : numCharts === 2 
                ? "grid-cols-1 md:grid-cols-2" 
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

            return (
              <div key={analysis.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden group">
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                        {analysis.platform}
                      </span>
                      <span className="text-sm font-medium text-slate-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                        {new Date(analysis.created_at || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm font-semibold text-slate-700">
                      <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] mr-2.5"></div>
                        <span>P1: {analysis.period_a_start} <span className="text-slate-400 font-normal mx-1">s/d</span> {analysis.period_a_end}</span>
                      </div>
                      <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] mr-2.5"></div>
                        <span>P2: {analysis.period_b_start} <span className="text-slate-400 font-normal mx-1">s/d</span> {analysis.period_b_end}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(analysis.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                    title="Hapus Analisis"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Card Body */}
                <div className="p-6">
                  {/* Charts Grid */}
                  <div className={`grid gap-6 mb-8 ${gridClass}`}>
                    {chartDataArray.map((chartItem, idx) => (
                      <div key={idx} className="border border-slate-100 rounded-xl p-5 bg-white shadow-sm ring-1 ring-slate-900/5">
                        <h4 className="text-sm font-bold text-slate-800 text-center mb-5 tracking-tight">{chartItem?.metricLabel}</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartItem?.data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} 
                                tickFormatter={(value) => chartItem?.metricId === 'gmv' ? `Rp ${(value/1000000).toFixed(1)}M` : value}
                              />
                              <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                formatter={(value: number, name: string) => [
                                  <span className="font-bold text-slate-800">{formatNumber(value, chartItem?.metricId === 'gmv')}</span>, 
                                  <span className="text-slate-500 font-medium">{name}</span>
                                ]}
                              />
                              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} />
                              <Bar dataKey="Periode 1" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                              <Bar dataKey="Periode 2" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Description Box */}
                  {analysis.description && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-indigo-500" />
                        Insight & Analisis
                      </h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed pl-6">
                        {analysis.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnalysisFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brandId={brandId}
        onSuccess={fetchAnalyses}
      />
    </div>
  );
}
