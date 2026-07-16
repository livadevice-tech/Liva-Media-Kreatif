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
  isShopee?: boolean;
  hasData?: boolean;
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
  isShopee = false,
  hasData = true,
}: LiveReportSummarySectionProps) {
  const isShopeeStyle = stats.isShopee || useShopeeLiveLayout;

  return (
    <div className="space-y-6 mb-6">
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-300 rounded-[12px] bg-slate-50 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 border border-slate-100">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-slate-800 mb-1">Data Kosong!</h3>
          <p className="text-[13px] text-slate-500 max-w-[280px]">
            Kamu harus upload data terlebih dahulu untuk melihat metrics performa.
          </p>
        </div>
      ) : (
        <>
          {chartData.length > 0 && (
            <LiveReportChartSection
              chartData={chartData}
              chartSelectedMetrics={chartSelectedMetrics}
              onChartSelectedMetricsChange={onChartSelectedMetricsChange}
              useShopeeLiveLayout={isShopeeStyle}
            />
          )}

          <LiveReportMetricsSection
            stats={stats}
            periodLabel={periodLabel}
            hideEngagementMetrics={hideEngagementMetrics}
            useShopeeLiveLayout={useShopeeLiveLayout}
            brandDashboardSettings={brandDashboardSettings}
          />
        </>
      )}
    </div>
  );
}
