import type { ReportLogLike } from "./reportTable";

export type LiveSessionPlatformKind = "shopee" | "tiktok" | "other";

export type LiveSessionRowMetrics = {
  viewer: number;
  gmv: number;
  itemsSold: number;
  avgViewDuration: number;
  customers: number;
  conversionRate: number;
};

const asNonNegativeNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value || 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const getLiveSessionPlatformKind = (
  log: Pick<ReportLogLike, "platform">,
): LiveSessionPlatformKind => {
  const platform = String(log.platform || "").toLowerCase();
  if (platform.includes("shopee")) return "shopee";
  if (platform.includes("tiktok")) return "tiktok";
  return "other";
};

export const formatLiveSessionDuration = (seconds?: number) => {
  const totalSeconds = Math.max(0, Math.round(seconds || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const formatLiveSessionAverageDuration = (seconds?: number) => {
  const value = Math.max(0, seconds || 0);
  return `${value.toFixed(2)}s`;
};

export const getLiveSessionMetrics = (
  log: ReportLogLike,
): LiveSessionRowMetrics => {
  const kind = getLiveSessionPlatformKind(log);
  const viewer =
    kind === "shopee"
      ? asNonNegativeNumber(log.penonton || log.views || log.impressions || log.liveVisits)
      : asNonNegativeNumber(log.impressions || log.views || log.liveVisits || log.penonton);
  const gmv = asNonNegativeNumber(log.gmv);
  const itemsSold = asNonNegativeNumber(log.products_sold || log.items_sold);
  const avgViewDuration = asNonNegativeNumber(log.avgViewDuration);
  const customers = asNonNegativeNumber(log.buyers || log.orders);
  const conversionRate = viewer > 0 ? (customers / viewer) * 100 : 0;

  return {
    viewer,
    gmv,
    itemsSold,
    avgViewDuration,
    customers,
    conversionRate,
  };
};

export const sumLiveSessionMetrics = (rows: readonly ReportLogLike[]) =>
  rows.reduce<LiveSessionRowMetrics>(
    (acc, row) => {
      const metrics = getLiveSessionMetrics(row);
      return {
        viewer: acc.viewer + metrics.viewer,
        gmv: acc.gmv + metrics.gmv,
        itemsSold: acc.itemsSold + metrics.itemsSold,
        avgViewDuration: acc.avgViewDuration + metrics.avgViewDuration,
        customers: acc.customers + metrics.customers,
        conversionRate: 0,
      };
    },
    {
      viewer: 0,
      gmv: 0,
      itemsSold: 0,
      avgViewDuration: 0,
      customers: 0,
      conversionRate: 0,
    },
  );

export const getLiveSessionConversionRate = (viewer: number, customers: number) =>
  viewer > 0 ? (customers / viewer) * 100 : 0;
