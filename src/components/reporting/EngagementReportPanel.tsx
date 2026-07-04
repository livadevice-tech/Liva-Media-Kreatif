import { ReportPeriodNavigator } from "./ReportPeriodNavigator";
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
  onPrev: () => void;
  onNext: () => void;
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
  onPrev,
  onNext,
  activeReportBrandId,
  brandPerformanceLogs,
  brandUploadHistory,
  uploadHistory,
  isLogsLoading,
  onDeleteUploadBatch,
}: EngagementReportPanelProps) {
  return (
    <div className="space-y-6 px-6 pb-8 sm:px-8 animate-fadeIn">
      <ReportPeriodNavigator
        title="Performance Engagement"
        label={model.engagementPeriodLabel}
        onPrev={onPrev}
        onNext={onNext}
      />

      <EngagementReportMetricsSection model={model} platform={platform} />
      <EngagementReportChartSection
        model={model}
        chartSelectedMetrics={chartSelectedMetrics}
        onChartSelectedMetricsChange={onChartSelectedMetricsChange}
      />

      <div className="rounded-[18px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)]">
        <div className="text-center text-xs font-semibold italic text-slate-400">
          Menampilkan metrik agregat Engagement dan Promosi dari file Raw Data
          yang diunggah. Filter periode dan platform yang sama seperti di tab
          Live/Product berlaku di data ini.
        </div>
      </div>

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
