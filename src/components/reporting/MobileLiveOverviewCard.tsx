import { DollarSign, Package, Clock, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import type { LiveReportPanelStats } from "../../shared/utils/liveReportPanel";

interface MobileLiveOverviewCardProps {
  stats: LiveReportPanelStats;
}

export function MobileLiveOverviewCard({ stats }: MobileLiveOverviewCardProps) {
  const {
    totalGmvDb,
    pTotalGmvDb,
    totalItemsSoldDb,
    pTotalItemsSoldDb,
    gmvPerHour,
    pGmvPerHour,
    avgAovDb,
    pAvgAovDb,
  } = stats;

  const calcPercentChange = (cur: number, prev: number) => {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return ((cur - prev) / prev) * 100;
  };

  const gmvPercent = calcPercentChange(totalGmvDb, pTotalGmvDb);
  const itemsPercent = calcPercentChange(totalItemsSoldDb, pTotalItemsSoldDb);
  const gmvHourPercent = calcPercentChange(gmvPerHour, pGmvPerHour);
  const aovPercent = calcPercentChange(avgAovDb, pAvgAovDb);

  const MetricCol = ({ 
    icon, 
    label, 
    value, 
    percent 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    value: string; 
    percent: number 
  }) => {
    const isUp = percent >= 0;
    const absPercent = Math.abs(percent).toFixed(1);
    
    return (
      <div className="flex flex-col items-center justify-start text-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 mb-2 shadow-sm">
          {icon}
        </div>
        <span className="text-[10px] font-medium text-white/90 mb-1">{label}</span>
        <span className="text-[13px] font-bold text-white leading-tight mb-2 tracking-tight">
          {value}
        </span>
        <div className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
          isUp ? "bg-[#10b981]/20 text-[#34d399]" : "bg-[#ef4444]/20 text-[#f87171]"
        }`}>
          {isUp ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
          {absPercent}%
        </div>
      </div>
    );
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-[#4300cc] to-[#5200ff] p-4 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-bold text-white">Live Overview</h3>
        <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider text-white">LIVE</span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 divide-x divide-white/20">
        <MetricCol 
          icon={<DollarSign size={16} className="text-white" strokeWidth={2.5} />}
          label="GMV"
          value={`Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalGmvDb)}`}
          percent={gmvPercent}
        />
        <MetricCol 
          icon={<Package size={16} className="text-white" strokeWidth={2.5} />}
          label="Item Sold"
          value={new Intl.NumberFormat("id-ID").format(totalItemsSoldDb)}
          percent={itemsPercent}
        />
        <MetricCol 
          icon={<Clock size={16} className="text-white" strokeWidth={2.5} />}
          label="GMV/Hours"
          value={`Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(gmvPerHour)}`}
          percent={gmvHourPercent}
        />
        <MetricCol 
          icon={<BarChart3 size={16} className="text-white" strokeWidth={2.5} />}
          label="AOV"
          value={`Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(avgAovDb)}`}
          percent={aovPercent}
        />
      </div>
    </div>
  );
}
