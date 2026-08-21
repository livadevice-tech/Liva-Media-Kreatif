import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, TrendingUp, BarChart3, AlertCircle, Edit3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportingBrandApi } from '../../api';
import { BrandPerformanceAnalysis, BrandPerformanceLogEntry } from '../../shared/types/reporting';
import AnalysisFormModal from './AnalysisFormModal';

interface Props {
  brandId: string;
  logs: BrandPerformanceLogEntry[];
}

const METRICS_MAP: Record<string, { label: string; key?: keyof BrandPerformanceLogEntry; compute?: (logs: BrandPerformanceLogEntry[]) => number }> = {
  gmv: { label: 'Omzet (GMV)', key: 'gmv' },
  orders: { label: 'Pesanan (Orders)', key: 'orders' },
  views: { label: 'Views (Impresi)', key: 'views' },
  penonton: { label: 'Penonton', key: 'penonton' },
  viewers: { label: 'Live Viewer / Penonton', key: 'penonton' },
  buyers: { label: 'Customer / Pembeli', key: 'buyers' },
  items_sold: { label: 'Item Terjual', key: 'products_sold' },
  aov: { label: 'AOV', key: 'aov' },
  clicks: { label: 'Add to Cart', key: 'clicks' },
  avg_view_duration: { label: 'Rata-rata Durasi Tonton', key: 'avg_view_duration' },
  viewers_active: { label: 'Viewer Active', key: 'penonton' },
  gmv_per_hour: { label: 'GMV / Jam', compute: (logs) => {
    const totalGmv = logs.reduce((acc, curr) => acc + (Number(curr.gmv) || 0), 0);
    const totalDuration = logs.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);
    if (totalDuration === 0) return 0;
    return totalGmv / (totalDuration / 3600);
  }},
  impressions: { label: 'Live Impressions / Viewer', key: 'impressions' },
  peak_viewers: { label: 'Peak Viewer', key: 'peak_viewers' },
  vouchers: { label: 'Voucher Claim', key: 'shop_vouchers' },
  likes: { label: 'Likes', key: 'likes' },
  comments: { label: 'Komentar', key: 'comments' },
  shares: { label: 'Shares', key: 'shares' },
  err: { label: 'ERR %', compute: (logs) => {
    const totalInteractions = logs.reduce((acc, curr) => acc + (Number(curr.likes) || 0) + (Number(curr.comments) || 0) + (Number(curr.shares) || 0), 0);
    const totalViews = logs.reduce((acc, curr) => acc + (Number(curr.views) || Number(curr.impressions) || 0), 0);
    if (totalViews === 0) return 0;
    return Number(((totalInteractions / totalViews) * 100).toFixed(2));
  }},
  product_impressions: { label: 'Product Impressions', key: 'productImpressions' },
  product_clicks: { label: 'Product Clicks', key: 'clicks' },
  new_followers: { label: 'Pengikut Baru', key: 'followers' },
};

export default function AnalysisPerformanceTab({ brandId, logs }: Props) {
  const [analyses, setAnalyses] = useState<BrandPerformanceAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<BrandPerformanceAnalysis | undefined>();

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

  const normalizeDate = (dString?: string) => {
    if (!dString) return '';
    return dString.substring(0, 10);
  };

  const aggregateData = (analysis: BrandPerformanceAnalysis) => {
    // Filter logs for Period A
    const logsA = logs.filter(l => {
      const d = normalizeDate(l.date || l.dateTime);
      if (!d) return false;
      const matchPlatform = analysis.platform === 'Semua Platform' || l.platform === analysis.platform;
      return matchPlatform && d >= analysis.period_a_start && d <= analysis.period_a_end;
    });

    // Filter logs for Period B
    const logsB = logs.filter(l => {
      const d = normalizeDate(l.date || l.dateTime);
      if (!d) return false;
      const matchPlatform = analysis.platform === 'Semua Platform' || l.platform === analysis.platform;
      return matchPlatform && d >= analysis.period_b_start && d <= analysis.period_b_end;
    });

    return analysis.comparison_metrics.map(metric => {
      const mapInfo = METRICS_MAP[metric];
      if (!mapInfo) return null;
      
      let sumA = 0;
      let sumB = 0;

      if (mapInfo.compute) {
        sumA = mapInfo.compute(logsA);
        sumB = mapInfo.compute(logsB);
      } else if (mapInfo.key) {
        sumA = logsA.reduce((acc, curr) => acc + (Number(curr[mapInfo.key!]) || 0), 0);
        sumB = logsB.reduce((acc, curr) => acc + (Number(curr[mapInfo.key!]) || 0), 0);
      }

      return {
        metricId: metric,
        metricLabel: mapInfo.label,
        data: [
          {
            name: mapInfo.label,
            "Data 1": sumA,
            "Data 2": sumB,
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

  const formatDateStr = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
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
          onClick={() => {
            setEditingAnalysis(undefined);
            setIsModalOpen(true);
          }}
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
            onClick={() => {
              setEditingAnalysis(undefined);
              setIsModalOpen(true);
            }}
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
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row xl:items-start justify-between gap-4">
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
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm font-semibold text-slate-700">
                      <div className="flex flex-wrap items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm gap-2">
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] mr-2"></div>
                          <span>Data 1 : {formatDateStr(analysis.period_a_start)} <span className="font-normal text-slate-400 mx-1">s/d</span> {formatDateStr(analysis.period_a_end)}</span>
                        </div>
                        <span className="text-slate-400 text-xs font-bold uppercase mx-1">Vs</span>
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] mr-2"></div>
                          <span>Data 2 : {formatDateStr(analysis.period_b_start)} <span className="font-normal text-slate-400 mx-1">s/d</span> {formatDateStr(analysis.period_b_end)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => {
                        setEditingAnalysis(analysis);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="Edit Analisis"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(analysis.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Hapus Analisis"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
                              <Bar dataKey="Data 1" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                              <Bar dataKey="Data 2" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnalysis(undefined);
        }}
        brandId={brandId}
        onSuccess={fetchAnalyses}
        initialData={editingAnalysis}
      />
    </div>
  );
}
