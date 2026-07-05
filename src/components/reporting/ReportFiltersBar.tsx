import { Calendar, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";

import { DoubleDatePicker } from "../DoubleDatePicker";
import { getIndonesianMonthLabel } from "../../shared/utils/reporting";
import { type ReportDateFilterType } from "../../shared/utils/reportTable";

type Setter<T> = (value: T | ((prev: T) => T)) => void;
type ReportFilterValue = ReportDateFilterType | "weekly";

interface ReportFiltersBarProps {
  showSearch?: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  platformFilter: string;
  onPlatformFilterChange: (value: string) => void;
  availablePlatforms: string[];
  dateFilterType: ReportFilterValue;
  onDateFilterTypeSelect: (value: ReportDateFilterType) => void;
  monthPickerYear: number;
  setMonthPickerYear: Setter<number>;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  isMonthOpen: boolean;
  setIsMonthOpen: (value: boolean) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (value: boolean) => void;
  customStartDate: string;
  customEndDate: string;
  tempStartDate: string;
  tempEndDate: string;
  onTempStartDateChange: (value: string) => void;
  onTempEndDateChange: (value: string) => void;
  onApplyCustom: (start: string, end: string) => void;
  onCancelCustom: () => void;
  periodLabel?: string;
  onPrevPeriod?: () => void;
  onNextPeriod?: () => void;
  canPrevPeriod?: boolean;
  canNextPeriod?: boolean;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

const MONTHS = [
  { val: "01", label: "Jan" },
  { val: "02", label: "Feb" },
  { val: "03", label: "Mar" },
  { val: "04", label: "Apr" },
  { val: "05", label: "May" },
  { val: "06", label: "Jun" },
  { val: "07", label: "Jul" },
  { val: "08", label: "Aug" },
  { val: "09", label: "Sept" },
  { val: "10", label: "Oct" },
  { val: "11", label: "Nov" },
  { val: "12", label: "Dec" },
];

const DATE_FILTERS: Array<{
  id: ReportDateFilterType;
  label: string;
}> = [
  { id: "latest", label: "Terbaru" },
  { id: "all", label: "Semua" },
  { id: "month", label: "Bulan" },
  { id: "custom", label: "Rentang" },
];

export function ReportFiltersBar({
  showSearch = true,
  searchQuery,
  onSearchQueryChange,
  platformFilter,
  onPlatformFilterChange,
  availablePlatforms,
  dateFilterType,
  onDateFilterTypeSelect,
  monthPickerYear,
  setMonthPickerYear,
  selectedMonth,
  setSelectedMonth,
  isMonthOpen,
  setIsMonthOpen,
  isCalendarOpen,
  setIsCalendarOpen,
  customStartDate,
  customEndDate,
  tempStartDate,
  tempEndDate,
  onTempStartDateChange,
  onTempEndDateChange,
  onApplyCustom,
  onCancelCustom,
  periodLabel,
  onPrevPeriod,
  onNextPeriod,
  canPrevPeriod = true,
  canNextPeriod = true,
  primaryActionLabel,
  onPrimaryAction,
}: ReportFiltersBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-1 flex-wrap gap-3">
        {showSearch ? (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Cari sesi, brand, atau kata kunci"
              placeholder="Cari sesi, brand, atau kata kunci"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full rounded-[14px] border border-[#ddd7ef] bg-white py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-800 shadow-sm outline-none transition-colors focus:border-[#cbb7ff] focus:ring-2 focus:ring-[#efe6ff]"
            />
          </div>
        ) : null}
        <select
          aria-label="Filter platform"
          value={platformFilter}
          onChange={(e) => onPlatformFilterChange(e.target.value)}
          className="min-w-[180px] rounded-[14px] border border-[#ddd7ef] bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-[#cbb7ff] focus:ring-2 focus:ring-[#efe6ff]"
        >
          {availablePlatforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="relative flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <div className="flex rounded-[14px] border border-[#ddd7ef] bg-[#f7f4ff] p-0.5 shadow-sm">
          {DATE_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onDateFilterTypeSelect(item.id)}
              className={`flex-1 cursor-pointer rounded-[12px] border-0 px-3 py-1.5 text-center text-[10px] font-bold transition-colors sm:flex-initial ${
                dateFilterType === item.id
                  ? "border border-[#d7c8ff] bg-white text-[#5600e0] shadow-sm"
                  : "text-slate-500 hover:bg-white/80 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {((dateFilterType === "custom" && customStartDate) ||
          dateFilterType === "month") && (
          <div className="hidden items-center gap-1.5 rounded-[14px] border border-[#ddd7ef] bg-white px-3 py-2 shadow-sm sm:flex">
            <Calendar className="h-3.5 w-3.5 text-[#5600e0]" />
            <span className="text-[10px] font-bold text-slate-700">
              {dateFilterType === "month"
                ? getIndonesianMonthLabel(selectedMonth)
                : `${customStartDate} s/d ${customEndDate}`}
            </span>
          </div>
        )}

        {dateFilterType === "latest" && periodLabel && onPrevPeriod && onNextPeriod ? (
          <div className="flex items-center gap-1.5 rounded-[14px] border border-[#ddd7ef] bg-white px-2 py-1.5 shadow-sm">
            <button
              type="button"
              onClick={onPrevPeriod}
              disabled={!canPrevPeriod}
              aria-label="Lihat tanggal sebelumnya"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-[150px] px-2 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f6ea8]">
                Tanggal Data
              </p>
              <p className="mt-0.5 text-xs font-black text-[#5600e0]">
                {periodLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onNextPeriod}
              disabled={!canNextPeriod}
              aria-label="Lihat tanggal berikutnya"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {primaryActionLabel && onPrimaryAction ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-[#5600e0] bg-[#5600e0] px-4 py-2.5 text-xs font-bold text-white shadow-[0_10px_22px_rgba(86,0,224,0.16)] transition-colors hover:bg-[#4600bb]"
          >
            <Plus className="h-4 w-4 text-white" />
            {primaryActionLabel}
          </button>
        ) : null}

        {isMonthOpen && dateFilterType === "month" && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 animate-fadeIn rounded-[16px] border border-[#ddd7ef] bg-white p-4 shadow-[0_18px_36px_rgba(17,24,39,0.12)]">
            <div className="mb-4 flex items-center justify-between text-slate-800">
              <button
                type="button"
                onClick={() => setMonthPickerYear((y) => y - 1)}
                className="cursor-pointer border-0 bg-transparent p-1 text-slate-400 hover:text-slate-700"
              >
                &laquo;
              </button>
              <div className="text-sm font-bold tracking-widest">
                {monthPickerYear}
              </div>
              <button
                type="button"
                onClick={() => setMonthPickerYear((y) => y + 1)}
                className="cursor-pointer border-0 bg-transparent p-1 text-slate-400 hover:text-slate-700"
              >
                &raquo;
              </button>
            </div>
            <div className="relative grid grid-cols-3 gap-y-2 border-t border-slate-100 pb-1 pt-3">
              {MONTHS.map((m) => {
                const mVal = `${monthPickerYear}-${m.val}`;
                const isSelected = selectedMonth === mVal;

                const currentDate = new Date();
                const isFuture =
                  monthPickerYear > currentDate.getFullYear() ||
                  (monthPickerYear === currentDate.getFullYear() &&
                    parseInt(m.val, 10) > currentDate.getMonth() + 1);

                return (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => {
                      if (!isFuture) {
                        setSelectedMonth(mVal);
                        setIsMonthOpen(false);
                      }
                    }}
                    className={`flex h-10 flex-col items-center justify-center border-0 py-2 text-[13px] font-semibold ${
                      isFuture
                        ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                        : "bg-white text-slate-800 hover:bg-slate-50 cursor-pointer"
                    } ${isSelected ? "bg-slate-50 shadow-sm relative" : ""}`}
                  >
                    {m.label}
                    {isSelected && !isFuture && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isCalendarOpen && dateFilterType === "custom" && (
          <div className="absolute right-0 top-full mt-2 z-50 animate-fadeIn">
            <DoubleDatePicker
              startDate={tempStartDate}
              endDate={tempEndDate}
              onChange={(start, end) => {
                onTempStartDateChange(start);
                onTempEndDateChange(end);
              }}
              onApply={() => onApplyCustom(tempStartDate, tempEndDate)}
              onCancel={onCancelCustom}
            />
          </div>
        )}
      </div>
    </div>
  );
}
