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
    <div className="rounded-[14px] border border-[#e5e2e1] bg-white p-4 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          {label}
        </div>
        <PercentBadge cur={cur} prev={prev} />
      </div>
      <div className="font-display mt-1 text-[clamp(1.2rem,1.5vw,1.8rem)] font-black tracking-tight text-slate-800 tabular-nums">
        {prefix}
        {value}
        {suffix}
      </div>
    </div>
  );
}
