import { LiveReportChartSection } from "./LiveReportChartSection";
import { LiveReportMetricsSection } from "./LiveReportMetricsSection";
import type {
  LiveReportChartData,
  LiveReportSummaryStats,
} from "./liveReportSummaryTypes";

type LiveReportSummarySectionProps = {
  stats: LiveReportSummaryStats;
  chartData: LiveReportChartData;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
  periodLabel: string;
  hideEngagementMetrics?: boolean;
  useShopeeLiveLayout?: boolean;
};

export type { LiveReportSummaryStats } from "./liveReportSummaryTypes";

export function LiveReportSummarySection({
  stats,
  chartData,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
  periodLabel,
  hideEngagementMetrics = false,
  useShopeeLiveLayout = false,
}: LiveReportSummarySectionProps) {
  return (
    <div className="space-y-6 mb-6">
      <LiveReportMetricsSection
        stats={stats}
        periodLabel={periodLabel}
        hideEngagementMetrics={hideEngagementMetrics}
        useShopeeLiveLayout={useShopeeLiveLayout}
      />
      {chartData.length > 0 && (
        <LiveReportChartSection
          chartData={chartData}
          chartSelectedMetrics={chartSelectedMetrics}
          onChartSelectedMetricsChange={onChartSelectedMetricsChange}
        />
      )}
    </div>
  );
}
