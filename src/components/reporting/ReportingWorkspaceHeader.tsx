import { useMemo, useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Layers3,
  ShoppingBag,
  Settings2,
  Upload,
  MoreVertical,
  Filter,
} from "lucide-react";
import { AdvancedDatePicker } from "./AdvancedDatePicker";
import { getIndonesianMonthLabel } from "../../shared/utils/reporting";
import { type ReportDateFilterType } from "../../shared/utils/reportTable";

export type ReportingTab = "live" | "product" | "engagement" | "analysis" | "settings" | "metrics";

type Setter<T> = (value: T | ((prev: T) => T)) => void;

type ReportingWorkspaceHeaderProps = {
  brandName: string;
  brandId?: string;
  brandLogoUrl?: string;
  onBack?: () => void;
  activeTab: ReportingTab;
  platformFilter: string;
  onPlatformFilterChange: (value: string) => void;
  availablePlatforms?: string[];
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
  onImportRawLive?: () => void;
  onImportRawProduct?: () => void;
  onImportRawEngagement?: () => void;
  onOpenAddManualDuration?: () => void;
  periodLabel?: string;
  onPrevPeriod?: () => void;
  onNextPeriod?: () => void;
  canPrevPeriod?: boolean;
  canNextPeriod?: boolean;
  sessionCount?: number;
  operatorShiftFilters?: string[];
  setOperatorShiftFilters?: Setter<string[]>;
  availableShifts?: string[];
  brandDashboardSettings?: any;
  sessionCount?: number;
  onDeleteBrandDataByDateRange?: (brandId: string, brandName: string) => void;
  onDeleteAllBrandRawData?: (brandId: string, brandName: string, platform?: string) => void;
};

const DATE_FILTER_OPTIONS: Array<{
  id: ReportDateFilterType;
  label: string;
}> = [
  { id: "latest", label: "Terbaru" },
  { id: "all", label: "Semua" },
  { id: "monthly", label: "Bulan" },
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
  if (dateFilterType === "daily") {
    return customStartDate ? formatDateLabel(customStartDate) : "Pilih Tanggal";
  }

  if (dateFilterType === "custom" || dateFilterType === "weekly") {
    if (customStartDate && customEndDate) {
      return `${formatDateLabel(customStartDate)} - ${formatDateLabel(customEndDate)}`;
    }
    return "Pilih rentang";
  }

  if (dateFilterType === "monthly") {
    return selectedMonth ? getIndonesianMonthLabel(selectedMonth) : "Pilih bulan";
  }

  if (dateFilterType === "1_month") return "1 Bulan Terakhir";
  if (dateFilterType === "3_months") return "3 Bulan Terakhir";
  if (dateFilterType === "all") return "Semua Rentang Data";
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
  availablePlatforms = ["Shopee Live", "TikTok Live"],
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
  onOpenAddManualDuration,
  periodLabel,
  onPrevPeriod,
  onNextPeriod,
  canPrevPeriod = true,
  canNextPeriod = true,
  operatorShiftFilters = [],
  setOperatorShiftFilters,
  availableShifts = [],
  brandDashboardSettings,
  sessionCount,
  onDeleteBrandDataByDateRange,
  onDeleteAllBrandRawData,
}: ReportingWorkspaceHeaderProps) {
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const [isRawMenuOpen, setIsRawMenuOpen] = useState(false);
  const [isShiftDropdownOpen, setIsShiftDropdownOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const rawMenuRef = useRef<HTMLDivElement>(null);
  const dateMenuRef = useRef<HTMLDivElement>(null);
  const platformMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isRawMenuOpen && rawMenuRef.current && !rawMenuRef.current.contains(event.target as Node)) {
        setIsRawMenuOpen(false);
      }
      if (isDateMenuOpen && dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
        setIsDateMenuOpen(false);
      }
      if (isPlatformMenuOpen && platformMenuRef.current && !platformMenuRef.current.contains(event.target as Node)) {
        setIsPlatformMenuOpen(false);
      }
      if (isSettingsMenuOpen && settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRawMenuOpen, isDateMenuOpen, isPlatformMenuOpen, isSettingsMenuOpen]);

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
      className="pt-3 pb-0 sm:py-4"
      data-active-tab={activeTab}
    >
      <div className="flex flex-col">
        {/* === MOBILE-ONLY header row (hidden on desktop) === */}
        <div className="flex items-center justify-between pb-3 md:hidden">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Kembali"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e7e0f8] bg-white text-sm font-bold text-slate-600">
                {brandLogoUrl ? (
                  <img
                    src={brandLogoUrl}
                    alt={`${brandName || "Brand"} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs">{brandInitials || "RB"}</span>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <h2 className="text-[17px] font-semibold tracking-tight text-slate-950 leading-tight truncate">
                  {brandName || "Nama Brand"}
                </h2>
                <p className="text-[12px] font-medium text-[#a855f7] leading-tight mt-0.5">
                  {selectedPlatform} {sessionCount !== undefined && `- ${sessionCount} Session`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative" ref={settingsMenuRef}>
            <button
              type="button"
              onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-slate-50 border border-slate-200 text-slate-500 shadow-sm transition-colors hover:bg-slate-100"
            >
              <Settings2 className="h-[18px] w-[18px]" />
            </button>
            {isSettingsMenuOpen ? (
              <div className="absolute right-0 top-11 z-[60] w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {onDeleteBrandDataByDateRange && brandId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      onDeleteBrandDataByDateRange(brandId, brandName || "Brand");
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Hapus Rentang Waktu
                  </button>
                )}
                {availablePlatforms?.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      if (onDeleteAllBrandRawData && brandId) {
                        onDeleteAllBrandRawData(brandId, brandName || "Brand", platform);
                      }
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Hapus Data {platform}
                  </button>
                ))}
                {onDeleteAllBrandRawData && brandId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      onDeleteAllBrandRawData(brandId, brandName || "Brand");
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 ${availablePlatforms && availablePlatforms.length > 0 ? "border-t border-slate-100 rounded-t-none mt-1 pt-2" : ""}`}
                  >
                    {availablePlatforms && availablePlatforms.length > 0 ? "Hapus Seluruh Platform" : "Hapus Semua Data"}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
        {/* === DESKTOP-ONLY header row (hidden on mobile) === */}
        <div className="hidden md:flex items-center gap-3 pb-4 border-b border-[#e7e0f8]">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Kembali"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#5600e0] text-lg font-black text-white shadow-sm">
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

            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-[clamp(1.25rem,2vw,1.75rem)] font-black tracking-tight text-slate-950 leading-tight">
                {brandName || "Nama Brand"}
              </h2>
              <p className="mt-0.5 text-sm font-semibold text-slate-500">
                ID: {brandCode}
              </p>
            </div>
          </div>
          
          {(onImportRawLive || onImportRawProduct || onImportRawEngagement || onOpenAddManualDuration) && (
            <div className="relative flex-shrink-0" ref={rawMenuRef}>
              <button
                type="button"
                onClick={openRawMenu}
                className="inline-flex h-[48px] items-center justify-center gap-3 rounded-[20px] bg-[#5200ff] px-5 shadow-[0_8px_16px_-6px_rgba(82,0,255,0.4)] transition-all hover:bg-[#4300cc] focus:outline-none focus:ring-2 focus:ring-[#5200ff] focus:ring-offset-2 active:scale-95"
                aria-haspopup="menu"
                aria-expanded={isRawMenuOpen}
              >
                <Upload className="h-[18px] w-[18px] shrink-0 text-white" strokeWidth={2.5} />
                <div className="flex flex-col items-start leading-[1.1] text-left">
                  <span className="text-[14px] font-bold text-white">Upload</span>
                  <span className="text-[14px] font-bold text-white">Data</span>
                </div>
                <ChevronDown className="h-[18px] w-[18px] shrink-0 text-white opacity-80" strokeWidth={2.5} />
              </button>
              
              {isRawMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[240px] rounded-[18px] border border-slate-200 bg-white p-2 shadow-[0_20px_44px_rgba(17,24,39,0.12)]">
                  <div className="space-y-1">
                    {onImportRawLive && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); onImportRawLive(); setIsRawMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950">
                        <Layers3 className="h-4 w-4 text-indigo-600" /> Upload Raw Data Live
                      </button>
                    )}
                    {onOpenAddManualDuration && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); onOpenAddManualDuration(); setIsRawMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950">
                        <CalendarDays className="h-4 w-4 text-indigo-600" /> Tambah Durasi Manual
                      </button>
                    )}
                    {onImportRawProduct && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); onImportRawProduct(); setIsRawMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950">
                        <ShoppingBag className="h-4 w-4 text-[#ff6a00]" /> Upload Raw Data Product
                      </button>
                    )}
                    {onImportRawEngagement && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); onImportRawEngagement(); setIsRawMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950">
                        <Settings2 className="h-4 w-4 text-[#0f766e]" /> Upload Raw Data Engagement
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* === FILTER BAR: mobile = flex wrap, desktop = flex wrap === */}
        <div className="flex flex-row flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4 sm:items-center sm:justify-between pb-2">
          <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-3 w-full">
            {/* Date Filter */}
            <div className="relative flex-shrink-0" ref={dateMenuRef}>
              <button
                type="button"
                onClick={openDateMenu}
                className="inline-flex h-8 sm:h-11 items-center gap-1 sm:gap-2 rounded-full border border-slate-200 bg-white px-3 sm:px-4 text-[11px] sm:text-[14px] font-semibold text-slate-800 shadow-sm"
                aria-haspopup="menu"
                aria-expanded={isDateMenuOpen}
              >
                <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-slate-400" />
                <span className="truncate max-w-[70px] sm:max-w-none">{dateButtonLabel}</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-slate-400" />
              </button>

              {isDateMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-2">
                  <AdvancedDatePicker
                    initialType={dateFilterType}
                    initialStartDate={customStartDate}
                    initialEndDate={customEndDate}
                    initialMonth={selectedMonth}
                    onApply={(type, startDate, endDate, month) => {
                      onDateFilterTypeSelect(type);
                      if (type === 'custom' || type === 'daily' || type === 'weekly') {
                        onApplyCustom(startDate, endDate);
                      } else if (type === 'monthly') {
                        setSelectedMonth(month);
                      }
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

            {/* Date Navigation (period nav) */}
            {dateFilterType === "latest" && periodLabel && onPrevPeriod && onNextPeriod ? (
              <div className="hidden md:flex items-center gap-0.5 sm:gap-1 rounded-full border border-slate-200 bg-white px-1 sm:px-2 shadow-sm h-8 sm:h-11 flex-shrink-0">
                <button
                  type="button"
                  onClick={onPrevPeriod}
                  disabled={!canPrevPeriod}
                  className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <div className="min-w-[100px] sm:min-w-[150px] px-0.5 sm:px-2 text-center">
                  <p className="text-[11px] sm:text-xs font-bold text-[#5600e0] truncate">
                    {periodLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNextPeriod}
                  disabled={!canNextPeriod}
                  className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            ) : null}

            {/* Platform Filter */}
            <div className="relative flex-shrink-0" ref={platformMenuRef}>
              <button
                type="button"
                onClick={openPlatformMenu}
                className="inline-flex h-8 sm:h-11 items-center gap-1 sm:gap-2 rounded-full border border-slate-200 bg-white px-3 sm:px-4 text-[11px] sm:text-[14px] font-semibold text-slate-800 shadow-sm"
                aria-haspopup="menu"
                aria-expanded={isPlatformMenuOpen}
              >
                <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-[#ff6a00]" />
                <span className="truncate max-w-[80px] sm:max-w-none">{selectedPlatform}</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-slate-400" />
              </button>

              {isPlatformMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[220px] rounded-[18px] border border-slate-200 bg-white p-2 shadow-[0_20px_44px_rgba(17,24,39,0.12)]">
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
                            active ? "bg-[#f7f2ff] text-indigo-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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

        {setOperatorShiftFilters && (
          <div className="border-t border-[#edf0fb] pt-3 pb-1 relative">
            {/* Active date label */}
            <div className="flex items-center gap-2 px-1 mb-2">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-500">Periode aktif:</span>
              <span className="text-[11px] font-bold text-[#5600e0] truncate">
                {periodLabel
                  ? periodLabel
                  : dateFilterType === "all"
                  ? "Semua Rentang Data"
                  : dateButtonLabel}
              </span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsShiftDropdownOpen(!isShiftDropdownOpen)}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-[#e4ddf6] bg-[#faf8ff] text-slate-700 hover:bg-[#f3edff] transition-all text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#5600e0]">Filter & Grouping Shift</span>
                  <span className="bg-[#5600e0] text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold max-w-[400px] truncate" title={operatorShiftFilters.join(", ")}>
                    {operatorShiftFilters.length === 0 ? "All Time" : operatorShiftFilters.join(", ")}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-[#5600e0] transition-transform duration-200 ${isShiftDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {isShiftDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsShiftDropdownOpen(false)} />
                  <div className="absolute left-0 right-0 z-50 mt-2 flex flex-wrap items-center gap-2 rounded-[18px] border border-[#e4ddf6] bg-white p-3 shadow-lg max-h-[250px] overflow-y-auto">
                    {(() => {
                      const isAllTimeAllowed = brandDashboardSettings?.allowedShifts ? brandDashboardSettings.allowedShifts.includes("All Time") : true;
                      if (!isAllTimeAllowed) return null;
                      return (
                        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition-colors hover:bg-slate-50">
                          <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-[#5600e0]" checked={operatorShiftFilters.length === 0} onChange={(e) => { if (e.target.checked) setOperatorShiftFilters([]); }} />
                          <span className="text-xs font-semibold text-slate-700">All Time</span>
                        </label>
                      );
                    })()}
                    {availableShifts.map((sh) => (
                      <label key={sh} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition-colors hover:bg-slate-50">
                        <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-[#5600e0]" checked={operatorShiftFilters.includes(sh)}
                          onChange={(e) => {
                            if (e.target.checked) { setOperatorShiftFilters([...operatorShiftFilters, sh]); }
                            else { setOperatorShiftFilters(operatorShiftFilters.filter((x) => x !== sh)); }
                          }}
                        />
                        <span className="text-xs font-semibold text-slate-700">{sh}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type ReportingWorkspaceTabsProps = {
  activeTab: ReportingTab;
  onTabChange: (tab: ReportingTab) => void;
  hideSettingsTab?: boolean;
  brandDashboardSettings?: any;
};

export function ReportingWorkspaceTabs({
  activeTab,
  onTabChange,
  hideSettingsTab,
  brandDashboardSettings,
}: ReportingWorkspaceTabsProps) {
  const tabClass = (tab: ReportingTab) =>
    `relative whitespace-nowrap px-1 pb-2 pt-1 sm:py-3 text-[13px] sm:text-[14px] font-semibold sm:font-bold transition-all border-b-2 sm:border-b-[3px] ${
      activeTab === tab
        ? "border-[#5600e0] text-[#5600e0]"
        : "border-transparent text-slate-400 sm:text-slate-500 hover:text-slate-700"
    }`;

  // Helper to check if a category is hidden
  const isCategoryHidden = (categoryId: string) => {
    return brandDashboardSettings?.hiddenCategories?.includes(categoryId) ?? false;
  };

  return (
    <div className="sticky top-[64px] sm:top-[72px] z-40 mb-4 bg-white border-b border-slate-100">
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar sm:inline-flex w-full sm:w-auto">
          {!isCategoryHidden("live") && (
        <button
          type="button"
          onClick={() => onTabChange("live")}
          className={tabClass("live")}
        >
          <span className="md:hidden">Overview</span>
          <span className="hidden md:inline">Live Performance</span>
        </button>
      )}
      {!isCategoryHidden("product") && (
        <button
          type="button"
          onClick={() => onTabChange("product")}
          className={`${tabClass("product")} hidden md:inline-block`}
        >
          <span className="hidden md:inline">Product Performance</span>
        </button>
      )}

      {/* METRIKS TAB - MOBILE ONLY (posisi ke-2 di mobile) */}
      <button
        type="button"
        onClick={() => onTabChange("metrics")}
        className={`${tabClass("metrics")} md:hidden`}
      >
        Metriks
      </button>

      {!isCategoryHidden("analysis") && (
        <button
          type="button"
          onClick={() => onTabChange("analysis")}
          className={`${tabClass("analysis")}`}
        >
          <span className="md:hidden">Analysis</span>
          <span className="hidden md:inline">Analysis Performance</span>
        </button>
      )}

      {!hideSettingsTab && (
        <button
          type="button"
          onClick={() => onTabChange("settings")}
          className={`${tabClass("settings")}`}
        >
          <span className="md:hidden">Pengaturan</span>
          <span className="hidden md:inline">Pengaturan Klien</span>
        </button>
          )}
        </div>
      </div>
    </div>
  );
}


