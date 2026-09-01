import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Calendar, TrendingUp, BarChart3, AlertCircle, Edit3, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportingBrandApi } from '../../api';
import { BrandPerformanceAnalysis, BrandPerformanceLogEntry } from '../../shared/types/reporting';
import AnalysisFormModal from './AnalysisFormModal';

interface Props {
  brandId: string;
  logs: BrandPerformanceLogEntry[];
  isClientView?: boolean;
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

const formatNumber = (num: number, isCurrency = false) => {
  if (isCurrency) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
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

const normalizeDate = (dString?: string) => {
  if (!dString) return '';
  if (dString.includes('T')) {
    const date = new Date(dString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return dString.substring(0, 10);
};

const getDaysDiff = (startStr: string, endStr: string) => {
  const start = new Date(startStr + "T00:00:00Z");
  const end = new Date(endStr + "T00:00:00Z");
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const addDays = (dateStr: string, days: number) => {
  const date = new Date(dateStr + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function AnalysisCard({
  analysis,
  logs,
  onEdit,
  onDelete,
  onUpdate,
  isClientView
}: {
  analysis: BrandPerformanceAnalysis;
  logs: BrandPerformanceLogEntry[];
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (id: string, updates: Partial<BrandPerformanceAnalysis>) => Promise<void>;
  isClientView?: boolean;
}) {
  const [activeMetric, setActiveMetric] = useState(analysis.comparison_metrics[0] || '');

  const [isEditingInsight, setIsEditingInsight] = useState(false);
  const [editDescription, setEditDescription] = useState(analysis.description || '');
  const [editNextPlan, setEditNextPlan] = useState(analysis.next_plan || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditDescription(analysis.description || '');
    setEditNextPlan(analysis.next_plan || '');
  }, [analysis]);
  
  const handleSaveInsight = async () => {
    setIsSaving(true);
    try {
      await onUpdate(analysis.id, {
        ...analysis,
        description: editDescription,
        next_plan: editNextPlan
      });
      setIsEditingInsight(false);
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan insight");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!analysis.comparison_metrics.includes(activeMetric)) {
      setActiveMetric(analysis.comparison_metrics[0] || '');
    }
  }, [analysis.comparison_metrics, activeMetric]);

  const pAStart = normalizeDate(analysis.period_a_start);
  const pAEnd = normalizeDate(analysis.period_a_end);
  const pBStart = normalizeDate(analysis.period_b_start);
  const pBEnd = normalizeDate(analysis.period_b_end);
  const targetPlatform = (analysis.platform || '').toLowerCase();

  const summaryData = useMemo(() => {
    const platformLogs = logs.filter(l => {
      return analysis.platform === 'Semua Platform' || (l.platform && l.platform.toLowerCase().includes(targetPlatform));
    });

    const logsA = platformLogs.filter(l => {
      const d = normalizeDate(l.date || l.dateTime);
      return d >= pAStart && d <= pAEnd;
    });
    
    const logsB = platformLogs.filter(l => {
      const d = normalizeDate(l.date || l.dateTime);
      return d >= pBStart && d <= pBEnd;
    });

    return analysis.comparison_metrics.map(m => {
      const mapInfo = METRICS_MAP[m];
      if (!mapInfo) return null;

      let valA = 0;
      let valB = 0;

      if (mapInfo.compute) {
        valA = mapInfo.compute(logsA);
        valB = mapInfo.compute(logsB);
      } else if (mapInfo.key) {
        valA = logsA.reduce((acc, curr) => acc + (Number(curr[mapInfo.key!]) || 0), 0);
        valB = logsB.reduce((acc, curr) => acc + (Number(curr[mapInfo.key!]) || 0), 0);
      }

      let growth = 0;
      if (valA > 0) {
        growth = ((valB - valA) / valA) * 100;
      } else if (valA === 0 && valB > 0) {
        growth = 100;
      }

      return {
        metricId: m,
        label: mapInfo.label,
        valA,
        valB,
        growth
      };
    }).filter(Boolean);
  }, [analysis, logs, pAStart, pAEnd, pBStart, pBEnd, targetPlatform]);

  const chartData = useMemo(() => {
    if (!activeMetric) return [];

    const mapInfo = METRICS_MAP[activeMetric];
    if (!mapInfo) return [];

    const daysA = getDaysDiff(pAStart, pAEnd);
    const daysB = getDaysDiff(pBStart, pBEnd);
    const maxDays = Math.max(daysA, daysB);

    const dataArray = [];

    const platformLogs = logs.filter(l => {
      return analysis.platform === 'Semua Platform' || (l.platform && l.platform.toLowerCase().includes(targetPlatform));
    });

    for (let i = 0; i < maxDays; i++) {
      const dateA = addDays(pAStart, i);
      const dateB = addDays(pBStart, i);

      const logsForDayA = platformLogs.filter(l => normalizeDate(l.date || l.dateTime) === dateA);
      const logsForDayB = platformLogs.filter(l => normalizeDate(l.date || l.dateTime) === dateB);

      let valA = 0;
      let valB = 0;

      if (mapInfo.compute) {
        valA = mapInfo.compute(logsForDayA);
        valB = mapInfo.compute(logsForDayB);
      } else if (mapInfo.key) {
        valA = logsForDayA.reduce((acc, curr) => acc + (Number(curr[mapInfo.key!]) || 0), 0);
        valB = logsForDayB.reduce((acc, curr) => acc + (Number(curr[mapInfo.key!]) || 0), 0);
      }

      dataArray.push({
        name: `Hari ${i + 1}`,
        "Data 1": valA,
        "Data 2": valB,
        dateA: dateA,
        dateB: dateB
      });
    }

    return dataArray;
  }, [analysis, logs, activeMetric, pAStart, pAEnd, pBStart, pBEnd, targetPlatform]);

  const formatDateWithDay = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + "T00:00:00Z");
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = days[date.getUTCDay()];
      
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${dayName}, ${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch(e) {}
    return formatDateStr(dateString);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 min-w-[200px] z-50">
          <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">{label}</p>
          <div className="space-y-3">
            {payload.map((entry: any, index: number) => {
              const dateStr = entry.name === 'Data 1' ? entry.payload.dateA : entry.payload.dateB;
              const formattedDate = formatDateWithDay(dateStr);
              return (
                <div key={index} className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-xs font-semibold text-slate-600">{entry.name}</span>
                    <span className="text-[11px] text-slate-400">({formattedDate})</span>
                  </div>
                  <span className="font-bold text-sm pl-3.5 text-slate-800">
                    {formatNumber(entry.value, activeMetric === 'gmv')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden group">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {analysis.name && (
              <h3 className="text-lg font-bold text-slate-900 mr-2">{analysis.name}</h3>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
              {analysis.platform}
            </span>
            <span className="text-sm font-medium text-slate-500 flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
              {new Date(analysis.created_at || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          {/* Periode: grid 2-col on mobile, inline on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-slate-700">
            <div className="flex flex-col bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shrink-0"></div>
                <span className="font-bold text-slate-600 text-[11px] sm:text-xs">Data 1 :</span>
              </div>
              <span className="text-slate-700 pl-4 text-[11px] sm:text-xs">{formatDateStr(analysis.period_a_start)}<span className="text-slate-400 mx-0.5">-</span>{formatDateStr(analysis.period_a_end)}</span>
            </div>
            <div className="flex flex-col bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0"></div>
                <span className="font-bold text-slate-600 text-[11px] sm:text-xs">Data 2 :</span>
              </div>
              <span className="text-slate-700 pl-4 text-[11px] sm:text-xs">{formatDateStr(analysis.period_b_start)}<span className="text-slate-400 mx-0.5">-</span>{formatDateStr(analysis.period_b_end)}</span>
            </div>
          </div>
        </div>
        
        {!isClientView && (
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={onEdit}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              title="Edit Analisis"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button 
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Hapus Analisis"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Card Body */}
      <div className="p-4 sm:p-6">
        {/* Metriks label - mobile only */}
        <p className="sm:hidden text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Metriks</p>
        {/* Summary Scorecards (Acts as Metric Tabs) */}
        {summaryData && summaryData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {summaryData.map(item => {
              if (!item) return null;
              const isActive = activeMetric === item.metricId;
              const isPositive = item.growth > 0;
              const isNegative = item.growth < 0;
              const isGmv = item.metricId === 'gmv';

              return (
                <button
                  key={item.metricId}
                  onClick={() => setActiveMetric(item.metricId)}
                  className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-50/30 shadow-[0_0_0_1px_rgba(79,70,229,1)]' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-sm font-bold mb-3 ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                  
                  <div className="w-full space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs w-full">
                      <span className="text-slate-500 font-medium">Data 1</span>
                      <span className="font-bold text-slate-700">{formatNumber(item.valA, isGmv)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs w-full">
                      <span className="text-slate-500 font-medium">Data 2</span>
                      <span className="font-bold text-slate-700">{formatNumber(item.valB, isGmv)}</span>
                    </div>
                  </div>

                  <div className={`mt-auto inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-md ${
                    isPositive ? 'bg-emerald-100 text-emerald-700' : 
                    isNegative ? 'bg-rose-100 text-rose-700' : 
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : isNegative ? <TrendingUp className="w-3 h-3 mr-1 rotate-180" /> : null}
                    {isPositive ? '+' : ''}{item.growth.toFixed(1)}%
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Line Chart */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-4 sm:mb-8">
          {chartData.length > 0 ? (
            <>
              {/* MOBILE: single combined chart with both data lines */}
              <div className="sm:hidden w-full border border-slate-100 rounded-xl p-3 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-800">
                    {summaryData.find(s => s?.metricId === activeMetric)?.label || activeMetric}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>Data 1
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>Data 2
                    </span>
                  </div>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => activeMetric === 'gmv' ? `${(v/1000000).toFixed(1)}M` : String(v)} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="Data 1" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="Data 2" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend bottom */}
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                    Data 1: {formatDateStr(analysis.period_a_start)} s/d {formatDateStr(analysis.period_a_end)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Data 2: {formatDateStr(analysis.period_b_start)} s/d {formatDateStr(analysis.period_b_end)}
                  </span>
                </div>
              </div>
              {/* DESKTOP: two separate charts */}
              <div className="hidden sm:block h-[300px] w-full border border-slate-100 rounded-xl p-5 bg-white shadow-sm ring-1 ring-slate-900/5">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></div>
                  <h4 className="text-sm font-bold text-slate-700">Data 1 ({formatDateStr(analysis.period_a_start)} <span className="font-normal text-slate-400 mx-1">s/d</span> {formatDateStr(analysis.period_a_end)})</h4>
                </div>
                <div style={{ height: 'calc(100% - 32px)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} 
                        tickFormatter={(value) => activeMetric === 'gmv' ? `Rp ${(value/1000000).toFixed(1)}M` : value}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f5f9', strokeWidth: 2, strokeDasharray: '3 3' }} />
                      <Line type="monotone" dataKey="Data 1" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="hidden sm:block h-[300px] w-full border border-slate-100 rounded-xl p-5 bg-white shadow-sm ring-1 ring-slate-900/5">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                  <h4 className="text-sm font-bold text-slate-700">Data 2 ({formatDateStr(analysis.period_b_start)} <span className="font-normal text-slate-400 mx-1">s/d</span> {formatDateStr(analysis.period_b_end)})</h4>
                </div>
                <div style={{ height: 'calc(100% - 32px)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} 
                        tickFormatter={(value) => activeMetric === 'gmv' ? `Rp ${(value/1000000).toFixed(1)}M` : value}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f5f9', strokeWidth: 2, strokeDasharray: '3 3' }} />
                      <Line type="monotone" dataKey="Data 2" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[380px] w-full border border-slate-100 rounded-xl p-5 bg-white shadow-sm ring-1 ring-slate-900/5 flex items-center justify-center text-slate-400 font-medium text-sm">
              Tidak ada data yang dapat ditampilkan.
            </div>
          )}
        </div>

        {/* Empty State or Inline Edit for Insight & Next Plan */}
        {isEditingInsight ? (
          <div className="mt-6 border border-indigo-100 bg-indigo-50/30 rounded-xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-500" />
              {(!analysis.description && !analysis.next_plan) ? 'Tambah' : 'Edit'} Insight & Next Plan
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Insight dan Analysis</label>
                <textarea 
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={7}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 resize-y shadow-sm"
                  placeholder="Tuliskan insight dan analisis performa..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Next Plan / Improvement</label>
                <textarea 
                  value={editNextPlan}
                  onChange={e => setEditNextPlan(e.target.value)}
                  rows={7}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-3 resize-y shadow-sm"
                  placeholder="Tuliskan rencana perbaikan atau next plan..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditingInsight(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveInsight}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm flex items-center"
                >
                  {isSaving ? "Menyimpan..." : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {!isClientView && !analysis.description && !analysis.next_plan && (
              <div className="mt-6 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-slate-900 font-bold mb-1">Belum ada Insight & Next Plan</h4>
                <p className="text-slate-500 text-sm mb-4 max-w-sm">
                  Tambahkan analisis mendalam dan rencana perbaikan untuk evaluasi performa periode ini.
                </p>
                <button
                  onClick={() => setIsEditingInsight(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tambah Insight & Plan
                </button>
              </div>
            )}

            {/* Description & Next Plan Boxes */}
            {(analysis.description || analysis.next_plan) && (
              <div className="grid grid-cols-1 gap-4 mt-6 relative group/insight">
                {!isClientView && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover/insight:opacity-100 transition-opacity z-10">
                     <button 
                       onClick={() => setIsEditingInsight(true)}
                       className="p-2 bg-white border border-slate-200 shadow-sm rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                       title="Edit Insight & Plan"
                     >
                       <Edit3 className="w-4 h-4" />
                     </button>
                  </div>
                )}

                {analysis.description && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative overflow-hidden h-full">
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

                {analysis.next_plan && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <h4 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Next Plan / Improvement
                    </h4>
                    <p className="text-sm text-emerald-800 whitespace-pre-wrap leading-relaxed pl-6">
                      {analysis.next_plan}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AnalysisPerformanceTab({ brandId, logs, isClientView }: Props) {
  const [analyses, setAnalyses] = useState<BrandPerformanceAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<BrandPerformanceAnalysis | undefined>();
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  const fetchAnalyses = async (newlyCreatedId?: string) => {
    setIsLoading(true);
    try {
      const data = await reportingBrandApi.getAnalyses(brandId);
      setAnalyses(data);
      if (newlyCreatedId) {
        setSelectedAnalysisId(newlyCreatedId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (brandId) fetchAnalyses();
  }, [brandId]);

  useEffect(() => {
    // Auto-select first analysis if none selected or selected doesn't exist anymore
    if (analyses.length > 0) {
      if (!selectedAnalysisId || !analyses.find(a => a.id === selectedAnalysisId)) {
        setSelectedAnalysisId(analyses[0].id);
      }
    } else {
      setSelectedAnalysisId(null);
    }
  }, [analyses, selectedAnalysisId]);

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

  const activeAnalysis = analyses.find(a => a.id === selectedAnalysisId);

  return (
    <div className="space-y-4 sm:space-y-6 px-4 pb-8 sm:px-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border-b sm:border border-slate-100 sm:border-slate-200 shadow-sm sm:shadow-sm">
        <div className="hidden sm:block">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Analisis Performa
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 max-w-xl">
            Bandingkan metrik performa brand Anda antar dua rentang waktu yang berbeda untuk mendapatkan insight pertumbuhan.
          </p>
        </div>
        {!isClientView && (
          <button
            onClick={() => {
              setEditingAnalysis(undefined);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 text-white rounded-full sm:rounded-xl hover:bg-indigo-700 transition-all font-medium text-xs sm:text-sm shadow-sm shadow-indigo-600/20 active:scale-[0.98] w-fit"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span className="sm:hidden">Tambah Analysis</span>
            <span className="hidden sm:inline">Buat Analisis Baru</span>
          </button>
        )}
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
          {!isClientView && (
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
          )}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Analysis Selector Dropdown */}
          <div className="bg-white p-0 sm:p-4 rounded-xl sm:border border-slate-200 sm:shadow-sm flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 relative z-20">
            <span className="text-sm font-bold text-slate-700 whitespace-nowrap">Lihat Analisis</span>
            <select
              value={selectedAnalysisId || ''}
              onChange={(e) => setSelectedAnalysisId(e.target.value)}
              className="w-full bg-white sm:bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-medium cursor-pointer"
            >
              {analyses.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name ? `${a.name}` : `${a.platform} (${formatDateStr(a.period_a_start)} vs ${formatDateStr(a.period_b_start)})`}
                </option>
              ))}
            </select>
          </div>

          {activeAnalysis && (
            <AnalysisCard
              key={activeAnalysis.id}
              analysis={activeAnalysis}
              logs={logs}
              onEdit={() => {
                setEditingAnalysis(activeAnalysis);
                setIsModalOpen(true);
              }}
              onDelete={() => handleDelete(activeAnalysis.id)}
              onUpdate={async (id, updates) => {
                await reportingBrandApi.updateAnalysis(id, updates);
                await fetchAnalyses();
              }}
              isClientView={isClientView}
            />
          )}
        </div>
      )}

      <AnalysisFormModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnalysis(undefined);
        }}
        brandId={brandId}
        onSuccess={() => fetchAnalyses()} // Will just refresh and keep active one unless deleted
        initialData={editingAnalysis}
      />
    </div>
  );
}
