import { ArrowRight, Download, MoreHorizontal, Search, Sparkles, SlidersHorizontal, ChevronDown, Filter } from "lucide-react";
import { Fragment, type KeyboardEvent, useState } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

import { formatDateTimeSafe } from "../../shared/utils/dateTime";
import type {
  ReportBrandOverviewStats,
  ReportBrandRowView,
} from "../../shared/utils/reportBrandSummary";

type ReportBrandSortKey =
  | "latest_activity"
  | "gmv"
  | "sessions"
  | "uploads"
  | "name";

interface ReportBrandSelectionPanelProps {
  overviewStats: ReportBrandOverviewStats;
  filteredRows: readonly ReportBrandRowView[];
  visibleRows: readonly ReportBrandRowView[];
  searchQuery: string;
  platformFilter: string;
  statusFilter: "Aktif" | "Belum Ada Data" | "Semua Status";
  sortKey: ReportBrandSortKey;
  availablePlatforms: readonly string[];
  currentPage: number;
  totalPages: number;
  openBrandCardActionsId: string | null;
  onSearchQueryChange: (value: string) => void;
  onPlatformFilterChange: (value: string) => void;
  onStatusFilterChange: (value: "Aktif" | "Belum Ada Data" | "Semua Status") => void;
  onSortKeyChange: (value: ReportBrandSortKey) => void;
  onResetSearch: () => void;
  onResetFilters: () => void;
  onPageChange: (updater: (prev: number) => number) => void;
  onBrandSelect: (brandId: string) => void;
  onToggleBrandCardActions: (brandId: string) => void;
  onDeleteAllBrandRawData: (brandId: string, brandName: string, platform?: string) => void;
  onDeleteBrandDataByDateRange?: (brandId: string, brandName: string) => void;
  onExportBrand?: (brandId: string, brandName: string) => void;
}

function getSortLabel(sortKey: ReportBrandSortKey) {
  switch (sortKey) {
    case "gmv":
      return "GMV Tertinggi";
    case "sessions":
      return "Sesi Terbanyak";
    case "uploads":
      return "Upload Terbanyak";
    case "name":
      return "Nama A-Z";
    case "latest_activity":
    default:
      return "Terbaru";
  }
}

function handleCardKeyboard(
  event: KeyboardEvent<HTMLDivElement>,
  onActivate: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate();
  }
}

function ReportBrandCard({
  row,
  openBrandCardActionsId,
  onBrandSelect,
  onToggleBrandCardActions,
  onDeleteAllBrandRawData,
  onDeleteBrandDataByDateRange,
  onExportBrand,
}: {
  row: ReportBrandRowView;
  openBrandCardActionsId: string | null;
  onBrandSelect: (brandId: string) => void;
  onToggleBrandCardActions: (brandId: string) => void;
  onDeleteAllBrandRawData: (brandId: string, brandName: string, platform?: string) => void;
  onDeleteBrandDataByDateRange?: (brandId: string, brandName: string) => void;
  onExportBrand?: (brandId: string, brandName: string) => void;
}) {
  const brand = row.brand;
  const brandPlatforms = row.platforms;
  const isBrandActive = row.hasData;
  const isActionsOpen = openBrandCardActionsId === brand.id;
  const [isPasswordCopied, setIsPasswordCopied] = useState(false);
  const portalPassword = brand.clientPassword || "liva123";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Buka dashboard brand ${brand.name}`}
      onClick={() => onBrandSelect(brand.id)}
      onKeyDown={(event) => handleCardKeyboard(event, () => onBrandSelect(brand.id))}
      className="hidden md:flex group relative min-w-0 cursor-pointer flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_12px_28px_-6px_rgba(79,70,229,0.12)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      <div>
        {/* Card Header: Logo, Name, ID & Badges, Actions */}
        <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 overflow-hidden items-center justify-center rounded-xl bg-slate-50 border border-slate-100 font-bold uppercase text-indigo-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-base font-extrabold text-indigo-600">{brand.name.substring(0, 2)}</span>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-[15px] font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600">
                {brand.name}
              </h4>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-medium text-slate-400">
                  {brand.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isBrandActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                      : "bg-slate-50 text-slate-500 ring-1 ring-slate-400/20"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isBrandActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {isBrandActive ? "Aktif" : "Kosong"}
                </span>
              </div>
            </div>
          </div>

          <div className="relative shrink-0" data-brand-card-actions="true">
            {row.sessionCount > 0 || row.batchCount > 0 ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleBrandCardActions(brand.id);
                }}
                aria-expanded={isActionsOpen}
                aria-label={`Aksi untuk brand ${brand.name}`}
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <MoreHorizontal className="size-4" />
              </button>
            ) : null}

            {isActionsOpen ? (
              <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onBrandSelect(brand.id);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Buka Dashboard
                </button>
                {onExportBrand && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onExportBrand(brand.id, brand.name);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Data</span>
                  </button>
                )}
                {onDeleteBrandDataByDateRange && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteBrandDataByDateRange(brand.id, brand.name);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Hapus Rentang Waktu
                  </button>
                )}
                {brandPlatforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteAllBrandRawData(brand.id, brand.name, platform);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Hapus Data {platform}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteAllBrandRawData(brand.id, brand.name);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors ${
                    brandPlatforms.length > 0 ? "border-t border-slate-100 rounded-t-none" : ""
                  }`}
                >
                  {brandPlatforms.length > 0 ? "Hapus Seluruh Platform" : "Hapus Semua Data"}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Platform tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {brandPlatforms.length > 0 ? (
            brandPlatforms.map((platform) => {
              const isShopee = platform.toLowerCase().includes("shopee");
              const isTiktok = platform.toLowerCase().includes("tiktok");
              return (
                <span
                  key={platform}
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                    isShopee
                      ? "bg-amber-50/80 text-amber-700 border-amber-200/60"
                      : isTiktok
                      ? "bg-slate-100 text-slate-800 border-slate-200"
                      : "bg-indigo-50/80 text-indigo-700 border-indigo-200/60"
                  }`}
                >
                  {platform}
                </span>
              );
            })
          ) : (
            <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400 border border-slate-100">
              Belum ada platform
            </span>
          )}
        </div>

        {/* Stats: Sesi & Batch */}
        <div className="mb-2 grid grid-cols-2 gap-3 rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Sesi</div>
            <div className="text-sm font-bold text-slate-800 tabular-nums">{row.sessionCount.toLocaleString("id-ID")}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Batch Upload</div>
            <div className="text-sm font-bold text-slate-800 tabular-nums">{row.batchCount.toLocaleString("id-ID")}</div>
          </div>
        </div>
      </div>

      {/* Card Footer: GMV & Password Copy */}
      <div className="mt-4 border-t border-slate-100/90 pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Total GMV
            </span>
            <span className="block truncate text-base font-extrabold tracking-tight text-indigo-600">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(row.totalGmv)}
            </span>
          </div>

          <div className="flex shrink-0 items-center">
            <div className="text-right">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                Portal Pwd
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void navigator.clipboard.writeText(portalPassword).then(
                    () => {
                      setIsPasswordCopied(true);
                      window.setTimeout(() => setIsPasswordCopied(false), 1500);
                    },
                    () => setIsPasswordCopied(false),
                  );
                }}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all focus:outline-none ${
                  isPasswordCopied
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20"
                    : "bg-slate-100/80 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                title="Salin password portal"
              >
                {isPasswordCopied ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Tersalin
                  </>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function MobileReportBrandCard({
  row,
  openBrandCardActionsId,
  onBrandSelect,
  onToggleBrandCardActions,
  onDeleteAllBrandRawData,
  onDeleteBrandDataByDateRange,
  onExportBrand,
}: {
  row: ReportBrandRowView;
  openBrandCardActionsId: string | null;
  onBrandSelect: (brandId: string) => void;
  onToggleBrandCardActions: (brandId: string) => void;
  onDeleteAllBrandRawData: (brandId: string, brandName: string, platform?: string) => void;
  onDeleteBrandDataByDateRange?: (brandId: string, brandName: string) => void;
  onExportBrand?: (brandId: string, brandName: string) => void;
}) {
  const brand = row.brand;
  const brandPlatforms = row.platforms;
  const isActionsOpen = openBrandCardActionsId === brand.id;
  const primaryPlatform = row.platforms.length > 0 ? row.platforms.join(" / ") : "TOTAL ONLINE SALES";
  
  // Format percentage
  const percentChange = row.percentChange || 0;
  const isPositive = percentChange >= 0;
  const formattedPercent = Math.abs(percentChange).toFixed(2).replace('.', ',') + '%';

  // Format GMV
  const formattedGmv = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(row.totalGmv);

  // Fill chart with dummy data if not enough
  const chartData = (row.monthlyTrend && row.monthlyTrend.length > 1) ? row.monthlyTrend : [
    { label: 'Jun', value: row.totalGmv * 0.4 },
    { label: 'Jul', value: row.totalGmv * 0.6 },
    { label: 'Aug', value: row.totalGmv * 0.5 },
    { label: 'Sep', value: row.totalGmv * 0.8 },
    { label: 'Oct', value: row.totalGmv * 0.9 },
    { label: 'Nov', value: row.totalGmv }
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onBrandSelect(brand.id)}
      className="md:hidden group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
    >
      {/* Top Header: Logo, Title, Date, Menu */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 overflow-hidden items-center justify-center rounded-2xl bg-slate-100 text-sm font-black uppercase text-slate-700">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
            ) : (
              brand.name.substring(0, 2)
            )}
          </div>
          <div>
            <h4 className="text-[13px] font-black uppercase text-slate-800 leading-tight">
              {brand.name}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">
              {row.latestActivity ? new Date(row.latestActivity).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : "Belum ada data"}
            </span>
          </div>
        </div>

        <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
           <button
             type="button"
             onClick={() => onToggleBrandCardActions(brand.id)}
             className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
           >
             <MoreHorizontal className="size-5" />
           </button>
           {isActionsOpen && (
             <div className="absolute right-0 top-10 z-30 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onBrandSelect(brand.id);
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Buka Dashboard
                </button>
                {onExportBrand && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onExportBrand(brand.id, brand.name);
                    }}
                    className="flex w-full items-center gap-1.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-emerald-600 hover:bg-emerald-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Data</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    const pwd = brand.clientPassword || "liva123";
                    navigator.clipboard.writeText(pwd);
                    alert("Password portal " + brand.name + " berhasil disalin: " + pwd);
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                >
                  Salin Password Portal
                </button>
                {brandPlatforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteAllBrandRawData(brand.id, brand.name, platform);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Hapus Data {platform}
                  </button>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Title & GMV */}
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {primaryPlatform}
          </span>
          <div className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
            {formattedGmv}
          </div>
        </div>
        
        {/* Percentage Badge */}
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{formattedPercent}</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-24 w-full mt-2 -ml-2 relative z-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={"colorUv" + brand.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill={"url(#colorUv" + brand.id + ")"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* X Axis Labels */}
      <div className="flex justify-between items-center px-2 mt-2 text-[10px] font-bold text-slate-400">
        {chartData.map((d, i) => (
           <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function ReportBrandSelectionPanel({
  overviewStats,
  filteredRows,
  visibleRows,
  searchQuery,
  platformFilter,
  statusFilter,
  sortKey,
  availablePlatforms,
  currentPage,
  totalPages,
  openBrandCardActionsId,
  onSearchQueryChange,
  onPlatformFilterChange,
  onStatusFilterChange,
  onSortKeyChange,
  onResetSearch,
  onResetFilters,
  onPageChange,
  onBrandSelect,
  onToggleBrandCardActions,
  onDeleteAllBrandRawData,
  onDeleteBrandDataByDateRange,
  onExportBrand,
}: ReportBrandSelectionPanelProps) {
  return (
    <div className="space-y-6" id="operator_reporting_brand_content">

      {/* UNIFIED CONTROL BAR & HEADER */}
      <div className="flex flex-col gap-4">
        <h2 className="md:hidden text-xl font-extrabold text-slate-900 tracking-tight mt-1 px-1">Performance Live Client</h2>
        
        {/* Search & Filters Row */}
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center w-full">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              aria-label="Cari brand klien"
              placeholder="Cari nama brand klien..."
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-16 text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-xs transition-all outline-none hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onResetSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Desktop Filter & Sort Group */}
          <div className="hidden md:flex items-center gap-2">
            {/* Platform Filter */}
            <div className="relative">
              <select
                value={platformFilter}
                onChange={(event) => onPlatformFilterChange(event.target.value)}
                aria-label="Filter platform brand"
                className="h-11 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-xs transition-all outline-none hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="Semua Platform">Semua Platform</option>
                {availablePlatforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  onStatusFilterChange(
                    event.target.value as
                      | "Aktif"
                      | "Belum Ada Data"
                      | "Semua Status",
                  )
                }
                aria-label="Filter status brand"
                className="h-11 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-xs transition-all outline-none hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Belum Ada Data">Belum Ada Data</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            </div>

            {/* Sort Key */}
            <div className="relative">
              <select
                value={sortKey}
                onChange={(event) =>
                  onSortKeyChange(event.target.value as ReportBrandSortKey)
                }
                aria-label="Urutkan brand"
                className="h-11 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-xs transition-all outline-none hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="latest_activity">Terbaru</option>
                <option value="gmv">GMV Tertinggi</option>
                <option value="sessions">Sesi Terbanyak</option>
                <option value="uploads">Upload Terbanyak</option>
                <option value="name">Nama A-Z</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            </div>
          </div>

          {/* Mobile Filter & Sort Row */}
          <div className="grid grid-cols-3 gap-2 md:hidden">
            <div className="relative">
              <select
                value={platformFilter}
                onChange={(event) => onPlatformFilterChange(event.target.value)}
                className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-7 text-xs font-semibold text-slate-700 shadow-xs outline-none"
              >
                <option value="Semua Platform">Platform</option>
                {availablePlatforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  onStatusFilterChange(
                    event.target.value as
                      | "Aktif"
                      | "Belum Ada Data"
                      | "Semua Status",
                  )
                }
                className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-7 text-xs font-semibold text-slate-700 shadow-xs outline-none"
              >
                <option value="Semua Status">Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Belum Ada Data">Kosong</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={sortKey}
                onChange={(event) =>
                  onSortKeyChange(event.target.value as ReportBrandSortKey)
                }
                className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-7 text-xs font-semibold text-slate-700 shadow-xs outline-none"
              >
                <option value="latest_activity">Terbaru</option>
                <option value="gmv">GMV</option>
                <option value="sessions">Sesi</option>
                <option value="uploads">Upload</option>
                <option value="name">A-Z</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Section Header: Brand Tersimpan & Reset Trigger */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Brand Tersimpan
            </h3>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {filteredRows.length} Terdeteksi
            </span>
          </div>

          {(searchQuery ||
            platformFilter !== "Semua Platform" ||
            statusFilter !== "Semua Status" ||
            sortKey !== "latest_activity") && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 focus:outline-none"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <section>
        <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2 2xl:grid-cols-3">
          {visibleRows.map((row) => (
            <Fragment key={row.brand.id}>

              <MobileReportBrandCard
                row={row}
                openBrandCardActionsId={openBrandCardActionsId}
                onBrandSelect={onBrandSelect}
                onToggleBrandCardActions={onToggleBrandCardActions}
                onDeleteAllBrandRawData={onDeleteAllBrandRawData}
                onDeleteBrandDataByDateRange={onDeleteBrandDataByDateRange}
                onExportBrand={onExportBrand}
              />
              <ReportBrandCard
                row={row}

                openBrandCardActionsId={openBrandCardActionsId}
                onBrandSelect={onBrandSelect}
                onToggleBrandCardActions={onToggleBrandCardActions}
                onDeleteAllBrandRawData={onDeleteAllBrandRawData}
                onDeleteBrandDataByDateRange={onDeleteBrandDataByDateRange}
                onExportBrand={onExportBrand}
              />
            </Fragment>
          ))}

          {filteredRows.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-xs font-semibold text-slate-400">
              {searchQuery ||
              platformFilter !== "Semua Platform" ||
              statusFilter !== "Semua Status"
                ? "Tidak ada brand yang cocok dengan filter aktif. Coba ubah kata kunci, platform, atau status."
                : 'Belum ada Brand Klien terdaftar. Silakan tambahkan brand pada sub-menu "Data Brand" terlebih dahulu.'}
            </div>
          ) : null}
        </div>

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange((prev) => Math.max(1, prev - 1))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Sebelumnya
            </button>
            <div className="text-[11px] font-black text-slate-600">
              Halaman {currentPage} / {totalPages}
            </div>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                onPageChange((prev) => Math.min(totalPages, prev + 1))
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya →
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
