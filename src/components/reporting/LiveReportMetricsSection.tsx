import {
  Calculator,
  Clock,
  ClipboardList,
  DollarSign,
  Package,
  Percent,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
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
  isClientView?: boolean;
};

export function LiveReportMetricsSection({
  stats,
  periodLabel,
  hideEngagementMetrics = false,
  useShopeeLiveLayout = false,
  brandDashboardSettings,
  isClientView = false,
}: LiveReportMetricsSectionProps) {
  const [isDurationVisible, setIsDurationVisible] = useState(true);

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
    pTotalDbProductImpressions,
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

  const formatDurationText = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.round((sec % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  // ── Compact metric card grid (same look as Engagement tab) ─────────────────
  const CompactSaleMetrics = () => (
    <div className="hidden md:block rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
      <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
        <DollarSign className="h-5 w-5 text-[#5600e0]" /> Sale Metrics
        {(!isClientView || !isMetricHidden("duration_hours")) && (
          <div className="flex items-center gap-1 ml-1">
            {isDurationVisible ? (
              <>
                <span className="bg-[#5600e0]/10 text-[#5600e0] px-2.5 py-0.5 rounded-full font-bold tracking-normal text-[11px] lowercase">
                  {formatDurationText(totalDbDuration)}
                </span>
                <button onClick={() => setIsDurationVisible(false)} className="text-[#5600e0] hover:bg-[#5600e0]/10 p-1 rounded-full transition-colors">
                  <EyeOff size={14} />
                </button>
              </>
            ) : (
              <button onClick={() => setIsDurationVisible(true)} className="text-[#5600e0] hover:bg-[#5600e0]/10 p-1 rounded-full transition-colors">
                <Eye size={14} />
              </button>
            )}
          </div>
        )}
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
            cur={totalDbProductImpressions}
            prev={pTotalDbProductImpressions}
            value={new Intl.NumberFormat("id-ID").format(totalDbProductImpressions)}
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
    <div className="hidden md:block rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
      <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
        <DollarSign className="h-5 w-5 text-[#5600e0]" /> Sale Metrics
        {(!isClientView || !isMetricHidden("duration_hours")) && (
          <div className="flex items-center gap-1 ml-1">
          {isDurationVisible ? (
            <>
              <span className="bg-[#5600e0]/10 text-[#5600e0] px-2.5 py-0.5 rounded-full font-bold tracking-normal text-[11px] lowercase">
                {formatDurationText(totalDbDuration)}
              </span>
              <button onClick={() => setIsDurationVisible(false)} className="text-[#5600e0] hover:bg-[#5600e0]/10 p-1 rounded-full transition-colors">
                <EyeOff size={14} />
              </button>
            </>
          ) : (
            <button onClick={() => setIsDurationVisible(true)} className="text-[#5600e0] hover:bg-[#5600e0]/10 p-1 rounded-full transition-colors">
              <Eye size={14} />
            </button>
          )}
        </div>
        )}
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
            cur={totalDbLiveVisits}
            prev={pTotalDbLiveVisits}
            value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalDbLiveVisits)}
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

  const calcPercentChange = (cur: number, prev: number) => {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return ((cur - prev) / prev) * 100;
  };

  const MobileLiveOverviewCard = () => {
    const formatRp = (val: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(val);
    const formatNum = (val: number) => new Intl.NumberFormat("id-ID").format(val);

    const gmvPct = calcPercentChange(totalGmvDb, pTotalGmvDb);
    const itemPct = calcPercentChange(totalItemsSoldDb, pTotalItemsSoldDb);
    const gmvHrPct = calcPercentChange(gmvPerHour, pGmvPerHour);
    const aovPct = calcPercentChange(avgAovDb, pAvgAovDb);

    const PctBadge = ({ pct }: { pct: number }) => (
      <div className={`mt-0 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold w-max ${pct >= 0 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'}`}>
        {pct >= 0 ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
        {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
      </div>
    );

    return (
      <div className="md:hidden w-full rounded-xl bg-[#5600e0] p-5 text-white shadow-lg mb-2">
        <h3 className="font-bold text-[16px] tracking-wide mb-6">Live Overview</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* GMV */}
          <div className="flex flex-col items-start justify-start text-left">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2 border border-white/5">
              <DollarSign size={14} className="text-white/90" />
            </div>
            <span className="text-[10px] text-white/80 font-medium mb-1">GMV</span>
            <span className="text-[13px] sm:text-[14px] font-bold text-white tracking-tight leading-tight w-full truncate mb-2">Rp {formatRp(totalGmvDb)}</span>
            <PctBadge pct={gmvPct} />
          </div>
          
          {/* Item Sold */}
          <div className="flex flex-col items-start justify-start text-left">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2 border border-white/5">
              <Package size={14} className="text-white/90" />
            </div>
            <span className="text-[10px] text-white/80 font-medium mb-1">Item Sold</span>
            <span className="text-[13px] sm:text-[14px] font-bold text-white tracking-tight leading-tight w-full truncate mb-2">{formatNum(totalItemsSoldDb)}</span>
            <PctBadge pct={itemPct} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <MobileLiveOverviewCard />
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
                  value: new Intl.NumberFormat("id-ID").format(stats.totalPenontonDb || 0),
                  raw: stats.totalPenontonDb || 0,
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
