import type { LiveReportViewModel } from "../../shared/utils/liveReporting";

export type LiveReportSummaryStats = {
  totalSessionsDb: number;
  pTotalSessionsDb: number;
  totalGmvDb: number;
  totalBuyersDb: number;
  totalOrdersDb: number;
  totalItemsSoldDb: number;
  totalLikesDb: number;
  totalCommentsDb: number;
  totalSharesDb: number;
  totalClicksDb: number;
  avgViewDurationDb: number;
  pTotalGmvDb: number;
  pTotalBuyersDb: number;
  pTotalOrdersDb: number;
  pTotalItemsSoldDb: number;
  pTotalLikesDb: number;
  pTotalCommentsDb: number;
  pTotalSharesDb: number;
  pTotalClicksDb: number;
  pAvgViewDurationDb: number;
  totalDbImpressions: number;
  totalDbLiveVisits: number;
  totalDbClicks: number;
  totalDbOrdersFunnel: number;
  pTotalDbImpressions: number;
  totalDbProductImpressions: number;
  pTotalDbProductImpressions: number;
  pTotalDbLiveVisits: number;
  totalDbDuration: number;
  pTotalDbDuration: number;
  gmvPerHour: number;
  pGmvPerHour: number;
  avgAovDb: number;
  pAvgAovDb: number;
  conversionRateShopee: number;
  pConversionRateShopee: number;
  isShopee: boolean;
};

export type LiveReportChartPoint =
  LiveReportViewModel["liveChartData"][number];

export type LiveReportChartData = LiveReportViewModel["liveChartData"];
