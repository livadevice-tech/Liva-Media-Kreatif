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
    <div className="rounded-[18px] border border-[#dfd8ef] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)]">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
          {label}
        </div>
        <PercentBadge cur={cur} prev={prev} />
      </div>
      <div className="font-display mt-1 text-[clamp(1.35rem,1.9vw,2.1rem)] font-black tracking-tight text-slate-950 tabular-nums">
        {prefix}
        {value}
        {suffix}
      </div>
    </div>
  );
}
