import { ReportFiltersBar } from "./ReportFiltersBar";
import { ReportPeriodNavigator } from "./ReportPeriodNavigator";
import { ReportRawSessionsCard } from "./ReportRawSessionsCard";
import { UploadHistoryCard } from "./UploadHistoryCard";
import { getNextSortState, type ReportLogLike } from "../../shared/utils/reportTable";
import { getReportPeriodLabel } from "../../shared/utils/reportDateFilters";
import type { BrandPerformanceLogEntry, UploadHistoryEntry } from "../../shared/types/reporting";
import type { LiveReportViewModel } from "../../shared/utils/liveReporting";
import { buildLiveReportPanelData } from "../../shared/utils/liveReportPanel";
import { LiveReportSummarySection } from "./LiveReportSummarySection";

interface LiveReportPanelProps {
  model: LiveReportViewModel;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
  onPrev: () => void;
  onNext: () => void;
  reportDbSearchQuery: string;
  onSearchQueryChange: (value: string) => void;
  operatorPlatformFilter: string;
  onPlatformFilterChange: (value: string) => void;
  availableOperatorPlatforms: string[];
  operatorDateFilterType: "all" | "latest" | "month" | "custom";
  onDateFilterTypeSelect: (value: "all" | "latest" | "month" | "custom") => void;
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
  shifts: string[];
  adminShiftChecklist: string[];
  setAdminShiftChecklist: (value: string[]) => void;
  reportingShopeeRawTab: "day" | "shift" | "dayOfWeek" | "raw";
  setReportingShopeeRawTab: (
    value: "day" | "shift" | "dayOfWeek" | "raw",
  ) => void;
  reportDbSortCol: string;
  reportDbSortAsc: boolean;
  setReportDbSortCol: (value: string) => void;
  setReportDbSortAsc: (value: boolean) => void;
  currentPage: number;
  setCurrentPage: (value: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  isLogsLoading: boolean;
  handleDeletePerformanceLog: (
    id: string,
    brandName?: string,
    date?: string,
  ) => void;
  brandPerformanceLogs: BrandPerformanceLogEntry[];
  activeReportBrandId: string;
  brandUploadHistory: UploadHistoryEntry[];
  uploadHistory: UploadHistoryEntry[];
  onDeleteUploadBatch: (
    id: string,
    fileName: string,
    rowCount: number,
  ) => void;
  onImportRaw: () => void;
}

export function LiveReportPanel({
  model,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
  onPrev,
  onNext,
  reportDbSearchQuery,
  onSearchQueryChange,
  operatorPlatformFilter,
  onPlatformFilterChange,
  availableOperatorPlatforms,
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
  shifts,
  adminShiftChecklist,
  setAdminShiftChecklist,
  reportingShopeeRawTab,
  setReportingShopeeRawTab,
  reportDbSortCol,
  reportDbSortAsc,
  setReportDbSortCol,
  setReportDbSortAsc,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  isLogsLoading,
  handleDeletePerformanceLog,
  brandPerformanceLogs,
  activeReportBrandId,
  brandUploadHistory,
  uploadHistory,
  onDeleteUploadBatch,
  onImportRaw,
}: LiveReportPanelProps) {
  const panelData = buildLiveReportPanelData({
    model,
    operatorPlatformFilter,
    reportDbSortCol,
    reportDbSortAsc,
    currentPage,
    itemsPerPage,
  });
  const {
    stats,
    chartData,
    sortedTableLogs,
    paginatedLogs,
    totalPages,
  } = panelData;
  const handleSort = (col: string) => {
    const nextSort = getNextSortState(reportDbSortCol, reportDbSortAsc, col);
    setReportDbSortCol(nextSort.sortKey);
    setReportDbSortAsc(nextSort.sortAsc);
  };

  return (
    <div className="px-6 pb-8 sm:px-8 space-y-6 animate-fadeIn">
      <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Tab Live
            </p>
            <h3 className="mt-1 text-lg font-black text-slate-900">
              Ringkasan sesi live dan raw data
            </h3>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Mulai dari filter periode, lalu turun ke ringkasan performa, dan
            terakhir ke tabel raw sessions serta riwayat upload. Urutannya
            dibuat supaya orientasi data lebih mudah saat masuk ke workspace.
          </p>
        </div>
      </div>

      <ReportFiltersBar
        showSearch={false}
        searchQuery={reportDbSearchQuery}
        onSearchQueryChange={onSearchQueryChange}
        platformFilter={operatorPlatformFilter}
        onPlatformFilterChange={onPlatformFilterChange}
        availablePlatforms={availableOperatorPlatforms}
        dateFilterType={operatorDateFilterType}
        onDateFilterTypeSelect={onDateFilterTypeSelect}
        monthPickerYear={operatorMonthPickerYear}
        setMonthPickerYear={setOperatorMonthPickerYear}
        selectedMonth={operatorSelectedMonth}
        setSelectedMonth={setOperatorSelectedMonth}
        isMonthOpen={isOperatorMonthOpen}
        setIsMonthOpen={setIsOperatorMonthOpen}
        isCalendarOpen={isOperatorCalendarOpen}
        setIsCalendarOpen={setIsOperatorCalendarOpen}
        customStartDate={operatorCustomStartDate}
        customEndDate={operatorCustomEndDate}
        tempStartDate={operatorTempStartDate}
        tempEndDate={operatorTempEndDate}
        onTempStartDateChange={setOperatorTempStartDate}
        onTempEndDateChange={setOperatorTempEndDate}
        onApplyCustom={(start, end) => {
          setOperatorCustomStartDate(start);
          setOperatorCustomEndDate(end);
          setIsOperatorCalendarOpen(false);
        }}
        onCancelCustom={() => setIsOperatorCalendarOpen(false)}
        primaryActionLabel="Add Raw Data"
        onPrimaryAction={onImportRaw}
      />

      <div className="space-y-6 mb-6">
        <ReportPeriodNavigator
          title={stats.isShopee ? "Performance live" : "Sale Metrics"}
          label={getReportPeriodLabel({
            dateFilterType: operatorDateFilterType,
            latestDateLabel: model.latestDateLabel,
            targetLatestDate: model.targetLatestDate,
            customStartDate: operatorCustomStartDate,
          })}
          onPrev={onPrev}
          onNext={onNext}
        />

        <LiveReportSummarySection
          stats={stats}
          chartData={chartData}
          chartSelectedMetrics={chartSelectedMetrics}
          onChartSelectedMetricsChange={onChartSelectedMetricsChange}
          periodLabel={model.latestDateLabel}
        />
      </div>

      <ReportRawSessionsCard
        reportingShopeeRawTab={reportingShopeeRawTab}
        setReportingShopeeRawTab={setReportingShopeeRawTab}
        shifts={shifts}
        adminShiftChecklist={adminShiftChecklist}
        setAdminShiftChecklist={setAdminShiftChecklist}
        sortedTableLogs={sortedTableLogs as ReportLogLike[]}
        paginatedLogs={paginatedLogs as ReportLogLike[]}
        isLogsLoading={isLogsLoading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        reportDbSortCol={reportDbSortCol}
        reportDbSortAsc={reportDbSortAsc}
        onSort={handleSort}
        onDeletePerformanceLog={handleDeletePerformanceLog}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <UploadHistoryCard
        title="Riwayat Upload Data Mentah"
        description="History file CSV raw data performa yang telah berhasil dikonversi & masuk ke database sentral."
        histories={brandUploadHistory.filter((history) => history.brandId === activeReportBrandId)}
        isLoading={isLogsLoading}
        emptyMessage="Belum ada riwayat upload untuk brand ini."
        onDeleteBatch={onDeleteUploadBatch}
      />
    </div>
  );
}
