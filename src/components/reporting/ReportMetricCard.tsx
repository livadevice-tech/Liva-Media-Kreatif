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
    <div className="flex flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-2.5 flex items-center gap-2">
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4efff] text-[#5600e0]">
            {icon}
          </div>
        )}
        <div className="text-[13px] font-semibold text-slate-500 line-clamp-1">
          {label}
        </div>
      </div>
      <div className="font-display mb-1.5 text-[22px] font-black tracking-tight text-slate-900 tabular-nums truncate leading-none">
        {prefix}
        {value}
        {suffix}
      </div>
      <div className="flex items-center gap-1.5 text-[12px] font-bold">
        {isTrendAvailable ? (
          <span
            className={`flex items-center gap-0.5 ${
              isUp ? "text-slate-900" : "text-slate-900"
            }`}
          >
            {isUp ? (
              <TrendingUp className="h-3.5 w-3.5 text-slate-900" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-slate-900" />
            )}
            {pct.toFixed(1)}%
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </div>
    </div>
  );
}
