import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Layers3,
  ShoppingBag,
  Settings2,
  Upload,
} from "lucide-react";
import { DoubleDatePicker } from "../DoubleDatePicker";
import { getIndonesianMonthLabel } from "../../shared/utils/reporting";
import { type ReportDateFilterType } from "../../shared/utils/reportTable";

type ReportingTab = "live" | "product" | "engagement";

type Setter<T> = (value: T | ((prev: T) => T)) => void;

type ReportingWorkspaceHeaderProps = {
  brandName: string;
  brandId?: string;
  brandLogoUrl?: string;
  onBack: () => void;
  activeTab: ReportingTab;
  platformFilter: string;
  onPlatformFilterChange: (value: string) => void;
  availablePlatforms: string[];
  dateFilterType: ReportDateFilterType;
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
  onImportRawLive: () => void;
  onImportRawProduct: () => void;
  onImportRawEngagement: () => void;
};

const DATE_FILTER_OPTIONS: Array<{
  id: ReportDateFilterType;
  label: string;
}> = [
  { id: "latest", label: "Terbaru" },
  { id: "all", label: "Semua" },
  { id: "month", label: "Bulan" },
  { id: "custom", label: "Rentang" },
];

const MONTHS = [
  { val: "01", label: "Jan" },
  { val: "02", label: "Feb" },
  { val: "03", label: "Mar" },
  { val: "04", label: "Apr" },
  { val: "05", label: "Mei" },
  { val: "06", label: "Jun" },
  { val: "07", label: "Jul" },
  { val: "08", label: "Agu" },
  { val: "09", label: "Sep" },
  { val: "10", label: "Okt" },
  { val: "11", label: "Nov" },
  { val: "12", label: "Des" },
] as const;

function formatDateLabel(value: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getDateButtonLabel({
  dateFilterType,
  selectedMonth,
  customStartDate,
  customEndDate,
}: {
  dateFilterType: ReportDateFilterType;
  selectedMonth: string;
  customStartDate: string;
  customEndDate: string;
}) {
  if (dateFilterType === "custom") {
    if (customStartDate && customEndDate) {
      return `${formatDateLabel(customStartDate)} - ${formatDateLabel(customEndDate)}`;
    }
    return "Pilih rentang";
  }

  if (dateFilterType === "month") {
    return selectedMonth ? getIndonesianMonthLabel(selectedMonth) : "Pilih bulan";
  }

  if (dateFilterType === "all") return "Semua Waktu";
  return "Terbaru";
}

export function ReportingWorkspaceHeader({
  brandName,
  brandId,
  brandLogoUrl,
  onBack,
  activeTab,
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
  onImportRawLive,
  onImportRawProduct,
  onImportRawEngagement,
}: ReportingWorkspaceHeaderProps) {
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const [isRawMenuOpen, setIsRawMenuOpen] = useState(false);

  const dateButtonLabel = useMemo(
    () =>
      getDateButtonLabel({
        dateFilterType,
        selectedMonth,
        customStartDate,
        customEndDate,
      }),
    [customEndDate, customStartDate, dateFilterType, selectedMonth],
  );

  const selectedPlatform = platformFilter || availablePlatforms[0] || "Shopee Live";
  const brandCode = brandId ? brandId.toUpperCase() : "-";
  const brandInitials = (brandName || "RB")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const openDateMenu = () => {
    setIsDateMenuOpen((open) => !open);
    setIsPlatformMenuOpen(false);
    setIsRawMenuOpen(false);
  };

  const openPlatformMenu = () => {
    setIsPlatformMenuOpen((open) => !open);
    setIsDateMenuOpen(false);
    setIsRawMenuOpen(false);
  };

  const openRawMenu = () => {
    setIsRawMenuOpen((open) => !open);
    setIsDateMenuOpen(false);
    setIsPlatformMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsDateMenuOpen(false);
    setIsPlatformMenuOpen(false);
    setIsRawMenuOpen(false);
  };

  return (
    <section
      className="rounded-[24px] border border-[#e7e0f8] bg-[#fbf9ff] px-4 py-4 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:px-6"
      data-active-tab={activeTab}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-3 pb-4 border-b border-[#e7e0f8]">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8d0ee] bg-white text-slate-700 shadow-sm transition-colors hover:bg-[#f7f3ff] focus:outline-none focus:ring-2 focus:ring-[#5600e0] focus:ring-offset-2"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#5600e0] text-lg font-black text-white shadow-[0_12px_24px_rgba(86,0,224,0.22)]">
              {brandLogoUrl ? (
                <img
                  src={brandLogoUrl}
                  alt={`${brandName || "Brand"} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{brandInitials || "RB"}</span>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-display text-[clamp(1.25rem,2vw,1.75rem)] font-black tracking-tight text-slate-950">
                {brandName || "Nama Brand"}
              </h2>
              <p className="mt-0.5 text-sm font-semibold text-slate-500">
                ID: <span className="font-black text-slate-700">{brandCode}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={openDateMenu}
                className="inline-flex h-11 w-full sm:w-auto sm:min-w-[240px] items-center justify-between gap-3 rounded-[12px] border border-[#d8d0ee] bg-white px-4 text-left text-[14px] font-semibold text-slate-800 shadow-sm transition-colors hover:border-[#cdbef2] hover:bg-[#fdfcff]"
                aria-haspopup="menu"
                aria-expanded={isDateMenuOpen}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{dateButtonLabel}</span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              </button>

              {isDateMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[290px] rounded-[18px] border border-[#ddd7ef] bg-white p-2 shadow-[0_20px_44px_rgba(17,24,39,0.12)]">
                  <div className="space-y-1">
                    {DATE_FILTER_OPTIONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onDateFilterTypeSelect(item.id);
                          if (item.id === "month") {
                            setIsMonthOpen(true);
                            setIsCalendarOpen(false);
                          } else if (item.id === "custom") {
                            setIsCalendarOpen(true);
                            setIsMonthOpen(false);
                          } else {
                            setIsMonthOpen(false);
                            setIsCalendarOpen(false);
                          }
                          setIsDateMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                          dateFilterType === item.id
                            ? "bg-[#f7f2ff] text-[#5600e0]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{item.label}</span>
                        {dateFilterType === item.id ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isMonthOpen && dateFilterType === "month" && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-[18px] border border-[#ddd7ef] bg-white p-4 shadow-[0_20px_44px_rgba(17,24,39,0.12)]">
                  <div className="mb-4 flex items-center justify-between text-slate-800">
                    <button
                      type="button"
                      onClick={() => setMonthPickerYear((year) => year - 1)}
                      className="rounded-md border-0 bg-transparent p-1 text-slate-400 hover:text-slate-700"
                    >
                      &laquo;
                    </button>
                    <div className="text-sm font-bold tracking-widest">
                      {monthPickerYear}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMonthPickerYear((year) => year + 1)}
                      className="rounded-md border-0 bg-transparent p-1 text-slate-400 hover:text-slate-700"
                    >
                      &raquo;
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-y-2 border-t border-slate-100 pt-3">
                    {MONTHS.map((month) => {
                      const monthValue = `${monthPickerYear}-${month.val}`;
                      const isSelected = selectedMonth === monthValue;
                      const currentDate = new Date();
                      const isFuture =
                        monthPickerYear > currentDate.getFullYear() ||
                        (monthPickerYear === currentDate.getFullYear() &&
                          parseInt(month.val, 10) > currentDate.getMonth() + 1);

                      return (
                        <button
                          key={month.val}
                          type="button"
                          onClick={() => {
                            if (!isFuture) {
                              setSelectedMonth(monthValue);
                              setIsMonthOpen(false);
                              closeAllMenus();
                            }
                          }}
                          className={`relative flex h-10 flex-col items-center justify-center border-0 py-2 text-[13px] font-semibold ${
                            isFuture
                              ? "cursor-not-allowed bg-slate-50 text-slate-400"
                              : "cursor-pointer bg-white text-slate-800 hover:bg-slate-50"
                          } ${isSelected ? "bg-slate-50 shadow-sm" : ""}`}
                        >
                          {month.label}
                          {isSelected && !isFuture ? (
                            <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-slate-300" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isCalendarOpen && dateFilterType === "custom" && (
                <div className="absolute left-0 top-full z-50 mt-2">
                  <DoubleDatePicker
                    startDate={tempStartDate}
                    endDate={tempEndDate}
                    onChange={(start, end) => {
                      onTempStartDateChange(start);
                      onTempEndDateChange(end);
                    }}
                    onApply={() => {
                      onApplyCustom(tempStartDate, tempEndDate);
                      closeAllMenus();
                    }}
                    onCancel={() => {
                      onCancelCustom();
                      closeAllMenus();
                    }}
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={openPlatformMenu}
                className="inline-flex h-11 w-full sm:w-auto sm:min-w-[180px] items-center justify-between gap-3 rounded-[12px] border border-[#d8d0ee] bg-white px-4 text-left text-[14px] font-semibold text-slate-800 shadow-sm transition-colors hover:border-[#cdbef2] hover:bg-[#fdfcff]"
                aria-haspopup="menu"
                aria-expanded={isPlatformMenuOpen}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 shrink-0 text-[#ff6a00]" />
                  <span className="truncate">{selectedPlatform}</span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              </button>

              {isPlatformMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[220px] rounded-[18px] border border-[#ddd7ef] bg-white p-2 shadow-[0_20px_44px_rgba(17,24,39,0.12)]">
                  <div className="space-y-1">
                    {availablePlatforms.map((platform) => {
                      const active = platform === selectedPlatform;
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => {
                            onPlatformFilterChange(platform);
                            setIsPlatformMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                            active
                              ? "bg-[#f7f2ff] text-[#5600e0]"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span>{platform}</span>
                          {active ? <ChevronRight className="h-4 w-4" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            </div>
          </div>

          <div className="relative mt-1 lg:mt-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={openRawMenu}
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2.5 rounded-[12px] bg-[#5600e0] px-5 text-[14px] font-bold text-white shadow-md transition-colors hover:bg-[#4300b3] focus:outline-none focus:ring-2 focus:ring-[#5600e0] focus:ring-offset-2"
              aria-haspopup="menu"
              aria-expanded={isRawMenuOpen}
            >
              <Upload className="h-4 w-4 shrink-0" />
              <span>Upload Data</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
            </button>

            {isRawMenuOpen && (
              <div className="absolute right-0 lg:right-0 left-0 lg:left-auto top-full z-50 mt-2 w-full sm:w-[240px] rounded-[18px] border border-[#ddd7ef] bg-white p-2 shadow-[0_20px_44px_rgba(17,24,39,0.12)]">
                <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onImportRawLive();
                        setIsRawMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                    >
                      <Layers3 className="h-4 w-4 text-[#5600e0]" />
                      Upload Raw Data Live
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onImportRawProduct();
                        setIsRawMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                    >
                      <ShoppingBag className="h-4 w-4 text-[#ff6a00]" />
                      Upload Raw Data Product
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onImportRawEngagement();
                        setIsRawMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                    >
                      <Settings2 className="h-4 w-4 text-[#0f766e]" />
                      Upload Raw Data Engagement
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type ReportingWorkspaceTabsProps = {
  activeTab: ReportingTab;
  onTabChange: (tab: ReportingTab) => void;
};

export function ReportingWorkspaceTabs({
  activeTab,
  onTabChange,
}: ReportingWorkspaceTabsProps) {
  const tabClass = (tab: ReportingTab) =>
    `relative border-b-2 pb-3 text-sm font-bold transition-colors bg-transparent ${
      activeTab === tab
        ? "border-[#5600e0] text-[#5600e0]"
        : "border-transparent text-slate-500 hover:text-slate-900"
    }`;

  return (
    <div className="mb-6 flex gap-6 border-b border-[#e8e1fb] px-1 sm:px-2">
      <button
        type="button"
        onClick={() => onTabChange("live")}
        className={tabClass("live")}
      >
        Live Performance
      </button>
      <button
        type="button"
        onClick={() => onTabChange("product")}
        className={tabClass("product")}
      >
        Product Performance
      </button>
      <button
        type="button"
        onClick={() => onTabChange("engagement")}
        className={tabClass("engagement")}
      >
        Engagement & Promotion
      </button>
    </div>
  );
}
