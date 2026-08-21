import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, TrendingUp } from 'lucide-react';
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
  buyers: { label: 'Pembeli', key: 'buyers' }
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Analysis Performance</h2>
          <p className="text-sm text-slate-500 mt-1">
            Bandingkan performa brand antar dua periode secara kustom.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium shadow-sm shadow-brand-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Analisis
        </button>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Belum ada Analisis</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4 max-w-sm">
            Mulai analisis performa dengan membandingkan dua rentang waktu berbeda untuk melihat insight menarik.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Analisis Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {analyses.map(analysis => {
            const chartDataArray = aggregateData(analysis);

            return (
              <div key={analysis.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b bg-slate-50/50 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                        {analysis.platform}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Dibuat pada {new Date(analysis.created_at || '').toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm font-medium text-slate-700">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></div>
                        <span>P1: {analysis.period_a_start} s/d {analysis.period_a_end}</span>
                      </div>
                      <span className="hidden sm:inline text-slate-300">|</span>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                        <span>P2: {analysis.period_b_start} s/d {analysis.period_b_end}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(analysis.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {chartDataArray.map((chartItem, idx) => (
                      <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 text-center mb-4">{chartItem?.metricLabel}</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartItem?.data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#64748b' }} 
                                tickFormatter={(value) => chartItem?.metricId === 'gmv' ? `Rp ${(value/1000000).toFixed(1)}M` : value}
                              />
                              <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number, name: string) => [
                                  formatNumber(value, chartItem?.metricId === 'gmv'), 
                                  name
                                ]}
                              />
                              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                              <Bar dataKey="Periode 1" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                              <Bar dataKey="Periode 2" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysis.description && (
                    <div className="bg-brand-50/50 border border-brand-100 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-brand-900 mb-2">Insight & Analisis</h4>
                      <p className="text-sm text-brand-800 whitespace-pre-wrap leading-relaxed">
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
