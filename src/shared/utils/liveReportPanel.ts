import type { LiveReportViewModel } from "./liveReporting";
import { sortReportLogs, type ReportLogLike } from "./reportTable";

export interface LiveReportPanelStats {
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
  pTotalDbLiveVisits: number;
  totalDbDuration: number;
  pTotalDbDuration: number;
  gmvPerHour: number;
  pGmvPerHour: number;
  avgAovDb: number;
  pAvgAovDb: number;
  conversionRateShopee: number;
  pConversionRateShopee: number;
  totalPeakViewersDb: number;
  pTotalPeakViewersDb: number;
  totalShopVouchersDb: number;
  pTotalShopVouchersDb: number;
  isShopee: boolean;
}

export interface BuildLiveReportPanelDataInput {
  model: LiveReportViewModel;
  operatorPlatformFilter: string;
  reportDbSortCol: string;
  reportDbSortAsc: boolean;
  currentPage: number;
  itemsPerPage: number;
}

export interface BuildLiveReportPanelDataResult {
  stats: LiveReportPanelStats;
  chartData: LiveReportViewModel["liveChartData"];
  sortedTableLogs: ReportLogLike[];
  paginatedLogs: ReportLogLike[];
  totalPages: number;
}

const sum = (rows: readonly ReportLogLike[], selector: (row: ReportLogLike) => number) =>
  rows.reduce((acc, row) => acc + selector(row), 0);

const getDurationSeconds = (duration?: number) => {
  let value = duration || 0;
  if (value > 0 && value < 1) value *= 86400;
  return value;
};

export function buildLiveReportPanelData(
  input: BuildLiveReportPanelDataInput,
): BuildLiveReportPanelDataResult {
  const tableLogs = input.model.tableLogs;
  const prevTableLogs = input.model.prevTableLogs;

  const totalSessionsDb = tableLogs.length;
  const totalGmvDb = sum(tableLogs, (item) => item.gmv || 0);
  const totalBuyersDb = sum(tableLogs, (item) => item.buyers || 0);
  const totalOrdersDb = sum(tableLogs, (item) => item.orders || item.buyers || 0);
  const totalItemsSoldDb = sum(tableLogs, (item) => item.products_sold || 0);
  const totalLikesDb = sum(tableLogs, (item) => item.likes || 0);
  const totalCommentsDb = sum(tableLogs, (item) => item.comments || 0);
  const totalSharesDb = sum(tableLogs, (item) => item.shares || 0);
  const totalClicksDb = sum(tableLogs, (item) => item.clicks || 0);
  const totalPeakViewersDb = sum(tableLogs, (item) => item.peakViewers || 0);
  const totalShopVouchersDb = sum(tableLogs, (item) => item.shopVouchers || 0);
  const avgViewDurationDb =
    totalSessionsDb > 0
      ? sum(tableLogs, (item) => item.avgViewDuration || 0) / totalSessionsDb
      : 0;

  const pTotalSessionsDb = prevTableLogs.length;
  const pTotalGmvDb = sum(prevTableLogs, (item) => item.gmv || 0);
  const pTotalBuyersDb = sum(prevTableLogs, (item) => item.buyers || 0);
  const pTotalOrdersDb = sum(prevTableLogs, (item) => item.orders || item.buyers || 0);
  const pTotalItemsSoldDb = sum(prevTableLogs, (item) => item.products_sold || 0);
  const pTotalLikesDb = sum(prevTableLogs, (item) => item.likes || 0);
  const pTotalCommentsDb = sum(prevTableLogs, (item) => item.comments || 0);
  const pTotalSharesDb = sum(prevTableLogs, (item) => item.shares || 0);
  const pTotalClicksDb = sum(prevTableLogs, (item) => item.clicks || 0);
  const pTotalPeakViewersDb = sum(prevTableLogs, (item) => item.peakViewers || 0);
  const pTotalShopVouchersDb = sum(prevTableLogs, (item) => item.shopVouchers || 0);
  const pAvgViewDurationDb =
    prevTableLogs.length > 0
      ? sum(prevTableLogs, (item) => item.avgViewDuration || 0) / prevTableLogs.length
      : 0;

  const isShopee = input.operatorPlatformFilter
    ? input.operatorPlatformFilter.toLowerCase().includes("shopee")
    : input.model.filteredDb.some(
        (log) => log.platform && log.platform.toLowerCase().includes("shopee"),
      );

  const totalDbImpressions = sum(tableLogs, (curr) => {
    const shopee = curr.platform && curr.platform.toLowerCase().includes("shopee");
    return shopee
      ? curr.penonton || curr.impressions || curr.views || 0
      : curr.impressions || curr.views || curr.liveVisits || curr.penonton || 0;
  });
  const totalDbLiveVisits = sum(tableLogs, (curr) => curr.liveVisits || 0);
  const pTotalDbLiveVisits = sum(prevTableLogs, (curr) => curr.liveVisits || 0);
  const totalDbClicks = sum(tableLogs, (curr) => curr.clicks || 0);
  const totalDbOrdersFunnel = sum(tableLogs, (curr) => curr.orders || curr.buyers || 0);
  const pTotalDbImpressions = sum(prevTableLogs, (curr) => {
    const shopee = curr.platform && curr.platform.toLowerCase().includes("shopee");
    return shopee
      ? curr.penonton || curr.impressions || curr.views || 0
      : curr.impressions || curr.views || curr.liveVisits || curr.penonton || 0;
  });
  const totalDbDuration = sum(tableLogs, (curr) => getDurationSeconds(curr.duration));
  const pTotalDbDuration = sum(prevTableLogs, (curr) => getDurationSeconds(curr.duration));
  const gmvPerHour = totalDbDuration > 0 ? totalGmvDb / (totalDbDuration / 3600) : 0;
  const pGmvPerHour = pTotalDbDuration > 0 ? pTotalGmvDb / (pTotalDbDuration / 3600) : 0;
  const avgAovDb =
    totalOrdersDb > 0
      ? totalGmvDb / totalOrdersDb
      : totalBuyersDb > 0
        ? totalGmvDb / totalBuyersDb
        : 0;
  const pAvgAovDb =
    pTotalOrdersDb > 0
      ? pTotalGmvDb / pTotalOrdersDb
      : pTotalBuyersDb > 0
        ? pTotalGmvDb / pTotalBuyersDb
        : 0;
  const conversionRateShopee = isShopee
    ? totalDbImpressions > 0
      ? (totalDbOrdersFunnel / totalDbImpressions) * 100
      : 0
    : totalDbClicks > 0
      ? (totalDbOrdersFunnel / totalDbClicks) * 100
      : 0;

  const pConversionRateShopee = isShopee
    ? pTotalDbImpressions > 0
      ? (pTotalOrdersDb / pTotalDbImpressions) * 100
      : 0
    : pTotalClicksDb > 0
      ? (pTotalOrdersDb / pTotalClicksDb) * 100
      : 0;

  const stats: LiveReportPanelStats = {
    totalSessionsDb,
    pTotalSessionsDb,
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
    pTotalDbImpressions,
    pTotalDbLiveVisits,
    totalDbDuration,
    pTotalDbDuration,
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
  };

  const chartData = input.model.liveChartData;
  const sortedTableLogs = sortReportLogs(
    tableLogs,
    input.reportDbSortCol,
    input.reportDbSortAsc,
  );
  const paginatedLogs = sortedTableLogs.slice(
    (input.currentPage - 1) * input.itemsPerPage,
    input.currentPage * input.itemsPerPage,
  );
  const totalPages = Math.ceil(sortedTableLogs.length / input.itemsPerPage);

  return {
    stats,
    chartData,
    sortedTableLogs,
    paginatedLogs,
    totalPages,
  };
}
