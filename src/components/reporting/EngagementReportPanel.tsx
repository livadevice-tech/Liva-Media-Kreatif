import { ReportPeriodNavigator } from "./ReportPeriodNavigator";
import { ReportEngagementUploadHistory } from "./ReportEngagementUploadHistory";
import type { BrandPerformanceLogEntry, UploadHistoryEntry } from "../../shared/types/reporting";
import type { EngagementReportViewModel } from "../../shared/utils/engagementReporting";
import { EngagementReportMetricsSection } from "./EngagementReportMetricsSection";
import { EngagementReportChartSection } from "./EngagementReportChartSection";

interface EngagementReportPanelProps {
  model: EngagementReportViewModel;
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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
          Tab Engagement
        </p>
        <h3 className="mt-1 text-lg font-black text-slate-900">
          Ringkasan interaksi dan promosi
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Tab ini dipakai untuk membaca tren interaksi harian dan metrik
          promosi dari raw data yang sudah masuk. Struktur awalnya dibuat agar
          langsung memberi konteks sebelum chart dan metrik dibaca.
        </p>
      </div>

      <ReportPeriodNavigator
        title="Performance Engagement"
        label={model.engagementPeriodLabel}
        onPrev={onPrev}
        onNext={onNext}
      />

      <EngagementReportMetricsSection model={model} />
      <EngagementReportChartSection
        model={model}
        chartSelectedMetrics={chartSelectedMetrics}
        onChartSelectedMetricsChange={onChartSelectedMetricsChange}
      />

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="text-xs text-slate-400 font-semibold italic text-center">
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
