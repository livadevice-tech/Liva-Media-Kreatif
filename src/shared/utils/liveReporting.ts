import { normalizeDateYMD } from "./appUi";
import {
  buildDailyChart,
  buildMonthlyChart,
  getMonthOffset,
} from "./reporting";
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

  let customChartData: LiveReportChartPoint[] = [];

  if (effectiveFilter === "all") {
    const activeYear = new Date().getFullYear().toString();
    const months: string[] = [];
    for (let i = 1; i <= 12; i += 1) {
      months.push(`${activeYear}-${String(i).padStart(2, "0")}`);
    }
    customChartData = buildMonthlyChart(months, filteredDb as ReportLogLike[]);
  } else if (
    effectiveFilter === "latest" ||
    (effectiveFilter === "custom" &&
      input.customStartDate === input.customEndDate)
  ) {
    const endDate =
      effectiveFilter === "latest" ? targetLatestDate : input.customStartDate;
    if (endDate) {
      const end = new Date(endDate);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const formatYmd = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      customChartData = buildDailyChart(
        filteredDb as ReportLogLike[],
        formatYmd(start),
        formatYmd(end),
      );
    }
  } else if (effectiveFilter === "custom") {
    customChartData = buildDailyChart(
      filteredDb as ReportLogLike[],
      input.customStartDate || "",
      input.customEndDate || "",
    );
  } else if (effectiveFilter === "month" && input.selectedMonth) {
    const rawMonths = Array.from(
      new Set(
        filteredDb
          .map((log) => (log.date ? log.date.substring(0, 7) : ""))
          .filter(Boolean),
      ),
    ).sort();
    const hasNext = rawMonths.some((month) => month > input.selectedMonth!);

    const neededMonths = hasNext
      ? [
          getMonthOffset(input.selectedMonth, -2),
          getMonthOffset(input.selectedMonth, -1),
          input.selectedMonth,
          getMonthOffset(input.selectedMonth, 1),
        ]
      : [
          getMonthOffset(input.selectedMonth, -3),
          getMonthOffset(input.selectedMonth, -2),
          getMonthOffset(input.selectedMonth, -1),
          input.selectedMonth,
        ];

    customChartData = buildMonthlyChart(
      neededMonths,
      filteredDb as ReportLogLike[],
    );
  }

  const liveChartData = customChartData.map((item) => ({
    date: item.date,
    gmv: item.gmv,
    orders: item.orders,
    itemsSold: item.itemsSold,
    clicks: item.clicks,
    penonton: item.penonton,
  }));

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
