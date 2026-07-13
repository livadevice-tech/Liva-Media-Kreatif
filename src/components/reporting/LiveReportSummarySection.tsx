import { LiveReportChartSection } from "./LiveReportChartSection";
import { LiveReportMetricsSection } from "./LiveReportMetricsSection";
import type {
  LiveReportChartData,
  LiveReportSummaryStats,
} from "./liveReportSummaryTypes";
import type { BrandDashboardSettings } from "../../types";

type LiveReportSummarySectionProps = {
  stats: LiveReportSummaryStats;
  chartData: LiveReportChartData;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
  periodLabel: string;
  hideEngagementMetrics?: boolean;
  useShopeeLiveLayout?: boolean;
  brandDashboardSettings?: BrandDashboardSettings;
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
  brandDashboardSettings,
}: LiveReportSummarySectionProps) {
  const isShopeeStyle = stats.isShopee || useShopeeLiveLayout;

  return (
    <div className="space-y-6 mb-6">
      {isShopeeStyle && chartData.length > 0 && (
        <LiveReportChartSection
          chartData={chartData}
          chartSelectedMetrics={chartSelectedMetrics}
          onChartSelectedMetricsChange={onChartSelectedMetricsChange}
        />
      )}

      <LiveReportMetricsSection
        stats={stats}
        periodLabel={periodLabel}
        hideEngagementMetrics={hideEngagementMetrics}
        useShopeeLiveLayout={useShopeeLiveLayout}
        brandDashboardSettings={brandDashboardSettings}
      />

      {!isShopeeStyle && chartData.length > 0 && (
        <LiveReportChartSection
          chartData={chartData}
          chartSelectedMetrics={chartSelectedMetrics}
          onChartSelectedMetricsChange={onChartSelectedMetricsChange}
        />
      )}
    </div>
  );
}
