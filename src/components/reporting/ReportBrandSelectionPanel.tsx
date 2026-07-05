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
}: {
  row: ReportBrandRowView;
  openBrandCardActionsId: string | null;
  onBrandSelect: (brandId: string) => void;
  onToggleBrandCardActions: (brandId: string) => void;
  onDeleteAllBrandRawData: (brandId: string, brandName: string) => void;
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
      className="group relative flex min-h-64 min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <div>
        <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-black uppercase text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              {brand.name.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-black uppercase text-slate-900 transition-colors group-hover:text-indigo-600">
                {brand.name}
              </h4>
              <p className="truncate text-[10px] font-bold uppercase text-slate-400">
                ID: {brand.id}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {brandPlatforms.length > 0 ? (
                  brandPlatforms.slice(0, 2).map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-600"
                    >
                      {platform}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-500">
                    Belum ada platform
                  </span>
                )}
                {brandPlatforms.length > 2 && (
                  <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-600">
                    +{brandPlatforms.length - 2}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-600">
                  {row.sessionCount} Sesi
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-600">
                  {row.batchCount} Batch
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black ${
                    isBrandActive
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  {isBrandActive ? "Aktif" : "Belum Ada Data"}
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
                className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-colors hover:bg-slate-100"
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
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">
              Total GMV
            </span>
            <span className="block truncate text-[11px] font-black text-indigo-600">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(row.totalGmv)}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">
              Portal
            </span>
            <div className="mt-1 flex items-center justify-end gap-2">
              <span className="max-w-[7.5rem] truncate rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] font-black text-slate-400">
                ••••••••
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
                aria-label={`Salin password portal brand ${brand.name}`}
                className={`rounded-lg border px-2 py-1 text-[10px] font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 ${
                  isPasswordCopied
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
                title="Salin password portal"
              >
                {isPasswordCopied ? "Tersalin" : "Salin"}
              </button>
            </div>
            <span className="mt-2 block text-[9px] font-semibold uppercase tracking-widest text-slate-400">
              Terakhir update
            </span>
            <span className="block text-[11px] font-black text-slate-700">
              {row.latestActivity
                ? formatDateTimeSafe(row.latestActivity, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold text-slate-500">
            Klik kartu untuk membuka dashboard detail.
          </span>
          <ArrowRight className="size-3.5 text-indigo-500 transition-transform duration-200 group-hover:translate-x-0.5" />
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
}: ReportBrandSelectionPanelProps) {
  return (
    <div className="space-y-6" id="operator_reporting_brand_content">
      <section className="overflow-hidden rounded-2xl border border-[#e5e2e1] bg-white shadow-[0_8px_28px_rgba(27,28,28,0.04)]">
        <div className="flex flex-col gap-6 p-6 sm:p-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cbc3d9] bg-[#f6f3f2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#5600e0]">
              <Sparkles className="size-3 text-[#5600e0]" />
              Reporting Brand Workspace
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[#1b1c1c] sm:text-[30px]">
              Pilih brand untuk membuka dashboard detail
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-[#494456] sm:text-[15px]">
              Cari brand, filter daftar, lalu klik satu kartu untuk masuk ke
              workspace brand. Detail performa akan muncul setelah brand
              dipilih.
            </p>
          </div>

          <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 xl:w-auto xl:min-w-[32rem]">
            <div className="rounded-xl border border-[#cbc3d9] bg-[#ffffff] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#494456]">
                Brand
              </div>
              <div className="mt-1 text-[22px] font-black tracking-tight text-[#1b1c1c] tabular-nums">
                {overviewStats.totalBrands}
              </div>
            </div>
            <div className="rounded-xl border border-[#cbc3d9] bg-[#f6f3f2] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#494456]">
                Aktif
              </div>
              <div className="mt-1 text-[22px] font-black tracking-tight text-[#5600e0] tabular-nums">
                {overviewStats.activeBrands}
              </div>
              <div className="mt-1 text-[11px] font-semibold text-[#494456]">
                {overviewStats.totalSessions} sesi live terkumpul.
              </div>
            </div>
            <div className="rounded-xl border border-[#cbc3d9] bg-[#ffffff] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#494456]">
                Total GMV
              </div>
              <div
                className="mt-1 truncate whitespace-nowrap text-[22px] font-black tracking-tight text-[#1b1c1c] tabular-nums"
                title={new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(overviewStats.totalGmv)}
              >
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(overviewStats.totalGmv)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#cbc3d9] bg-white p-4 shadow-[0_8px_24px_rgba(27,28,28,0.03)] sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7a7488]" />
            <input
              type="text"
              aria-label="Cari brand klien"
              placeholder="Cari brand klien berdasarkan nama atau ID..."
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="w-full rounded-xl border border-[#cbc3d9] bg-[#f6f3f2] py-3 pl-10 pr-4 text-sm font-medium text-[#1b1c1c] placeholder:text-[#7a7488] outline-none transition-colors focus:border-[#5600e0] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#5600e0]/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={platformFilter}
              onChange={(event) => onPlatformFilterChange(event.target.value)}
              aria-label="Filter platform brand"
              className="rounded-xl border border-[#cbc3d9] bg-[#f6f3f2] px-3 py-3 text-xs font-semibold text-[#1b1c1c] outline-none transition-colors focus:border-[#5600e0] focus-visible:ring-2 focus-visible:ring-[#5600e0]/15"
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
              className="rounded-xl border border-[#cbc3d9] bg-[#f6f3f2] px-3 py-3 text-xs font-semibold text-[#1b1c1c] outline-none transition-colors focus:border-[#5600e0] focus-visible:ring-2 focus-visible:ring-[#5600e0]/15"
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
              className="rounded-xl border border-[#cbc3d9] bg-[#f6f3f2] px-3 py-3 text-xs font-semibold text-[#1b1c1c] outline-none transition-colors focus:border-[#5600e0] focus-visible:ring-2 focus-visible:ring-[#5600e0]/15"
            >
              <option value="latest_activity">Urutkan: Terbaru</option>
              <option value="gmv">Urutkan: GMV Tertinggi</option>
              <option value="sessions">Urutkan: Sesi Terbanyak</option>
              <option value="uploads">Urutkan: Upload Terbanyak</option>
              <option value="name">Urutkan: Nama A-Z</option>
            </select>

            {searchQuery ? (
              <button
                type="button"
                onClick={onResetSearch}
                className="cursor-pointer rounded-xl border border-[#cbc3d9] bg-white px-4 py-3 text-xs font-black text-[#5600e0] transition-colors hover:bg-[#f6f3f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5600e0]/15"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 text-left">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
            Brand Tersimpan
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            {filteredRows.length} brand terdeteksi sesuai filter aktif.
          </p>
        </div>
        {searchQuery ? (
            <button
              type="button"
              onClick={onResetSearch}
              className="text-xs font-black text-[#5600e0] hover:text-[#4f00d0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5600e0]/15"
            >
              Hapus kata kunci
            </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span>Filter Aktif</span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            {platformFilter}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            {statusFilter}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            {getSortLabel(sortKey)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">
            Menampilkan {visibleRows.length} brand
          </span>
          {(searchQuery ||
            platformFilter !== "Semua Platform" ||
            statusFilter !== "Semua Status" ||
            sortKey !== "latest_activity") && (
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-full border border-[#cbc3d9] bg-[#f6f3f2] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#5600e0] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5600e0]/15"
            >
              Reset Semua Filter
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
