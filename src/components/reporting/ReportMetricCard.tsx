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
    <div className="flex flex-col justify-between rounded-[16px] border border-slate-100/60 bg-white p-3.5 sm:p-5 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md">
      <div className="mb-2 sm:mb-3 flex items-center gap-2">
        {icon && (
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100/50">
            {icon}
          </div>
        )}
        <div className="text-[11px] sm:text-[12px] font-bold text-slate-500 leading-tight line-clamp-2">
          {label}
        </div>
      </div>
      <div className="font-display mb-1 text-lg sm:text-2xl font-black tracking-tight text-slate-900 tabular-nums truncate">
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
