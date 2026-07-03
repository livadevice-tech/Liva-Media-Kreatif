import { Calendar, Search } from "lucide-react";

import { DoubleDatePicker } from "../DoubleDatePicker";
import { getIndonesianMonthLabel } from "../../shared/utils/reporting";
import { type ReportDateFilterType } from "../../shared/utils/reportTable";

type Setter<T> = (value: T | ((prev: T) => T)) => void;
type ReportFilterValue = ReportDateFilterType | "weekly";

interface ReportFiltersBarProps {
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
  { id: "custom", label: "Custom" },
];

export function ReportFiltersBar({
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
}: ReportFiltersBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-wrap">
      <div className="flex gap-3 w-full sm:w-auto flex-1 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 transition-colors shadow-sm"
          />
        </div>
        <select
          value={platformFilter}
          onChange={(e) => onPlatformFilterChange(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 shadow-sm"
        >
          {availablePlatforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="relative flex gap-2 w-full sm:w-auto h-9">
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          {DATE_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onDateFilterTypeSelect(item.id)}
              className={`px-3 py-1 rounded text-[10px] font-bold text-center flex-1 sm:flex-initial cursor-pointer border-0 transition-colors ${
                dateFilterType === item.id
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {((dateFilterType === "custom" && customStartDate) ||
          dateFilterType === "month") && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-bold text-slate-700">
              {dateFilterType === "month"
                ? getIndonesianMonthLabel(selectedMonth)
                : `${customStartDate} to ${customEndDate}`}
            </span>
          </div>
        )}

        {isMonthOpen && dateFilterType === "month" && (
          <div className="absolute right-0 top-full mt-2 z-50 bg-white p-4 rounded-xl shadow-lg border border-slate-200 w-64 animate-fadeIn">
            <div className="flex justify-between items-center mb-4 text-slate-800">
              <button
                type="button"
                onClick={() => setMonthPickerYear((y) => y - 1)}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer p-1"
              >
                &laquo;
              </button>
              <div className="text-sm font-bold tracking-widest">
                {monthPickerYear}
              </div>
              <button
                type="button"
                onClick={() => setMonthPickerYear((y) => y + 1)}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer p-1"
              >
                &raquo;
              </button>
            </div>
            <div className="grid grid-cols-3 gap-y-2 pb-1 border-t border-slate-100 pt-3 relative">
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
                    className={`py-2 text-[13px] font-semibold flex flex-col justify-center items-center h-10 border-0 ${
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
