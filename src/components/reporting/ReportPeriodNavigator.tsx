import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReportPeriodNavigatorProps {
  title: string;
  label: string;
  onPrev: () => void;
  onNext: () => void;
  showHeaderText?: boolean;
}

export function ReportPeriodNavigator({
  title,
  label,
  onPrev,
  onNext,
  showHeaderText = true,
}: ReportPeriodNavigatorProps) {
  return (
    <div
      className={`mb-4 flex flex-col gap-3 rounded-[18px] border border-[#e6dff8] bg-white px-4 py-3 shadow-[0_1px_0_rgba(17,24,39,0.03)] ${
        showHeaderText
          ? "sm:flex-row sm:items-center sm:justify-between"
          : "sm:flex-row sm:items-center sm:justify-end"
      }`}
    >
      {showHeaderText && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
            {title}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Kelola periode data untuk tab ini.
          </p>
        </div>
      )}
      <div className="flex items-center gap-3 rounded-[16px] border border-[#e4ddf6] bg-[#faf8ff] px-2.5 py-1.5 shadow-sm">
        <button
          type="button"
          onClick={onPrev}
          aria-label={`Lihat periode sebelumnya untuk ${title}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="min-w-[160px] px-1 text-center text-xs font-black text-[#5600e0] sm:text-sm">
          {label}
        </span>
        <button
          type="button"
          onClick={onNext}
          aria-label={`Lihat periode berikutnya untuk ${title}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
