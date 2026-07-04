import type { ReportingRawRow } from "../types/reporting";

export interface ReportingUploadSummary {
  recordCount: number;
  totalViewerReach: number;
  totalViews: number;
  totalLiveVisits: number;
  totalProductImpressions: number;
  totalClicks: number;
  totalOrders: number;
  totalBuyerConversions: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowers: number;
  totalShopVouchers: number;
  totalSpecialVouchers: number;
  totalCoinsClaimed: number;
  totalInteractions: number;
  totalGmv: number;
  totalProductsSold: number;
  totalBuyers: number;
  averageAov: number;
  averageViewDuration: number;
  peakViewers: number;
  engagementErrRate: number;
  ctrRate: number;
  cartToClickRate: number;
  checkoutRate: number;
  overallCvr: number;
  clickWidth: number;
  orderWidth: number;
  buyerWidth: number;
}

const sum = (
  rows: readonly ReportingRawRow[],
  selector: (row: ReportingRawRow) => number,
) => rows.reduce((acc, row) => acc + selector(row), 0);

export function buildReportingUploadSummary(
  rows: readonly ReportingRawRow[],
): ReportingUploadSummary {
  const recordCount = rows.length;
  const totalViewerReach = sum(
    rows,
    (row) => row.impressions || row.views || row.liveVisits || row.penonton || 0,
  );
  const totalViews = sum(rows, (row) => row.views || 0);
  const totalLiveVisits = sum(rows, (row) => row.liveVisits || 0);
  const totalProductImpressions = sum(rows, (row) => row.productImpressions || 0);
  const totalClicks = sum(rows, (row) => row.clicks || 0);
  const totalOrders = sum(rows, (row) => row.orders || row.buyers || 0);
  const totalBuyerConversions = sum(rows, (row) => row.buyers || row.orders || 0);
  const totalLikes = sum(rows, (row) => row.likes || 0);
  const totalComments = sum(rows, (row) => row.comments || 0);
  const totalShares = sum(rows, (row) => row.shares || 0);
  const totalFollowers = sum(rows, (row) => row.followers || 0);
  const totalShopVouchers = sum(rows, (row) => row.shopVouchers || 0);
  const totalSpecialVouchers = sum(rows, (row) => row.specialVouchers || 0);
  const totalCoinsClaimed = sum(rows, (row) => row.coinsClaimed || 0);
  const totalInteractions = totalLikes + totalComments + totalShares;
  const totalGmv = sum(rows, (row) => row.gmv || 0);
  const totalProductsSold = sum(rows, (row) => row.products_sold || 0);
  const totalBuyers = sum(rows, (row) => row.buyers || 0);
  const averageAov = totalBuyers > 0 ? totalGmv / totalBuyers : 0;
  const averageViewDuration =
    recordCount > 0
      ? Math.round(sum(rows, (row) => row.avgViewDuration || 0) / recordCount)
      : 0;
  const peakViewers =
    recordCount > 0
      ? Math.round(sum(rows, (row) => row.peakViewers || 0) / recordCount)
      : 0;
  const totalPenonton = sum(
    rows,
    (row) => row.penonton || row.impressions || 0,
  );
  const engagementErrRate =
    totalPenonton > 0
      ? ((totalLikes + totalComments + totalShares + totalFollowers) /
          totalPenonton) *
        100
      : 0;
  const ctrRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  const cartToClickRate =
    totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;
  const checkoutRate =
    totalOrders > 0 ? (totalBuyerConversions / totalOrders) * 100 : 0;
  const overallCvr = totalViews > 0 ? (totalBuyerConversions / totalViews) * 100 : 0;
  const clickWidth = totalViews > 0 ? Math.max((totalClicks / totalViews) * 100, 30) : 75;
  const orderWidth = totalViews > 0 ? Math.max((totalOrders / totalViews) * 100, 15) : 40;
  const buyerWidth =
    totalViews > 0 ? Math.max((totalBuyerConversions / totalViews) * 100, 5) : 15;

  return {
    recordCount,
    totalViewerReach,
    totalViews,
    totalLiveVisits,
    totalProductImpressions,
    totalClicks,
    totalOrders,
    totalBuyerConversions,
    totalLikes,
    totalComments,
    totalShares,
    totalFollowers,
    totalShopVouchers,
    totalSpecialVouchers,
    totalCoinsClaimed,
    totalInteractions,
    totalGmv,
    totalProductsSold,
    totalBuyers,
    averageAov,
    averageViewDuration,
    peakViewers,
    engagementErrRate,
    ctrRate,
    cartToClickRate,
    checkoutRate,
    overallCvr,
    clickWidth,
    orderWidth,
    buyerWidth,
  };
}
