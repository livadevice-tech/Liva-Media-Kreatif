import type { ClientBrand } from "../../types";
import type {
  BrandPerformanceLogEntry,
  UploadHistoryEntry,
} from "../types/reporting";

export interface ReportBrandRowView {
  brand: Pick<ClientBrand, "id" | "name" | "clientPassword" | "logoUrl" | "isActive">;
  sessionCount: number;
  batchCount: number;
  totalGmv: number;
  platforms: string[];
  latestActivity: string;
  hasData: boolean;
  monthlyTrend: { label: string; value: number }[];
  percentChange: number;
}

export interface ReportBrandOverviewStats {
  totalBrands: number;
  activeBrands: number;
  totalSessions: number;
  totalGmv: number;
}

export interface BuildReportBrandSummaryInput {
  clientBrands: readonly Pick<ClientBrand, "id" | "name" | "clientPassword" | "logoUrl" | "isActive">[];
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
  const activeBrandsCount = clientBrands.filter(b => b.isActive !== false).length;

  const overviewStats: ReportBrandOverviewStats = {
    totalBrands: clientBrands.length,
    activeBrands: activeBrandsCount,
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


      // Calculate monthly trend (last 6 months)
      const monthlyData: Record<string, number> = {};
      sessionLogs.forEach(log => {
        const dateStr = log.date || log.dateTime || log.uploadedAt;
        if (dateStr) {
          try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              const monthLabel = d.toLocaleString('id-ID', { month: 'short' });
              const yearMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
              if (!monthlyData[yearMonth]) monthlyData[yearMonth] = 0;
              monthlyData[yearMonth] += (log.gmv || 0);
            }
          } catch(e) {}
        }
      });
      
      const sortedMonths = Object.keys(monthlyData).sort();
      // take last 6
      const recentMonths = sortedMonths.slice(-6);
      
      // format to {label, value}
      const monthlyTrend = recentMonths.map(ym => {
        const [year, m] = ym.split('-');
        const d = new Date(parseInt(year), parseInt(m) - 1, 1);
        return {
          label: d.toLocaleString('en-US', { month: 'short' }), // "Jun", "Jul" as requested
          value: monthlyData[ym]
        };
      });

      // Calculate percentChange between last month and previous month
      let percentChange = 0;
      if (recentMonths.length >= 2) {
        const lastMonthVal = monthlyData[recentMonths[recentMonths.length - 1]];
        const prevMonthVal = monthlyData[recentMonths[recentMonths.length - 2]];
        if (prevMonthVal > 0) {
          percentChange = ((lastMonthVal - prevMonthVal) / prevMonthVal) * 100;
        } else if (lastMonthVal > 0) {
          percentChange = 100; // From 0 to something
        }
      }

      return {
        brand,
        sessionCount: sessionLogs.length,
        batchCount: batchLogs.length,
        totalGmv: totalGmvForBrand,
        platforms,
        latestActivity,
        hasData: sessionLogs.length > 0 || batchLogs.length > 0,
        monthlyTrend,
        percentChange
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
        row.brand.isActive === false
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
