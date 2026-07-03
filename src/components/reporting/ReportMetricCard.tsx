import { PercentBadge } from "../../shared/utils/appUi";

interface ReportMetricCardProps {
  label: string;
  cur: number;
  prev: number;
  value: string;
  prefix?: string;
  suffix?: string;
}

export function ReportMetricCard({
  label,
  cur,
  prev,
  value,
  prefix = "",
  suffix = "",
}: ReportMetricCardProps) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
      <div className="flex justify-between items-start mb-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-1">
          {label}
        </div>
        <PercentBadge cur={cur} prev={prev} />
      </div>
      <div className="text-xl font-black text-slate-800 mt-1">
        {prefix}
        {value}
        {suffix}
      </div>
    </div>
  );
}
