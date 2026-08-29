import React from "react";
import {
  DollarSign,
  Package,
  ClipboardList,
  Calculator,
  ShoppingCart,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  Eye,
  Activity,
  Ticket,
  UserCheck,
} from "lucide-react";
import type { LiveReportSummaryStats } from "./liveReportSummaryTypes";

interface MobileLiveMetricsPanelProps {
  stats: LiveReportSummaryStats;
  isShopee: boolean;
}

const formatNumber = (num: number, prefix: string = "") => {
  return `${prefix}${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num)}`;
};

const formatDurationText = (sec: number) => {
  const hours = Math.floor(sec / 3600);
  const mins = Math.round((sec % 3600) / 60);
  return `${hours}h ${mins}m`;
};

const formatPercentage = (cur: number, prev: number) => {
  if (prev === 0) return { text: "+100.0%", isPositive: true };
  const change = ((cur - prev) / prev) * 100;
  const isPositive = change >= 0;
  return {
    text: `${isPositive ? "+" : ""}${change.toFixed(1)}%`,
    isPositive,
  };
};

export function MobileLiveMetricsPanel({ stats, isShopee }: MobileLiveMetricsPanelProps) {
  const {
    totalGmvDb,
    pTotalGmvDb,
    totalItemsSoldDb,
    pTotalItemsSoldDb,
    totalOrdersDb,
    pTotalOrdersDb,
    avgAovDb,
    pAvgAovDb,
    totalDbClicks,
    pTotalDbClicks,
    avgViewDurationDb,
    pAvgViewDurationDb,
    totalDbLiveVisits,
    pTotalDbLiveVisits,
    gmvPerHour,
    pGmvPerHour,
    totalDbDuration,
    totalLikesDb,
    pTotalLikesDb,
    totalCommentsDb,
    pTotalCommentsDb,
    totalSharesDb,
    pTotalSharesDb,
    totalFollowersDb,
    pTotalFollowersDb,
    totalDbImpressions,
    pTotalDbImpressions,
    totalPenontonDb,
    pTotalPenontonDb,
    totalPeakViewersDb,
    pTotalPeakViewersDb,
    totalShopVouchersDb,
    pTotalShopVouchersDb,
    totalBuyersDb,
    pTotalBuyersDb,
  } = stats;

  const errCur = totalDbImpressions > 0 ? ((totalLikesDb + totalCommentsDb + totalSharesDb) / totalDbImpressions) * 100 : 0;
  const pErrCur = pTotalDbImpressions > 0 ? ((pTotalLikesDb + pTotalCommentsDb + pTotalSharesDb) / pTotalDbImpressions) * 100 : 0;

  const metrics = [
    {
      label: "GMV",
      icon: <DollarSign className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalGmvDb, "Rp"),
      cur: totalGmvDb,
      prev: pTotalGmvDb,
    },
    {
      label: "Item Sold",
      icon: <Package className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalItemsSoldDb),
      cur: totalItemsSoldDb,
      prev: pTotalItemsSoldDb,
    },
    {
      label: "Orders",
      icon: <ClipboardList className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalOrdersDb),
      cur: totalOrdersDb,
      prev: pTotalOrdersDb,
    },
    {
      label: "AOV",
      icon: <Calculator className="w-3 h-3 text-slate-500" />,
      value: formatNumber(avgAovDb, "Rp"),
      cur: avgAovDb,
      prev: pAvgAovDb,
    },
    {
      label: "Add to Cart",
      icon: <ShoppingCart className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalDbClicks),
      cur: totalDbClicks,
      prev: pTotalDbClicks,
    },
    {
      label: "Avg. View Duration",
      icon: <TrendingUp className="w-3 h-3 text-slate-500" />,
      value: `${avgViewDurationDb.toFixed(1)}s`,
      cur: avgViewDurationDb,
      prev: pAvgViewDurationDb,
    },
    {
      label: "Viewer Active",
      icon: <Users className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalDbLiveVisits),
      cur: totalDbLiveVisits,
      prev: pTotalDbLiveVisits,
    },
    {
      label: "GMV/Hours",
      icon: <Clock className="w-3 h-3 text-slate-500" />,
      value: formatNumber(gmvPerHour, "Rp"),
      cur: gmvPerHour,
      prev: pGmvPerHour,
    },
  ];

  const engagementMetricsDefault = [
    {
      label: "Likes",
      icon: <Heart className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalLikesDb),
      cur: totalLikesDb,
      prev: pTotalLikesDb,
    },
    {
      label: "Comments",
      icon: <MessageCircle className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalCommentsDb),
      cur: totalCommentsDb,
      prev: pTotalCommentsDb,
    },
    {
      label: "Shares",
      icon: <Share2 className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalSharesDb),
      cur: totalSharesDb,
      prev: pTotalSharesDb,
    },
    {
      label: "Followers",
      icon: <UserPlus className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalFollowersDb),
      cur: totalFollowersDb,
      prev: pTotalFollowersDb,
    },
  ];

  const engagementMetricsShopee = [
    {
      label: "Viewer",
      icon: <Users className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalPenontonDb),
      cur: totalPenontonDb,
      prev: pTotalPenontonDb,
    },
    {
      label: "Peak Viewer",
      icon: <TrendingUp className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalPeakViewersDb),
      cur: totalPeakViewersDb,
      prev: pTotalPeakViewersDb,
    },
    {
      label: "Voucher Claim",
      icon: <Ticket className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalShopVouchersDb),
      cur: totalShopVouchersDb,
      prev: pTotalShopVouchersDb,
    },
    {
      label: "Customer",
      icon: <UserCheck className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalBuyersDb),
      cur: totalBuyersDb,
      prev: pTotalBuyersDb,
    },
    {
      label: "Likes",
      icon: <Heart className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalLikesDb),
      cur: totalLikesDb,
      prev: pTotalLikesDb,
    },
    {
      label: "Comment",
      icon: <MessageCircle className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalCommentsDb),
      cur: totalCommentsDb,
      prev: pTotalCommentsDb,
    },
    {
      label: "Shares",
      icon: <Share2 className="w-3 h-3 text-slate-500" />,
      value: formatNumber(totalSharesDb),
      cur: totalSharesDb,
      prev: pTotalSharesDb,
    },
    {
      label: "ERR",
      icon: <Activity className="w-3 h-3 text-slate-500" />,
      value: `${errCur.toFixed(2)}%`,
      cur: errCur,
      prev: pErrCur,
    },
  ];

  const activeEngagementMetrics = isShopee ? engagementMetricsShopee : engagementMetricsDefault;

  return (
    <div className="md:hidden px-4 pb-6 space-y-4 animate-fadeIn">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">Sale Metrics</h3>
          <div className="flex items-center gap-1 bg-[#5600e0]/10 text-[#5600e0] px-2 py-0.5 rounded-full text-[10px] font-semibold">
            <Clock className="w-3 h-3" />
            <span>{formatDurationText(totalDbDuration)}</span>
          </div>
        </div>
        <button className="flex items-center text-[10px] font-semibold text-[#5600e0]">
          Lihat Semua
          <ChevronRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>

      {/* Grid of metrics */}
      <div className="grid grid-cols-4 gap-2">
        {metrics.map((metric, idx) => {
          const { text: changeText, isPositive } = formatPercentage(metric.cur, metric.prev);
          return (
            <div
              key={idx}
              className="bg-white rounded-[10px] border border-slate-100 p-2 shadow-sm flex flex-col justify-between"
            >
              <div className="flex flex-col gap-1 mb-2">
                {metric.icon}
                <span className="text-[9px] font-medium text-slate-500 leading-tight">
                  {metric.label}
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 mb-1">
                  {metric.value}
                </div>
                <div
                  className={`inline-flex items-center px-1 py-0.5 rounded border ${
                    isPositive
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                      : "bg-red-50 border-red-100 text-red-600"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                  )}
                  <span className="text-[8px] font-bold">{changeText}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Engagement Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Engagement Metrics</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {activeEngagementMetrics.map((metric, idx) => {
            const { text: changeText, isPositive } = formatPercentage(metric.cur, metric.prev);
            return (
              <div
                key={idx}
                className="bg-white rounded-[10px] border border-slate-100 p-2 shadow-sm flex flex-col justify-between"
              >
                <div className="flex flex-col gap-1 mb-2">
                  {metric.icon}
                  <span className="text-[9px] font-medium text-slate-500 leading-tight">
                    {metric.label}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 mb-1">
                    {metric.value}
                  </div>
                  <div
                    className={`inline-flex items-center px-1 py-0.5 rounded border ${
                      isPositive
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-red-50 border-red-100 text-red-600"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                    )}
                    <span className="text-[8px] font-bold">{changeText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
