import type { ClientBrand } from "../../types";
import type {
  BrandPerformanceLogEntry,
  UploadHistoryEntry,
} from "../types/reporting";

export interface ReportBrandRowView {
  brand: Pick<ClientBrand, "id" | "name" | "clientPassword" | "logoUrl">;
  sessionCount: number;
  batchCount: number;
  totalGmv: number;
  platforms: string[];
  latestActivity: string;
  hasData: boolean;
}

export interface ReportBrandOverviewStats {
  totalBrands: number;
  activeBrands: number;
  totalSessions: number;
  totalGmv: number;
}

export interface BuildReportBrandSummaryInput {
  clientBrands: readonly Pick<ClientBrand, "id" | "name" | "clientPassword" | "logoUrl">[];
  brandPerformanceLogs: readonly BrandPerformanceLogEntry[];
  brandUploadHistory: readonly UploadHistoryEntry[];
  reportBrandSearchQuery: string;
  reportBrandPlatformFilter: string;
  reportBrandStatusFilter: "Aktif" | "Belum Ada Data" | "Semua Status";
  reportBrandSortKey:
    | "latest_activity"
    | "gmv"
    | "sessions"
    | "uploads"
    | "name";
}

export interface BuildReportBrandSummaryResult {
  overviewStats: ReportBrandOverviewStats;
  rows: ReportBrandRowView[];
}

function collectPlatforms(logs: readonly BrandPerformanceLogEntry[]) {
  return Array.from(
    new Set(
      logs
        .map((log) => log.platform)
        .filter((platform): platform is string => Boolean(platform)),
    ),
  );
}

function getLatestActivityTimestamp(
  item: UploadHistoryEntry | BrandPerformanceLogEntry,
) {
  return (
    ("createdAt" in item ? item.createdAt : undefined) ||
    item.uploadedAt ||
    item.date ||
    ""
  );
}

export function getAvailablePlatformsForBrand(
  brandId: string | undefined,
  brandPerformanceLogs: readonly BrandPerformanceLogEntry[],
  fallbackPlatforms: readonly string[],
) {
  if (!brandId || brandPerformanceLogs.length === 0) return [...fallbackPlatforms];

  const logs = brandPerformanceLogs.filter((log) => log.brandId === brandId);
  if (logs.length === 0) return [...fallbackPlatforms];

  const platforms = collectPlatforms(logs);
  return platforms.length > 0 ? platforms : [...fallbackPlatforms];
}

export function selectMostUsedPlatform(
  logs: readonly { platform?: string }[],
  fallback = "TikTok Live",
) {
  const counts: Record<string, number> = {};
  logs.forEach((log) => {
    if (log.platform) {
      counts[log.platform] = (counts[log.platform] || 0) + 1;
    }
  });

  let topPlatform = fallback;
  let maxCount = -1;
  for (const [platform, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      topPlatform = platform;
    }
  }

  return topPlatform;
}

export function buildReportBrandSummary({
  clientBrands,
  brandPerformanceLogs,
  brandUploadHistory,
  reportBrandSearchQuery,
  reportBrandPlatformFilter,
  reportBrandStatusFilter,
  reportBrandSortKey,
}: BuildReportBrandSummaryInput): BuildReportBrandSummaryResult {
  const totalSessions = brandPerformanceLogs.length;
  const totalGmv = brandPerformanceLogs.reduce(
    (sum, log) => sum + (log.gmv || 0),
    0,
  );
  const activeBrandIds = new Set<string>();
  brandPerformanceLogs.forEach((log) => activeBrandIds.add(log.brandId));
  brandUploadHistory.forEach((batch) => {
    if (batch.brandId) activeBrandIds.add(batch.brandId);
  });

  const overviewStats: ReportBrandOverviewStats = {
    totalBrands: clientBrands.length,
    activeBrands: activeBrandIds.size,
    totalSessions,
    totalGmv,
  };

  const query = reportBrandSearchQuery.trim().toLowerCase();
  const rows = clientBrands
    .map((brand) => {
      const sessionLogs = brandPerformanceLogs.filter(
        (log) => log.brandId === brand.id,
      );
      const batchLogs = brandUploadHistory.filter(
        (batch) => batch.brandId === brand.id,
      );
      const platforms = collectPlatforms(sessionLogs);
      const totalGmvForBrand = sessionLogs.reduce(
        (sum, log) => sum + (log.gmv || 0),
        0,
      );
      const timestamps = [...sessionLogs, ...batchLogs]
        .map((item) => getLatestActivityTimestamp(item))
        .filter(Boolean)
        .sort();
      const latestActivity = timestamps[timestamps.length - 1] || "";

      return {
        brand,
        sessionCount: sessionLogs.length,
        batchCount: batchLogs.length,
        totalGmv: totalGmvForBrand,
        platforms,
        latestActivity,
        hasData: sessionLogs.length > 0 || batchLogs.length > 0,
      };
    })
    .filter((row) => {
      if (query) {
        const matches =
          (row.brand.name || "").toLowerCase().includes(query) ||
          row.brand.id.toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (
        reportBrandPlatformFilter !== "Semua Platform" &&
        !row.platforms.includes(reportBrandPlatformFilter)
      ) {
        return false;
      }
      if (
        reportBrandStatusFilter === "Aktif" &&
        !row.hasData
      ) {
        return false;
      }
      if (
        reportBrandStatusFilter === "Belum Ada Data" &&
        row.hasData
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (reportBrandSortKey === "name") {
        return a.brand.name.localeCompare(b.brand.name);
      }
      if (reportBrandSortKey === "gmv") {
        return b.totalGmv - a.totalGmv;
      }
      if (reportBrandSortKey === "sessions") {
        return b.sessionCount - a.sessionCount;
      }
      if (reportBrandSortKey === "uploads") {
        return b.batchCount - a.batchCount;
      }
      return (b.latestActivity || "").localeCompare(a.latestActivity || "");
    });

  return { overviewStats, rows };
}
