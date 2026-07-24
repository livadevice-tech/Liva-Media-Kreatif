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
    totalDbLiveVisits,
    totalDbProductImpressions,
    totalDbClicks,
    totalDbOrdersFunnel,
    pTotalDbImpressions,
    pTotalDbLiveVisits,
    totalDbDuration,
    totalSessionsDb,
    pTotalSessionsDb,
    gmvPerHour,
    pGmvPerHour,
    avgAovDb,
    pAvgAovDb,
    conversionRateShopee,
    pConversionRateShopee,
    totalPeakViewersDb,
    pTotalPeakViewersDb,
    totalShopVouchersDb,
    pTotalShopVouchersDb,
    isShopee,
  } = stats;

  const useShopeeStyle = isShopee || useShopeeLiveLayout;
  const hm = brandDashboardSettings?.hiddenMetrics || [];
  const isMetricHidden = (id: string) => hm.includes(isShopee ? `shopee_live_${id}` : `tiktok_live_${id}`);

  // ── Compact metric card grid (same look as Engagement tab) ─────────────────
  const CompactSaleMetrics = () => (
    <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
      <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
        <DollarSign className="h-5 w-5 text-[#5600e0]" /> Sale Metrics
      </h4>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {!isMetricHidden("gmv") && (
          <ReportMetricCard
            label="GMV"
            cur={totalGmvDb}
            prev={pTotalGmvDb}
            prefix="Rp"
            value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalGmvDb)}
            icon={<DollarSign size={16} />}
          />
        )}
        {!isMetricHidden("items_sold") && (
          <ReportMetricCard
            label="Item Sold"
            cur={totalItemsSoldDb}
            prev={pTotalItemsSoldDb}
            value={new Intl.NumberFormat("id-ID").format(totalItemsSoldDb)}
            icon={<Package size={16} />}
          />
        )}
        {!isMetricHidden("orders") && (
          <ReportMetricCard
            label="Orders"
            cur={totalOrdersDb}
            prev={pTotalOrdersDb}
            value={new Intl.NumberFormat("id-ID").format(totalOrdersDb)}
            icon={<ClipboardList size={16} />}
          />
        )}
        {!isMetricHidden("aov") && (
          <ReportMetricCard
            label="AOV"
            cur={avgAovDb}
            prev={pAvgAovDb}
            prefix="Rp"
            value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(avgAovDb)}
            icon={<Calculator size={16} />}
          />
        )}
        {!isMetricHidden("viewers") && (
          <ReportMetricCard
            label="Customer"
            cur={totalBuyersDb}
            prev={pTotalBuyersDb}
            value={new Intl.NumberFormat("id-ID").format(totalBuyersDb)}
            icon={<Users size={16} />}
          />
        )}
        {!isMetricHidden("product_impressions") && (
          <ReportMetricCard
            label="Product Impressions"
            cur={stats.totalProductImpressions || 0}
            prev={stats.pTotalProductImpressions || 0}
            value={new Intl.NumberFormat("id-ID").format(stats.totalProductImpressions || 0)}
          />
        )}
        {!isMetricHidden("product_clicks") && (
          <ReportMetricCard
            label="Product clicks"
            cur={totalClicksDb}
            prev={pTotalClicksDb}
            value={new Intl.NumberFormat("id-ID").format(totalClicksDb)}
          />
        )}
        {!isMetricHidden("est_income") && (
          <ReportMetricCard
            label="GMV/Hours"
            cur={gmvPerHour}
            prev={pGmvPerHour}
            prefix="Rp"
            value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(gmvPerHour)}
            icon={<Clock size={16} />}
          />
        )}
      </div>
    </div>
  );

  const CompactSaleMetricsShopee = () => (
    <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
      <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
        <DollarSign className="h-5 w-5 text-[#5600e0]" /> Sale Metrics
      </h4>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {!isMetricHidden("gmv") && (
          <ReportMetricCard
            label="GMV"
            cur={totalGmvDb}
            prev={pTotalGmvDb}
            prefix="Rp"
            value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalGmvDb)}
            icon={<DollarSign size={16} />}
          />
        )}
        {!isMetricHidden("items_sold") && (
          <ReportMetricCard
            label="Item Sold"
            cur={totalItemsSoldDb}
            prev={pTotalItemsSoldDb}
            value={new Intl.NumberFormat("id-ID").format(totalItemsSoldDb)}
            icon={<Package size={16} />}
          />
        )}
        {!isMetricHidden("orders") && (
          <ReportMetricCard
            label="Orders"
            cur={totalOrdersDb}
            prev={pTotalOrdersDb}
            value={new Intl.NumberFormat("id-ID").format(totalOrdersDb)}
            icon={<ClipboardList size={16} />}
          />
        )}
        {!isMetricHidden("aov") && (
          <ReportMetricCard
            label="AOV"
            cur={avgAovDb}
            prev={pAvgAovDb}
            prefix="Rp"
            value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(avgAovDb)}
            icon={<Calculator size={16} />}
          />
        )}
        {!isMetricHidden("product_clicks") && (
          <ReportMetricCard
            label="Add to Cart"
            cur={totalClicksDb}
            prev={pTotalClicksDb}
            value={new Intl.NumberFormat("id-ID").format(totalClicksDb)}
          />
        )}
        {!isMetricHidden("avg_view_duration") && (
          <ReportMetricCard
            label="Avg. View Duration"
            cur={avgViewDurationDb}
            prev={pAvgViewDurationDb}
            value={`${avgViewDurationDb.toFixed(1)}s`}
            icon={<TrendingUp size={16} />}
          />
        )}
        {!isMetricHidden("live_viewer") && (
          <ReportMetricCard
            label="Viewer Active"
            cur={totalSessionsDb > 0 ? totalDbLiveVisits / totalSessionsDb : 0}
            prev={pTotalSessionsDb > 0 ? pTotalDbLiveVisits / pTotalSessionsDb : 0}
            value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalSessionsDb > 0 ? totalDbLiveVisits / totalSessionsDb : 0)}
            icon={<Users size={16} />}
          />
        )}
        {!isMetricHidden("est_income") && (
          <ReportMetricCard
            label="GMV/Hours"
            cur={gmvPerHour}
            prev={pGmvPerHour}
            prefix="Rp"
            value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(gmvPerHour)}
            icon={<Clock size={16} />}
          />
        )}
      </div>
    </div>
  );

  const EngagementMetricsBlock = () => {
    if (hideEngagementMetrics || isMetricHidden("engagement")) return null;
    const errCur = totalDbImpressions > 0 ? ((totalLikesDb + totalCommentsDb + totalSharesDb) / totalDbImpressions) * 100 : 0;
    const pErrCur = pTotalDbImpressions > 0 ? ((pTotalLikesDb + pTotalCommentsDb + pTotalSharesDb) / pTotalDbImpressions) * 100 : 0;

    return (
      <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6 mt-6">
        <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
          <Users className="h-5 w-5 text-[#5600e0]" /> Engagement Metrics
        </h4>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {!isMetricHidden("impressions") && (
            <ReportMetricCard
              label="Live Impressions"
              cur={totalDbImpressions}
              prev={pTotalDbImpressions}
              value={new Intl.NumberFormat("id-ID").format(totalDbImpressions)}
            />
          )}
          {!isMetricHidden("live_viewer") && (
            <ReportMetricCard
              label="Viewer"
              cur={stats.totalPenontonDb || 0}
              prev={stats.pTotalPenontonDb || 0}
              value={new Intl.NumberFormat("id-ID").format(stats.totalPenontonDb || 0)}
            />
          )}
          {!isMetricHidden("likes") && (
            <ReportMetricCard
              label="Likes"
              cur={totalLikesDb}
              prev={pTotalLikesDb}
              value={new Intl.NumberFormat("id-ID").format(totalLikesDb)}
            />
          )}
          {!isMetricHidden("comments") && (
            <ReportMetricCard
              label="Comments"
              cur={totalCommentsDb}
              prev={pTotalCommentsDb}
              value={new Intl.NumberFormat("id-ID").format(totalCommentsDb)}
            />
          )}
          {!isMetricHidden("shares") && (
            <ReportMetricCard
              label="Shares"
              cur={totalSharesDb}
              prev={pTotalSharesDb}
              value={new Intl.NumberFormat("id-ID").format(totalSharesDb)}
            />
          )}
          {!isMetricHidden("new_followers") && (
            <ReportMetricCard
              label="New followers"
              cur={stats.totalFollowersDb || 0}
              prev={stats.pTotalFollowersDb || 0}
              value={new Intl.NumberFormat("id-ID").format(stats.totalFollowersDb || 0)}
            />
          )}
          {!isMetricHidden("avg_view_duration") && (
            <ReportMetricCard
              label="Avg. View Duration"
              cur={avgViewDurationDb}
              prev={pAvgViewDurationDb}
              value={`${avgViewDurationDb.toFixed(1)}s`}
            />
          )}
          {!isMetricHidden("err") && (
            <ReportMetricCard
              label="ERR %"
              cur={errCur}
              prev={pErrCur}
              value={`${errCur.toFixed(2)}%`}
            />
          )}
        </div>
      </div>
    );
  };

  const EngagementMetricsBlockShopee = () => {
    if (hideEngagementMetrics || isMetricHidden("engagement")) return null;
    
    const errCur = totalDbImpressions > 0 ? ((totalLikesDb + totalCommentsDb + totalSharesDb) / totalDbImpressions) * 100 : 0;
    const pErrCur = pTotalDbImpressions > 0 ? ((pTotalLikesDb + pTotalCommentsDb + pTotalSharesDb) / pTotalDbImpressions) * 100 : 0;

    return (
      <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6 mt-6">
        <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
          <Users className="h-5 w-5 text-[#5600e0]" /> Engagement & Customer Metrics
        </h4>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {!isMetricHidden("impressions") && (
            <ReportMetricCard
              label="Viewer"
              cur={totalDbImpressions}
              prev={pTotalDbImpressions}
              value={new Intl.NumberFormat("id-ID").format(totalDbImpressions)}
            />
          )}
          {!isMetricHidden("peak_viewers") && (
            <ReportMetricCard
              label="Peak Viewer"
              cur={totalPeakViewersDb}
              prev={pTotalPeakViewersDb}
              value={new Intl.NumberFormat("id-ID").format(totalPeakViewersDb)}
            />
          )}
          {!isMetricHidden("shop_vouchers") && (
            <ReportMetricCard
              label="Voucher Claim"
              cur={totalShopVouchersDb}
              prev={pTotalShopVouchersDb}
              value={new Intl.NumberFormat("id-ID").format(totalShopVouchersDb)}
            />
          )}
          {!isMetricHidden("viewers") && (
            <ReportMetricCard
              label="Customer"
              cur={totalBuyersDb}
              prev={pTotalBuyersDb}
              value={new Intl.NumberFormat("id-ID").format(totalBuyersDb)}
            />
          )}
          {!isMetricHidden("likes") && (
            <ReportMetricCard
              label="Likes"
              cur={totalLikesDb}
              prev={pTotalLikesDb}
              value={new Intl.NumberFormat("id-ID").format(totalLikesDb)}
            />
          )}
          {!isMetricHidden("comments") && (
            <ReportMetricCard
              label="Comments"
              cur={totalCommentsDb}
              prev={pTotalCommentsDb}
              value={new Intl.NumberFormat("id-ID").format(totalCommentsDb)}
            />
          )}
          {!isMetricHidden("shares") && (
            <ReportMetricCard
              label="Shares"
              cur={totalSharesDb}
              prev={pTotalSharesDb}
              value={new Intl.NumberFormat("id-ID").format(totalSharesDb)}
            />
          )}
          {!isMetricHidden("err") && (
            <ReportMetricCard
              label="ERR %"
              cur={errCur}
              prev={pErrCur}
              value={`${errCur.toFixed(2)}%`}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {useShopeeStyle ? (
        <>
          {/* Shopee Live: Sale Metrics compact grid */}
          <CompactSaleMetricsShopee />

          {/* Funnel visualization */}
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
                  label: "Viewer Active",
                  value: new Intl.NumberFormat("id-ID").format(totalDbLiveVisits),
                  raw: totalDbLiveVisits,
                },
                {
                  label: "Add To Cart",
                  value: new Intl.NumberFormat("id-ID").format(totalDbClicks),
                  raw: totalDbClicks,
                },
                {
                  label: "Purchase",
                  value: new Intl.NumberFormat("id-ID").format(totalDbOrdersFunnel),
                  raw: totalDbOrdersFunnel,
                },
                {
                  label: "Convertion Rate",
                  value:
                    totalDbClicks > 0
                      ? `${((totalDbOrdersFunnel / totalDbClicks) * 100).toFixed(2)}%`
                      : totalDbLiveVisits > 0
                        ? `${((totalDbOrdersFunnel / totalDbLiveVisits) * 100).toFixed(2)}%`
                        : totalDbImpressions > 0
                        ? `${((totalDbOrdersFunnel / totalDbImpressions) * 100).toFixed(2)}%`
                        : "0.00%",
                  raw:
                    totalDbClicks > 0
                      ? (totalDbOrdersFunnel / totalDbClicks) * 100
                      : totalDbLiveVisits > 0
                        ? (totalDbOrdersFunnel / totalDbLiveVisits) * 100
                        : totalDbImpressions > 0
                        ? (totalDbOrdersFunnel / totalDbImpressions) * 100
                        : 0,
                },
              ]}
            />
          )}

          <EngagementMetricsBlockShopee />
        </>
      ) : (
        <>
          {/* TikTok / non-Shopee: compact grid, same style */}
          <CompactSaleMetrics />

          {/* Funnel visualization */}
          {totalDbImpressions > 0 && (
            <HorizontalFunnel
              title=""
              subtitle=""
              steps={[
                {
                  label: "Live Impression",
                  value: new Intl.NumberFormat("id-ID").format(totalDbImpressions),
                  raw: totalDbImpressions,
                },
                {
                  label: "Live Viewer",
                  value: new Intl.NumberFormat("id-ID").format(totalDbLiveVisits),
                  raw: totalDbLiveVisits,
                },
                {
                  label: "Product Impression",
                  value: new Intl.NumberFormat("id-ID").format(totalDbProductImpressions),
                  raw: totalDbProductImpressions,
                },
                {
                  label: "Product Clicks",
                  value: new Intl.NumberFormat("id-ID").format(totalDbClicks),
                  raw: totalDbClicks,
                },
                {
                  label: "Orders",
                  value: new Intl.NumberFormat("id-ID").format(totalDbOrdersFunnel),
                  raw: totalDbOrdersFunnel,
                },
                {
                  label: "Convertion Rate",
                  value:
                    totalDbClicks > 0
                      ? `${((totalDbOrdersFunnel / totalDbClicks) * 100).toFixed(2)}%`
                      : totalDbProductImpressions > 0
                        ? `${((totalDbOrdersFunnel / totalDbProductImpressions) * 100).toFixed(2)}%`
                        : totalDbImpressions > 0
                        ? `${((totalDbOrdersFunnel / totalDbImpressions) * 100).toFixed(2)}%`
                        : "0.00%",
                  raw:
                    totalDbClicks > 0
                      ? (totalDbOrdersFunnel / totalDbClicks) * 100
                      : totalDbProductImpressions > 0
                        ? (totalDbOrdersFunnel / totalDbProductImpressions) * 100
                        : totalDbImpressions > 0
                        ? (totalDbOrdersFunnel / totalDbImpressions) * 100
                        : 0,
                },
              ]}
            />
          )}

          <EngagementMetricsBlock />
        </>
      )}
    </div>
  );
}
