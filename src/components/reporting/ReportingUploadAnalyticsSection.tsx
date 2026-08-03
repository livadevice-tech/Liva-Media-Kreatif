import type { ReportingRawRow } from "../../shared/types/reporting";
import type { ReportingUploadSummary } from "../../shared/utils/reportingUploadSummary";
import { buildLiveReportPanelData } from "../../shared/utils/liveReportPanel";
import { LiveReportMetricsSection } from "./LiveReportMetricsSection";
import { useMemo } from "react";
import type { ReportLogLike } from "../../shared/utils/reportTable";

type ReportingUploadAnalyticsSectionProps = {
  reportingRawData: readonly ReportingRawRow[];
  reportingUploadSummary: ReportingUploadSummary;
  saveTargetPlatform: string;
  uploadTargetTab: "live" | "engagement";
  activeReportPlatform: string;
};

export function ReportingUploadAnalyticsSection({
  reportingRawData,
  saveTargetPlatform,
  activeReportPlatform,
}: ReportingUploadAnalyticsSectionProps) {
  const stats = useMemo(() => {
    // Convert ReportingRawRow to ReportLogLike for the builder
    const tableLogs = reportingRawData.map((r, i) => ({
      ...r,
      id: `preview-${i}`,
      brandId: "preview",
      platform: saveTargetPlatform || activeReportPlatform,
      reportType: "live"
    })) as any;

    const result = buildLiveReportPanelData({
      model: {
        tableLogs,
        prevTableLogs: [],
        filteredDb: tableLogs,
        liveChartData: [],
      } as any,
      operatorPlatformFilter: saveTargetPlatform || activeReportPlatform,
      reportDbSortCol: "date",
      reportDbSortAsc: false,
      currentPage: 1,
      itemsPerPage: 10,
    });
    return result.stats;
  }, [reportingRawData, saveTargetPlatform, activeReportPlatform]);

  const isShopee =
    saveTargetPlatform === "Shopee Live" ||
    activeReportPlatform === "Shopee Live";

  return (
    <div className="mt-4 border-t border-slate-100 pt-6">
      <div className="mb-4 text-left">
        <h3 className="text-sm font-bold text-slate-800">
          Preview Kalkulasi Metrik Utama
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Berikut adalah hasil kalkulasi pembacaan Excel Anda yang akan ditampilkan di Dashboard Utama.
        </p>
      </div>
      <div className="origin-top-left">
        <LiveReportMetricsSection
          stats={stats}
          periodLabel="Data Upload"
          useShopeeLiveLayout={isShopee}
        />
      </div>
    </div>
  );
}
