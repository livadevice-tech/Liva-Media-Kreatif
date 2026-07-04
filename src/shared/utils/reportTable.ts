import { isPlatformMatch, normalizeDateYMD } from "./appUi";
import { normalizeDateStr } from "./dateFormatting";

export type ReportDateFilterType = "all" | "latest" | "month" | "custom";

export interface ReportLogLike {
  id?: string;
  date?: string;
  dateTime?: string;
  title?: string;
  platform?: string;
  brandId?: string;
  brandName?: string;
  batchId?: string;
  reportType?: string;
  shift?: string;
  status?: string;
  gmv?: number;
  orders?: number;
  products_sold?: number;
  items_sold?: number;
  clicks?: number;
  impressions?: number;
  views?: number;
  liveVisits?: number;
  penonton?: number;
  productImpressions?: number;
  buyers?: number;
  duration?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  avgViewDuration?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ReportFilterOptions {
  filterType: ReportDateFilterType;
  isPrevPeriod?: boolean;
  latestDate?: string;
  prevStartDate?: string;
  prevEndDate?: string;
  selectedMonth?: string;
  customStartDate?: string;
  customEndDate?: string;
  searchQuery?: string;
  platformFilter?: string;
  shiftFilters?: readonly string[];
}

export const getNextSortState = (
  currentKey: string,
  currentAsc: boolean,
  nextKey: string,
) => {
  if (currentKey === nextKey) {
    return { sortKey: currentKey, sortAsc: !currentAsc };
  }

  return { sortKey: nextKey, sortAsc: true };
};

export const filterReportLogs = (
  logs: readonly ReportLogLike[],
  options: ReportFilterOptions,
) => {
  const q = (options.searchQuery || "").trim().toLowerCase();

  return logs.filter((log) => {
    const normalizedLogDate = normalizeDateYMD(log.date || "");

    if (options.filterType !== "all") {
      if (options.isPrevPeriod) {
        if (options.filterType === "latest") {
          if (normalizedLogDate !== (options.prevStartDate || "")) {
            return false;
          }
        } else if (options.filterType === "month") {
          if (
            normalizedLogDate.substring(0, 7) !==
            (options.prevStartDate || "").substring(0, 7)
          ) {
            return false;
          }
        } else if (options.filterType === "custom") {
          if (
            (options.prevStartDate && normalizedLogDate < options.prevStartDate) ||
            (options.prevEndDate && normalizedLogDate > options.prevEndDate)
          ) {
            return false;
          }
        }
      } else {
        if (options.filterType === "latest") {
          if (normalizedLogDate !== (options.latestDate || "")) {
            return false;
          }
        } else if (options.filterType === "month") {
          if (
            normalizedLogDate.substring(0, 7) !==
            (options.selectedMonth || "")
          ) {
            return false;
          }
        } else if (options.filterType === "custom") {
          if (
            options.customStartDate &&
            normalizedLogDate < options.customStartDate
          ) {
            return false;
          }
          if (
            options.customEndDate &&
            normalizedLogDate > options.customEndDate
          ) {
            return false;
          }
        }
      }
    }

    if (q) {
      const matchTitle = String(log.title || "").toLowerCase().includes(q);
      const matchDate = String(log.date || "").toLowerCase().includes(q);
      const matchPlatformStr = String(log.platform || "")
        .toLowerCase()
        .includes(q);
      if (!matchTitle && !matchDate && !matchPlatformStr) {
        return false;
      }
    }

    if (options.platformFilter) {
      if (!isPlatformMatch(log.platform, options.platformFilter)) {
        return false;
      }
    }

    if (options.shiftFilters && options.shiftFilters.length > 0) {
      if (!options.shiftFilters.includes(log.shift || "")) {
        return false;
      }
    }

    return true;
  });
};

export const sortReportLogs = (
  logs: readonly ReportLogLike[],
  sortCol: string,
  sortAsc: boolean,
) => {
  return [...logs].sort((a, b) => {
    let valA: unknown = a[sortCol] ?? "";
    let valB: unknown = b[sortCol] ?? "";

  if (sortCol === "date") {
      valA = normalizeDateStr(a.date || "");
      valB = normalizeDateStr(b.date || "");
    } else if (sortCol === "views") {
      valA = a.impressions || a.views || a.liveVisits || a.penonton || 0;
      valB = b.impressions || b.views || b.liveVisits || b.penonton || 0;
    } else if (sortCol === "ctr") {
      valA = a.productImpressions ? a.clicks / a.productImpressions : 0;
      valB = b.productImpressions ? b.clicks / b.productImpressions : 0;
    } else if (sortCol === "ctor") {
      valA = a.clicks ? a.orders / a.clicks : 0;
      valB = b.clicks ? b.orders / b.clicks : 0;
  } else if (sortCol === "customers") {
      valA = a.buyers || a.orders || 0;
      valB = b.buyers || b.orders || 0;
    } else if (sortCol === "avgViewDuration") {
      valA = a.avgViewDuration || 0;
      valB = b.avgViewDuration || 0;
    }

    if (typeof valA === "string" && typeof valB === "string") {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    return sortAsc
      ? valA > valB
        ? 1
        : -1
      : valB > valA
        ? 1
        : -1;
  });
};

export const buildReportChartData = (logs: readonly ReportLogLike[]) => {
  const chartDataObj: Record<
    string,
    { date: string; gmv: number; impressions: number }
  > = {};

  logs.forEach((curr) => {
    let d = curr.date || "";
    if (
      d &&
      (d.indexOf("/") !== -1 ||
        (d.indexOf("-") !== -1 && d.split("-")[0].length <= 2))
    ) {
      d = normalizeDateStr(d);
    }

    if (!chartDataObj[d]) {
      chartDataObj[d] = { date: d, gmv: 0, impressions: 0 };
    }
    chartDataObj[d].gmv += curr.gmv || 0;
    chartDataObj[d].impressions +=
      curr.impressions || curr.views || curr.liveVisits || 0;
  });

  return Object.values(chartDataObj).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
};
