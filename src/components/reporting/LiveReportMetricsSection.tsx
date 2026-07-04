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
import { ShopeeLiveMetricsGrid } from "./ShopeeLiveMetricsGrid";
import { ReportMetricCard } from "./ReportMetricCard";
import type { LiveReportSummaryStats } from "./liveReportSummaryTypes";

type LiveReportMetricsSectionProps = {
  stats: LiveReportSummaryStats;
  periodLabel: string;
  hideEngagementMetrics?: boolean;
  useShopeeLiveLayout?: boolean;
};

export function LiveReportMetricsSection({
  stats,
  periodLabel,
  hideEngagementMetrics = false,
  useShopeeLiveLayout = false,
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
    totalDbLiveVisits,
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
  const liveMetrics = useShopeeStyle
    ? [
        {
          title: "GMV",
          value: `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalGmvDb)}`,
          current: totalGmvDb,
          previous: pTotalGmvDb,
          periodLabel,
          icon: <DollarSign className="h-5 w-5" />,
          tone: "emerald" as const,
        },
        {
          title: "Items Sold",
          value: new Intl.NumberFormat("id-ID").format(totalItemsSoldDb),
          current: totalItemsSoldDb,
          previous: pTotalItemsSoldDb,
          periodLabel,
          icon: <Package className="h-5 w-5" />,
          tone: "amber" as const,
        },
        {
          title: "Customers",
          value: new Intl.NumberFormat("id-ID").format(totalBuyersDb),
          current: totalBuyersDb,
          previous: pTotalBuyersDb,
          periodLabel,
          icon: <Users className="h-5 w-5" />,
          tone: "violet" as const,
        },
        {
          title: "Orders",
          value: new Intl.NumberFormat("id-ID").format(totalOrdersDb),
          current: totalOrdersDb,
          previous: pTotalOrdersDb,
          periodLabel,
          icon: <ClipboardList className="h-5 w-5" />,
          tone: "indigo" as const,
        },
        {
          title: "GMV/Hours",
          value: `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(gmvPerHour)}`,
          current: gmvPerHour,
          previous: pGmvPerHour,
          periodLabel,
          icon: <Clock className="h-5 w-5" />,
          tone: "blue" as const,
        },
        {
          title: "AOV",
          value: `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(avgAovDb)}`,
          current: avgAovDb,
          previous: pAvgAovDb,
          periodLabel,
          icon: <Calculator className="h-5 w-5" />,
          tone: "green" as const,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {useShopeeStyle ? (
        <>
          <ShopeeLiveMetricsGrid
            metrics={
              isShopee
                ? [
                    {
                      title: "GMV",
                      value: `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalGmvDb)}`,
                      current: totalGmvDb,
                      previous: pTotalGmvDb,
                      periodLabel,
                      icon: <DollarSign className="h-5 w-5" />,
                      tone: "emerald" as const,
                    },
                    {
                      title: "Item Solds",
                      value: new Intl.NumberFormat("id-ID").format(totalItemsSoldDb),
                      current: totalItemsSoldDb,
                      previous: pTotalItemsSoldDb,
                      periodLabel,
                      icon: <Package className="h-5 w-5" />,
                      tone: "amber" as const,
                    },
                    {
                      title: "GMV/Hours",
                      value: `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(gmvPerHour)}`,
                      current: gmvPerHour,
                      previous: pGmvPerHour,
                      periodLabel,
                      icon: <Clock className="h-5 w-5" />,
                      tone: "blue" as const,
                    },
                    {
                      title: "Conversion Rate %",
                      value: `${conversionRateShopee.toFixed(2)}%`,
                      current: conversionRateShopee,
                      previous: pConversionRateShopee,
                      periodLabel,
                      icon: <Percent className="h-5 w-5" />,
                      tone: "indigo" as const,
                    },
                    {
                      title: "Orders",
                      value: new Intl.NumberFormat("id-ID").format(totalOrdersDb),
                      current: totalOrdersDb,
                      previous: pTotalOrdersDb,
                      periodLabel,
                      icon: <ClipboardList className="h-5 w-5" />,
                      tone: "violet" as const,
                    },
                    {
                      title: "Avg. Viewer Duration",
                      value: `${avgViewDurationDb.toFixed(2)}s`,
                      current: avgViewDurationDb,
                      previous: pAvgViewDurationDb,
                      periodLabel,
                      icon: <TrendingUp className="h-5 w-5" />,
                      tone: "rose" as const,
                    },
                    {
                      title: "AOV",
                      value: `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(avgAovDb)}`,
                      current: avgAovDb,
                      previous: pAvgAovDb,
                      periodLabel,
                      icon: <Calculator className="h-5 w-5" />,
                      tone: "green" as const,
                    },
                  ]
                : liveMetrics
            }
          />
          {totalDbImpressions > 0 && (
            <HorizontalFunnel
              title=""
              subtitle=""
              steps={[
                {
                  label: "Viewer",
                  value: new Intl.NumberFormat("id-ID").format(totalDbImpressions),
                  raw: totalDbImpressions,
                },
                {
                  label: "Viewer Enganged",
                  value: new Intl.NumberFormat("id-ID").format(totalDbLiveVisits),
                  raw: totalDbLiveVisits,
                },
                {
                  label: "Add To Card",
                  value: new Intl.NumberFormat("id-ID").format(totalDbClicks),
                  raw: totalDbClicks,
                },
                {
                  label: "Purchase",
                  value: new Intl.NumberFormat("id-ID").format(totalDbOrdersFunnel),
                  raw: totalDbOrdersFunnel,
                },
              ]}
            />
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
            <ReportMetricCard
              label="GMV"
              cur={totalGmvDb}
              prev={pTotalGmvDb}
              prefix="Rp "
              value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalGmvDb)}
            />
            <ReportMetricCard
              label="Item Sold"
              cur={totalItemsSoldDb}
              prev={pTotalItemsSoldDb}
              value={new Intl.NumberFormat("id-ID").format(totalItemsSoldDb)}
            />
            <ReportMetricCard
              label="Customers"
              cur={totalBuyersDb}
              prev={pTotalBuyersDb}
              value={new Intl.NumberFormat("id-ID").format(totalBuyersDb)}
            />
            <ReportMetricCard
              label="SKU Orders"
              cur={totalOrdersDb}
              prev={pTotalOrdersDb}
              value={new Intl.NumberFormat("id-ID").format(totalOrdersDb)}
            />
            <ReportMetricCard
              label="AOV"
              cur={avgAovDb}
              prev={pAvgAovDb}
              prefix="Rp "
              value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(avgAovDb)}
            />
          </div>
          {!hideEngagementMetrics && (
            <div>
              <h4 className="text-sm md:text-base font-black text-slate-900 mb-4 uppercase tracking-widest mt-8">
                Engagement Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
                <ReportMetricCard
                  label="Like"
                  cur={totalLikesDb}
                  prev={pTotalLikesDb}
                  value={new Intl.NumberFormat("id-ID").format(totalLikesDb)}
                />
                <ReportMetricCard
                  label="Comment"
                  cur={totalCommentsDb}
                  prev={pTotalCommentsDb}
                  value={new Intl.NumberFormat("id-ID").format(totalCommentsDb)}
                />
                <ReportMetricCard
                  label="Share"
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
                  label="AVG TIME/VIEWER"
                  cur={avgViewDurationDb}
                  prev={pAvgViewDurationDb}
                  value={Math.round(avgViewDurationDb).toString()}
                  suffix=" detik"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
