import { ReportRawSessionsCard } from "./ReportRawSessionsCard";
import { UploadHistoryCard } from "./UploadHistoryCard";
import { getNextSortState, type ReportLogLike } from "../../shared/utils/reportTable";
import type { BrandPerformanceLogEntry, UploadHistoryEntry } from "../../shared/types/reporting";
import type { LiveReportViewModel } from "../../shared/utils/liveReporting";
import { buildLiveReportPanelData } from "../../shared/utils/liveReportPanel";
import { MobileLiveOverviewCard } from "./MobileLiveOverviewCard";
import { MobileLiveFunnelCard } from "./MobileLiveFunnelCard";
import { MobileLiveDailyTable } from "./MobileLiveDailyTable";
import { LiveReportSummarySection } from "./LiveReportSummarySection";
import { LiveReportChartSection } from "./LiveReportChartSection";
import type { BrandDashboardSettings } from "../../types";

interface LiveReportPanelProps {
  model: LiveReportViewModel;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
  operatorPlatformFilter: string;
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
  handleEditPerformanceLogDuration?: (
    id: string,
    newDuration: number,
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
  brandDashboardSettings?: BrandDashboardSettings;
  hideUploadHistory?: boolean;
  hideRawTableControls?: boolean;
  isClientView?: boolean;
}

export function LiveReportPanel({
  model,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
  operatorPlatformFilter,
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
  handleEditPerformanceLogDuration,
  brandPerformanceLogs,
  activeReportBrandId,
  brandUploadHistory,
  uploadHistory,
  onDeleteUploadBatch,
  brandDashboardSettings,
  hideUploadHistory = false,
  hideRawTableControls = false,
  isClientView = false,
}: LiveReportPanelProps) {
  const isTikTokLive =
    operatorPlatformFilter.toLowerCase().includes("tiktok");
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

  const hasAnyData = brandPerformanceLogs.some(
    (log) =>
      log.brandId === activeReportBrandId &&
      log.platform === operatorPlatformFilter &&
      log.reportType !== "engagement"
  );

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="md:hidden px-4 pb-6 space-y-4 animate-fadeIn">
        <MobileLiveOverviewCard stats={stats} />
        {chartData.length > 0 && (
          <LiveReportChartSection
            chartData={chartData}
            chartSelectedMetrics={chartSelectedMetrics}
            onChartSelectedMetricsChange={onChartSelectedMetricsChange}
            useShopeeLiveLayout={!isTikTokLive}
            brandDashboardSettings={brandDashboardSettings}
          />
        )}
        <MobileLiveFunnelCard stats={stats} isShopee={!isTikTokLive} />
        <MobileLiveDailyTable logs={tableLogs} />
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block space-y-6 px-6 pb-8 sm:px-8 animate-fadeIn">
        <LiveReportSummarySection
          stats={stats}
          chartData={chartData}
          chartSelectedMetrics={chartSelectedMetrics}
          onChartSelectedMetricsChange={onChartSelectedMetricsChange}
          periodLabel={model.latestDateLabel}
          brandDashboardSettings={brandDashboardSettings}
          isShopee={!isTikTokLive}
          hasData={hasAnyData}
          isClientView={isClientView}
        />

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
        onEditPerformanceLogDuration={handleEditPerformanceLogDuration}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        brandDashboardSettings={brandDashboardSettings}
        isShopee={!isTikTokLive}
        hideControls={hideRawTableControls}
        isClientView={isClientView}
      />

      {!hideUploadHistory && (
        <UploadHistoryCard
          title="Riwayat Upload Data Mentah"
          description="History file CSV raw data performa yang telah berhasil dikonversi & masuk ke database sentral."
          histories={brandUploadHistory.filter((history) => history.brandId === activeReportBrandId)}
          isLoading={isLogsLoading}
          emptyMessage="Belum ada riwayat upload untuk brand ini."
          onDeleteBatch={onDeleteUploadBatch}
        />
      )}
      </div>
    </>
  );
}
