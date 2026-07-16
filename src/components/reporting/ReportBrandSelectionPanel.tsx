import { ArrowRight, MoreHorizontal, Search, Sparkles } from "lucide-react";
import { Fragment, type KeyboardEvent, useState } from "react";

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
  onDeleteAllBrandRawData: (brandId: string, brandName: string) => void;
  onDeleteBrandDataByDateRange?: (brandId: string, brandName: string) => void;
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
}: {
  row: ReportBrandRowView;
  openBrandCardActionsId: string | null;
  onBrandSelect: (brandId: string) => void;
  onToggleBrandCardActions: (brandId: string) => void;
  onDeleteAllBrandRawData: (brandId: string, brandName: string) => void;
  onDeleteBrandDataByDateRange?: (brandId: string, brandName: string) => void;
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
      className="group relative flex min-h-56 min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <div>
        <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 overflow-hidden items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-sm font-black uppercase text-indigo-600 shadow-inner transition-transform duration-300 group-hover:scale-105 group-hover:from-indigo-500 group-hover:to-indigo-600 group-hover:text-white">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
              ) : (
                brand.name.substring(0, 2)
              )}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-black uppercase text-slate-900 transition-colors group-hover:text-indigo-600">
                {brand.name}
              </h4>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {brand.id}
                </span>
                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                  isBrandActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-50 text-slate-400"
                }`}>
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
                className="cursor-pointer rounded-xl border border-transparent bg-transparent p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              >
                <MoreHorizontal className="size-4" />
              </button>
            ) : null}

            {isActionsOpen ? (
              <div className="absolute right-0 top-11 z-30 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
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
                {onDeleteBrandDataByDateRange && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteBrandDataByDateRange(brand.id, brand.name);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Hapus Rentang Waktu
                  </button>
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteAllBrandRawData(brand.id, brand.name);
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Hapus Semua Data
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {brandPlatforms.length > 0 ? (
            brandPlatforms.slice(0, 3).map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-600 transition-colors group-hover:bg-slate-100"
              >
                {platform}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-400">
              Belum ada platform
            </span>
          )}
          {brandPlatforms.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-600">
              +{brandPlatforms.length - 3}
            </span>
          )}
        </div>

        <div className="mb-2 flex gap-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sesi</div>
            <div className="text-sm font-black text-slate-700">{row.sessionCount}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Batch</div>
            <div className="text-sm font-black text-slate-700">{row.batchCount}</div>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Total GMV
            </span>
            <span className="block truncate text-sm font-black text-indigo-600">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(row.totalGmv)}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="text-right">
              <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">
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
                className={`mt-0.5 inline-flex cursor-pointer items-center rounded-lg px-2 py-1 transition-colors focus:outline-none ${
                  isPasswordCopied
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {isPasswordCopied ? "Tersalin" : "Copy"}
                </span>
              </button>
            </div>
          </div>
        </div>
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
}: ReportBrandSelectionPanelProps) {
  return (
    <div className="space-y-6" id="operator_reporting_brand_content">

      {/* UNIFIED CONTROL BAR & HEADER */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Cari brand klien"
              placeholder="Cari brand berdasarkan nama atau ID..."
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onResetSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="h-px w-full bg-slate-100 sm:h-8 sm:w-px" />

          <div className="flex flex-wrap items-center gap-2 p-1 sm:p-0">
            <select
              value={platformFilter}
              onChange={(event) => onPlatformFilterChange(event.target.value)}
              aria-label="Filter platform brand"
              className="cursor-pointer appearance-none rounded-lg border-none bg-slate-50 px-3 py-2 pr-8 text-xs font-semibold text-slate-700 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="Semua Platform">Semua Platform</option>
              {availablePlatforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
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
              className="cursor-pointer appearance-none rounded-lg border-none bg-slate-50 px-3 py-2 pr-8 text-xs font-semibold text-slate-700 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Belum Ada Data">Belum Ada Data</option>
            </select>
            <select
              value={sortKey}
              onChange={(event) =>
                onSortKeyChange(event.target.value as ReportBrandSortKey)
              }
              aria-label="Urutkan brand"
              className="cursor-pointer appearance-none rounded-lg border-none bg-slate-50 px-3 py-2 pr-8 text-xs font-semibold text-slate-700 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="latest_activity">Terbaru</option>
              <option value="gmv">GMV Tertinggi</option>
              <option value="sessions">Sesi Terbanyak</option>
              <option value="uploads">Upload Terbanyak</option>
              <option value="name">Nama A-Z</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 text-left mb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
              Brand Tersimpan
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
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
              className="text-[10px] font-bold uppercase tracking-wider text-red-500 transition-colors hover:text-red-700"
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
              <ReportBrandCard
                row={row}
                openBrandCardActionsId={openBrandCardActionsId}
                onBrandSelect={onBrandSelect}
                onToggleBrandCardActions={onToggleBrandCardActions}
                onDeleteAllBrandRawData={onDeleteAllBrandRawData}
                onDeleteBrandDataByDateRange={onDeleteBrandDataByDateRange}
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
