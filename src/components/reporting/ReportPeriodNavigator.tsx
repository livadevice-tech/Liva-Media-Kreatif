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
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
      <h4 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-widest">
        {title}
      </h4>
      <div className="flex items-center gap-3 bg-white border border-slate-200 px-2 py-1.5 rounded-xl shadow-sm">
        <button
          onClick={onPrev}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs sm:text-sm font-black text-indigo-950 min-w-[160px] text-center">
          {label}
        </span>
        <button
          onClick={onNext}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
