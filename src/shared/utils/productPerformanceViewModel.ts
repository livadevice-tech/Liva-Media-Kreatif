import type { BrandPerformanceLogEntry, SkuLogEntry } from "../types/reporting";
import {
  aggregateSkuLogs,
  filterSkuLogs,
  getLatestDateForBrand,
} from "./skuReporting";
import { getIndonesianMonthLabel } from "./reporting";
import { getReportPeriodLabel } from "./reportDateFilters";

export interface BuildProductPerformanceViewModelInput {
  shopeeSkuLogs: readonly SkuLogEntry[];
  brandPerformanceLogs: readonly BrandPerformanceLogEntry[];
  activeReportBrandId: string;
  operatorDateFilterType: "all" | "latest" | "month" | "custom";
  operatorCustomStartDate: string;
  operatorCustomEndDate: string;
  operatorSelectedMonth: string;
  operatorPlatformFilter: string;
  operatorShiftFilters: readonly string[];
  reportDbSearchQuery: string;
}

export interface BuildProductPerformanceViewModelResult {
  targetLatestDate: string;
  productPeriodLabel: string;
  currentSkus: ReturnType<typeof filterSkuLogs>;
  aggregatedSkus: ReturnType<typeof aggregateSkuLogs>;
  totalSold: number;
}

export function buildProductPerformanceViewModel({
  shopeeSkuLogs,
  brandPerformanceLogs,
  activeReportBrandId,
  operatorDateFilterType,
  operatorCustomStartDate,
  operatorCustomEndDate,
  operatorSelectedMonth,
  operatorPlatformFilter,
  operatorShiftFilters,
  reportDbSearchQuery,
}: BuildProductPerformanceViewModelInput): BuildProductPerformanceViewModelResult {
  const targetLatestDate = getLatestDateForBrand(
    brandPerformanceLogs,
    activeReportBrandId,
  );

  const currentSkus = filterSkuLogs(shopeeSkuLogs, {
    brandId: activeReportBrandId,
    dateFilterType: operatorDateFilterType,
    latestDate: targetLatestDate,
    customStartDate: operatorCustomStartDate,
    customEndDate: operatorCustomEndDate,
    selectedMonth: operatorSelectedMonth,
    platformFilter: operatorPlatformFilter,
    shiftFilters: operatorShiftFilters,
    searchQuery: reportDbSearchQuery,
  });

  const productPeriodLabel = getReportPeriodLabel({
    dateFilterType: operatorDateFilterType,
    latestDateLabel:
      operatorDateFilterType === "month"
        ? operatorSelectedMonth
          ? getIndonesianMonthLabel(operatorSelectedMonth)
          : "Semua Waktu"
        : "Semua Waktu",
    targetLatestDate,
    customStartDate: operatorCustomStartDate,
  });

  const aggregatedSkus = aggregateSkuLogs(currentSkus);
  const totalSold = aggregatedSkus.reduce((sum, item) => sum + item.sold, 0);

  return {
    targetLatestDate,
    productPeriodLabel,
    currentSkus,
    aggregatedSkus,
    totalSold,
  };
}
