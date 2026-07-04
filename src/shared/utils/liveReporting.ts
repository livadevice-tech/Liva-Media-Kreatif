import { normalizeDateYMD } from "./appUi";
// Removed unused reporting imports
import {
  filterReportLogs,
  type ReportDateFilterType,
  type ReportLogLike,
} from "./reportTable";
import type { BrandPerformanceLogEntry } from "../types/reporting";

export type LiveReportChartPoint = {
  date: string;
  gmv: number;
  orders: number;
  itemsSold: number;
  clicks: number;
  penonton: number;
};

export interface BuildLiveReportViewModelInput {
  brandPerformanceLogs: readonly BrandPerformanceLogEntry[];
  activeReportBrandId: string;
  dateFilterType: ReportDateFilterType;
  selectedMonth?: string;
  customStartDate?: string;
  customEndDate?: string;
  searchQuery?: string;
  platformFilter?: string;
  shiftFilters?: readonly string[];
}

export interface LiveReportViewModel {
  effectiveFilter: ReportDateFilterType;
  filteredDb: BrandPerformanceLogEntry[];
  targetLatestDate: string;
  latestDateLabel: string;
  prevStartDate: string;
  prevEndDate: string;
  tableLogs: ReportLogLike[];
  prevTableLogs: ReportLogLike[];
  liveChartData: LiveReportChartPoint[];
}

const toYmd = (date: string) => normalizeDateYMD(date);

export const hasTikTokLiveLogs = (
  logs: readonly BrandPerformanceLogEntry[],
) =>
  logs.some((log) =>
    String(log.platform || "").toLowerCase().includes("tiktok"),
  );

export function buildLiveReportViewModel(
  input: BuildLiveReportViewModelInput,
): LiveReportViewModel {
  const filteredDb = input.brandPerformanceLogs.filter(
    (log) =>
      log.brandId === input.activeReportBrandId &&
      log.reportType !== "engagement",
  );

  let effectiveFilter = input.dateFilterType;
  let targetLatestDate = "";
  let latestDateLabel = "";
  let prevStartDate = "";
  let prevEndDate = "";

  if (effectiveFilter === "latest") {
    const allDates = Array.from(
      new Set(
        filteredDb
          .map((log) => toYmd(log.date || ""))
          .filter(Boolean) as string[],
      ),
    ).sort();

    if (allDates.length > 0) {
      targetLatestDate = allDates[allDates.length - 1];
      latestDateLabel = targetLatestDate;
      const date = new Date(targetLatestDate);
      date.setDate(date.getDate() - 1);
      prevStartDate =
        prevEndDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    } else {
      effectiveFilter = "all";
    }
  } else if (effectiveFilter === "month" && input.selectedMonth) {
    latestDateLabel = input.selectedMonth;
    const [yearStr, monthStr] = input.selectedMonth.split("-");
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;
    if (month <= 0) {
      month = 12;
      year -= 1;
    }
    const prevMonth = `${year}-${String(month).padStart(2, "0")}`;
    prevStartDate = `${prevMonth}-01`;
    prevEndDate = `${prevMonth}-31`;
  } else if (
    effectiveFilter === "custom" &&
    input.customStartDate &&
    input.customEndDate
  ) {
    latestDateLabel = `${input.customStartDate} ke ${input.customEndDate}`;
    const start = new Date(input.customStartDate);
    const end = new Date(input.customEndDate);
    const durationDays = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 3600 * 24),
    );
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - durationDays);
    const formatYmd = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    prevStartDate = formatYmd(prevStart);
    prevEndDate = formatYmd(prevEnd);
  } else {
    latestDateLabel = "Semua Waktu";
  }

  const tableLogs = filterReportLogs(filteredDb as ReportLogLike[], {
    filterType: effectiveFilter,
    latestDate: targetLatestDate,
    prevStartDate,
    prevEndDate,
    selectedMonth: input.selectedMonth,
    customStartDate: input.customStartDate,
    customEndDate: input.customEndDate,
    searchQuery: input.searchQuery,
    platformFilter: input.platformFilter,
    shiftFilters: input.shiftFilters,
  });

  const prevTableLogs =
    effectiveFilter !== "all"
      ? filterReportLogs(filteredDb as ReportLogLike[], {
          filterType: effectiveFilter,
          isPrevPeriod: true,
          latestDate: targetLatestDate,
          prevStartDate,
          prevEndDate,
          selectedMonth: input.selectedMonth,
          customStartDate: input.customStartDate,
          customEndDate: input.customEndDate,
          searchQuery: input.searchQuery,
          platformFilter: input.platformFilter,
          shiftFilters: input.shiftFilters,
        })
      : [];

  const groupedByDate: Record<string, LiveReportChartPoint> = {};
  filteredDb.forEach((log) => {
    const d = log.date || "Tanpa Tanggal";
    if (!groupedByDate[d]) {
      groupedByDate[d] = {
        date: d,
        gmv: 0,
        orders: 0,
        itemsSold: 0,
        clicks: 0,
        penonton: 0,
      };
    }
    groupedByDate[d].gmv += log.gmv || 0;
    groupedByDate[d].orders += log.orders || 0;
    groupedByDate[d].itemsSold += log.products_sold || 0;
    groupedByDate[d].clicks += log.clicks || 0;
    groupedByDate[d].penonton += log.penonton || 0;
  });

  const liveChartData = Object.values(groupedByDate).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return {
    effectiveFilter,
    filteredDb,
    targetLatestDate,
    latestDateLabel,
    prevStartDate,
    prevEndDate,
    tableLogs,
    prevTableLogs,
    liveChartData,
  };
}
