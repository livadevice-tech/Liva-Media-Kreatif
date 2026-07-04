import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReportPeriodNavigatorProps {
  title: string;
  label: string;
  onPrev: () => void;
  onNext: () => void;
}

export function ReportPeriodNavigator({
  title,
  label,
  onPrev,
  onNext,
}: ReportPeriodNavigatorProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h4 className="font-display text-sm font-black uppercase tracking-[0.22em] text-slate-900 md:text-base">
        {title}
      </h4>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
        <button
          type="button"
          onClick={onPrev}
          aria-label={`Lihat periode sebelumnya untuk ${title}`}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="min-w-[160px] px-1 text-center text-xs font-black text-indigo-950 sm:text-sm">
          {label}
        </span>
        <button
          type="button"
          onClick={onNext}
          aria-label={`Lihat periode berikutnya untuk ${title}`}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
