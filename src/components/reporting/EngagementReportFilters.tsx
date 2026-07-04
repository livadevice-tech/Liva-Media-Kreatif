import { Calendar } from "lucide-react";
import { DoubleDatePicker } from "../DoubleDatePicker";
import { formatDateYYYYMMDD } from "../../shared/utils/date";
import { getIndonesianMonthLabel } from "../../shared/utils/reporting";

type DateFilterType = "all" | "latest" | "month" | "custom";

type EngagementReportFiltersProps = {
  operatorPlatformFilter: string;
  onPlatformFilterChange: (value: string) => void;
  availableOperatorPlatforms: string[];
  operatorShiftFilters: string[];
  onOperatorShiftFiltersChange: (value: string[]) => void;
  isShiftFilterOpen: boolean;
  onShiftFilterOpenChange: (value: boolean) => void;
  shifts: string[];
  operatorDateFilterType: DateFilterType;
  onDateFilterTypeSelect: (value: DateFilterType) => void;
  operatorMonthPickerYear: number;
  setOperatorMonthPickerYear: (value: number | ((prev: number) => number)) => void;
  operatorSelectedMonth: string;
  setOperatorSelectedMonth: (value: string) => void;
  isOperatorMonthOpen: boolean;
  setIsOperatorMonthOpen: (value: boolean) => void;
  isOperatorCalendarOpen: boolean;
  setIsOperatorCalendarOpen: (value: boolean) => void;
  operatorCustomStartDate: string;
  operatorCustomEndDate: string;
  operatorTempStartDate: string;
  operatorTempEndDate: string;
  setOperatorTempStartDate: (value: string) => void;
  setOperatorTempEndDate: (value: string) => void;
  setOperatorCustomStartDate: (value: string) => void;
  setOperatorCustomEndDate: (value: string) => void;
};

export function EngagementReportFilters({
  operatorPlatformFilter,
  onPlatformFilterChange,
  availableOperatorPlatforms,
  operatorShiftFilters,
  onOperatorShiftFiltersChange,
  isShiftFilterOpen,
  onShiftFilterOpenChange,
  shifts,
  operatorDateFilterType,
  onDateFilterTypeSelect,
  operatorMonthPickerYear,
  setOperatorMonthPickerYear,
  operatorSelectedMonth,
  setOperatorSelectedMonth,
  isOperatorMonthOpen,
  setIsOperatorMonthOpen,
  isOperatorCalendarOpen,
  setIsOperatorCalendarOpen,
  operatorCustomStartDate,
  operatorCustomEndDate,
  operatorTempStartDate,
  operatorTempEndDate,
  setOperatorTempStartDate,
  setOperatorTempEndDate,
  setOperatorCustomStartDate,
  setOperatorCustomEndDate,
}: EngagementReportFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-wrap mt-0">
      <div className="flex gap-3 w-full sm:w-auto flex-1 flex-wrap">
        <select
          value={operatorPlatformFilter}
          onChange={(e) => onPlatformFilterChange(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 shadow-sm"
        >
          {availableOperatorPlatforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <div className="relative">
          <button
            type="button"
            onClick={() => onShiftFilterOpenChange(!isShiftFilterOpen)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 shadow-sm flex items-center justify-between min-w-[130px] whitespace-nowrap"
          >
            <span className="truncate mr-2 text-left">
              {operatorShiftFilters.length === 0
                ? "Semua Shift"
                : `${operatorShiftFilters.length} Shift`}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-down w-3 h-3 text-slate-400 shrink-0"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {isShiftFilterOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              <div className="p-2 space-y-1">
                <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={operatorShiftFilters.length === 0}
                    onChange={() => {
                      onOperatorShiftFiltersChange([]);
                      onShiftFilterOpenChange(false);
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  Semua Shift
                </label>
                {shifts.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs font-semibold text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={operatorShiftFilters.includes(s)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onOperatorShiftFiltersChange([
                            ...operatorShiftFilters,
                            s,
                          ]);
                        } else {
                          onOperatorShiftFiltersChange(
                            operatorShiftFilters.filter((item) => item !== s),
                          );
                        }
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex gap-2 w-full sm:w-auto h-9">
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          {[
            { id: "latest", label: "Terbaru" },
            { id: "all", label: "Semua" },
            { id: "month", label: "Bulan" },
            { id: "custom", label: "Custom" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onDateFilterTypeSelect(item.id as DateFilterType);
                if (item.id === "all" || item.id === "latest") {
                  setIsOperatorCalendarOpen(false);
                  setIsOperatorMonthOpen(false);
                } else if (item.id === "month") {
                  setIsOperatorMonthOpen(true);
                  setIsOperatorCalendarOpen(false);
                } else if (item.id === "custom") {
                  setIsOperatorCalendarOpen(true);
                  setIsOperatorMonthOpen(false);
                  setOperatorTempStartDate(
                    operatorCustomStartDate || formatDateYYYYMMDD(new Date()),
                  );
                  setOperatorTempEndDate(
                    operatorCustomEndDate || formatDateYYYYMMDD(new Date()),
                  );
                }
              }}
              className={`px-3 py-1 rounded text-[10px] font-bold text-center flex-1 sm:flex-initial cursor-pointer border-0 transition-colors ${
                operatorDateFilterType === item.id
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {((operatorDateFilterType === "custom" && operatorCustomStartDate) ||
          operatorDateFilterType === "month") && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-bold text-slate-700">
              {operatorDateFilterType === "month"
                ? getIndonesianMonthLabel(operatorSelectedMonth)
                : `${operatorCustomStartDate} to ${operatorCustomEndDate}`}
            </span>
          </div>
        )}

        {isOperatorMonthOpen && operatorDateFilterType === "month" && (
          <div className="absolute right-0 top-full mt-2 z-50 bg-white p-4 rounded-xl shadow-lg border border-slate-200 w-64 animate-fadeIn">
            <div className="flex justify-between items-center mb-4 text-slate-800">
              <button
                type="button"
                onClick={() => setOperatorMonthPickerYear((y) => y - 1)}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer p-1"
              >
                &laquo;
              </button>
              <div className="text-sm font-bold tracking-widest">
                {operatorMonthPickerYear}
              </div>
              <button
                type="button"
                onClick={() => setOperatorMonthPickerYear((y) => y + 1)}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer p-1"
              >
                &raquo;
              </button>
            </div>
            <div className="grid grid-cols-3 gap-y-2 pb-1 border-t border-slate-100 pt-3 relative">
              {[
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
              ].map((m) => {
                const monthValue = `${operatorMonthPickerYear}-${m.val}`;
                const isSelected = operatorSelectedMonth === monthValue;
                const currentDate = new Date();
                const isFuture =
                  operatorMonthPickerYear > currentDate.getFullYear() ||
                  (operatorMonthPickerYear === currentDate.getFullYear() &&
                    parseInt(m.val, 10) > currentDate.getMonth() + 1);

                return (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => {
                      if (!isFuture) {
                        setOperatorSelectedMonth(monthValue);
                        setIsOperatorMonthOpen(false);
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

        {isOperatorCalendarOpen && operatorDateFilterType === "custom" && (
          <div className="absolute right-0 top-full mt-2 z-50 animate-fadeIn">
            <DoubleDatePicker
              startDate={operatorTempStartDate}
              endDate={operatorTempEndDate}
              onChange={(start, end) => {
                setOperatorTempStartDate(start);
                setOperatorTempEndDate(end);
              }}
              onApply={() => {
                setOperatorCustomStartDate(operatorTempStartDate);
                setOperatorCustomEndDate(operatorTempEndDate);
                setIsOperatorCalendarOpen(false);
              }}
              onCancel={() => setIsOperatorCalendarOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
