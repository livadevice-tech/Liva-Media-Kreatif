import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ReportMetricCardProps {
  label: string;
  cur: number;
  prev: number;
  value: string;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
}

export function ReportMetricCard({
  label,
  cur,
  prev,
  value,
  prefix = "",
  suffix = "",
  icon,
}: ReportMetricCardProps) {
  const isTrendAvailable = prev != null && !isNaN(prev) && prev > 0;
  const diff = cur - prev;
  const pct = isTrendAvailable ? Math.abs((diff / prev) * 100) : 0;
  const isUp = diff >= 0;

  return (
    <div className="rounded-[16px] border border-[#f1eef8] bg-white p-4 shadow-[0_2px_10px_rgba(86,0,224,0.03)] transition-all hover:shadow-[0_4px_16px_rgba(86,0,224,0.06)]">
      <div className="mb-3 flex items-center gap-2.5">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4effc] text-[#7148e5]">
            {icon}
          </div>
        )}
        <div className="text-[12px] font-bold text-slate-700">
          {label}
        </div>
      </div>
      <div className="font-display mb-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 tabular-nums truncate">
        {prefix}
        {value}
        {suffix}
      </div>
      <div className="flex items-center gap-1.5 text-[10.5px] font-bold">
        {isTrendAvailable ? (
          <>
            <span
              className={`flex items-center gap-0.5 ${
                isUp ? "text-[#10b981]" : "text-[#ef4444]"
              }`}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {pct.toFixed(1)}%
            </span>
            <span className="text-slate-400">vs prev</span>
          </>
        ) : (
          <span className="text-slate-400">Belum ada data prev</span>
        )}
      </div>
    </div>
  );
}
