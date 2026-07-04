import { ReportEngagementUploadHistory } from "./ReportEngagementUploadHistory";
import type { BrandPerformanceLogEntry, UploadHistoryEntry } from "../../shared/types/reporting";
import type { EngagementReportViewModel } from "../../shared/utils/engagementReporting";
import { EngagementReportMetricsSection } from "./EngagementReportMetricsSection";
import { EngagementReportChartSection } from "./EngagementReportChartSection";

interface EngagementReportPanelProps {
  model: EngagementReportViewModel;
  platform: string;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
  activeReportBrandId: string;
  brandPerformanceLogs: BrandPerformanceLogEntry[];
  brandUploadHistory: UploadHistoryEntry[];
  uploadHistory: UploadHistoryEntry[];
  isLogsLoading: boolean;
  onDeleteUploadBatch: (
    id: string,
    fileName: string,
    rowCount: number,
  ) => void;
}

export function EngagementReportPanel({
  model,
  platform,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
  activeReportBrandId,
  brandPerformanceLogs,
  brandUploadHistory,
  uploadHistory,
  isLogsLoading,
  onDeleteUploadBatch,
}: EngagementReportPanelProps) {
  return (
    <div className="space-y-6 px-6 pb-8 sm:px-8 animate-fadeIn">
      <EngagementReportMetricsSection model={model} platform={platform} />
      <EngagementReportChartSection
        model={model}
        chartSelectedMetrics={chartSelectedMetrics}
        onChartSelectedMetricsChange={onChartSelectedMetricsChange}
      />

      <ReportEngagementUploadHistory
        activeReportBrandId={activeReportBrandId}
        brandPerformanceLogs={brandPerformanceLogs}
        brandUploadHistory={brandUploadHistory}
        uploadHistory={uploadHistory}
        isLogsLoading={isLogsLoading}
        onDeleteUploadBatch={onDeleteUploadBatch}
      />
    </div>
  );
}
