import {
  Calculator,
  Clock,
  ClipboardList,
  DollarSign,
  Package,
  Percent,
  Users,
  TrendingUp,
} from "lucide-react";
import { HorizontalFunnel } from "../branding/BrandGraphics";
import { ReportMetricCard } from "./ReportMetricCard";
import type { LiveReportSummaryStats } from "./liveReportSummaryTypes";
import type { BrandDashboardSettings } from "../../types";

type LiveReportMetricsSectionProps = {
  stats: LiveReportSummaryStats;
  periodLabel: string;
  hideEngagementMetrics?: boolean;
  useShopeeLiveLayout?: boolean;
  brandDashboardSettings?: BrandDashboardSettings;
};

export function LiveReportMetricsSection({
  stats,
  periodLabel,
  hideEngagementMetrics = false,
  useShopeeLiveLayout = false,
  brandDashboardSettings,
}: LiveReportMetricsSectionProps) {
  const {
    totalGmvDb,
    totalBuyersDb,
    totalOrdersDb,
    totalItemsSoldDb,
    totalLikesDb,
    totalCommentsDb,
    totalSharesDb,
    totalClicksDb,
    avgViewDurationDb,
    pTotalGmvDb,
    pTotalBuyersDb,
    pTotalOrdersDb,
    pTotalItemsSoldDb,
    pTotalLikesDb,
    pTotalCommentsDb,
    pTotalSharesDb,
    pTotalClicksDb,
    pAvgViewDurationDb,
    totalDbImpressions,
    totalDbClicks,
    totalDbOrdersFunnel,
    gmvPerHour,
    pGmvPerHour,
    avgAovDb,
    pAvgAovDb,
    conversionRateShopee,
    pConversionRateShopee,
    isShopee,
  } = stats;

  const useShopeeStyle = isShopee || useShopeeLiveLayout;
  const hm = brandDashboardSettings?.hiddenMetrics || [];

  // ── Compact metric card grid (same look as Engagement tab) ─────────────────
  const CompactSaleMetrics = () => (
    <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
      <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
        <DollarSign className="h-5 w-5 text-[#5600e0]" /> Sale Metrics
      </h4>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {!hm.includes("gmv") && (
          <ReportMetricCard
            label="GMV"
            cur={totalGmvDb}
            prev={pTotalGmvDb}
            prefix="Rp"
            value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalGmvDb)}
            icon={<DollarSign size={16} />}
          />
        )}
        {!hm.includes("items_sold") && (
          <ReportMetricCard
            label="Item Sold"
            cur={totalItemsSoldDb}
            prev={pTotalItemsSoldDb}
            value={new Intl.NumberFormat("id-ID").format(totalItemsSoldDb)}
            icon={<Package size={16} />}
          />
        )}
        {!hm.includes("viewers") && (
          <ReportMetricCard
            label="Customers"
            cur={totalBuyersDb}
            prev={pTotalBuyersDb}
            value={new Intl.NumberFormat("id-ID").format(totalBuyersDb)}
            icon={<Users size={16} />}
          />
        )}
        {!hm.includes("orders") && (
          <ReportMetricCard
            label="Orders"
            cur={totalOrdersDb}
            prev={pTotalOrdersDb}
            value={new Intl.NumberFormat("id-ID").format(totalOrdersDb)}
            icon={<ClipboardList size={16} />}
          />
        )}
        {!hm.includes("est_income") && (
          <ReportMetricCard
            label="GMV/Hours"
            cur={gmvPerHour}
            prev={pGmvPerHour}
            prefix="Rp"
            value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(gmvPerHour)}
            icon={<Clock size={16} />}
          />
        )}
        <ReportMetricCard
          label="Conversion %"
          cur={conversionRateShopee}
          prev={pConversionRateShopee}
          value={`${conversionRateShopee.toFixed(2)}%`}
          icon={<Percent size={16} />}
        />
        <ReportMetricCard
          label="AOV"
          cur={avgAovDb}
          prev={pAvgAovDb}
          prefix="Rp"
          value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(avgAovDb)}
          icon={<Calculator size={16} />}
        />
        <ReportMetricCard
          label="Avg. View Duration"
          cur={avgViewDurationDb}
          prev={pAvgViewDurationDb}
          value={`${avgViewDurationDb.toFixed(1)}s`}
          icon={<TrendingUp size={16} />}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {useShopeeStyle ? (
        <>
          {/* Shopee Live: Sale Metrics compact grid */}
          <CompactSaleMetrics />

          {/* Funnel visualization */}
          {totalDbImpressions > 0 && (
            <HorizontalFunnel
              title=""
              subtitle=""
              steps={[
                {
                  label: "Views",
                  value: new Intl.NumberFormat("id-ID").format(totalDbImpressions),
                  raw: totalDbImpressions,
                },
                {
                  label: "Product clicks",
                  value: new Intl.NumberFormat("id-ID").format(totalDbClicks),
                  raw: totalDbClicks,
                },
                {
                  label: "Attributed orders",
                  value: new Intl.NumberFormat("id-ID").format(totalDbOrdersFunnel),
                  raw: totalDbOrdersFunnel,
                },
                {
                  label: "Convertion Rate",
                  value:
                    totalDbClicks > 0
                      ? `${((totalDbOrdersFunnel / totalDbClicks) * 100).toFixed(2)}%`
                      : totalDbImpressions > 0
                        ? `${((totalDbOrdersFunnel / totalDbImpressions) * 100).toFixed(4)}%`
                        : "0.00%",
                  raw:
                    totalDbClicks > 0
                      ? (totalDbOrdersFunnel / totalDbClicks) * 100
                      : totalDbImpressions > 0
                        ? (totalDbOrdersFunnel / totalDbImpressions) * 100
                        : 0,
                },
              ]}
            />
          )}
        </>
      ) : (
        <>
          {/* TikTok / non-Shopee: compact grid, same style */}
          <CompactSaleMetrics />

          {!hideEngagementMetrics && !hm.includes("engagement") && (
            <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
              <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
                <Users className="h-5 w-5 text-[#5600e0]" /> Engagement Metrics
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
                <ReportMetricCard
                  label="Likes"
                  cur={totalLikesDb}
                  prev={pTotalLikesDb}
                  value={new Intl.NumberFormat("id-ID").format(totalLikesDb)}
                />
                <ReportMetricCard
                  label="Comments"
                  cur={totalCommentsDb}
                  prev={pTotalCommentsDb}
                  value={new Intl.NumberFormat("id-ID").format(totalCommentsDb)}
                />
                <ReportMetricCard
                  label="Shares"
                  cur={totalSharesDb}
                  prev={pTotalSharesDb}
                  value={new Intl.NumberFormat("id-ID").format(totalSharesDb)}
                />
                <ReportMetricCard
                  label="Product Clicks"
                  cur={totalClicksDb}
                  prev={pTotalClicksDb}
                  value={new Intl.NumberFormat("id-ID").format(totalClicksDb)}
                />
                <ReportMetricCard
                  label="Avg. View Duration"
                  cur={avgViewDurationDb}
                  prev={pAvgViewDurationDb}
                  value={`${Math.round(avgViewDurationDb)} detik`}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
