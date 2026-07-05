import type { BrandPerformanceLogEntry, SkuLogEntry } from "../types/reporting";
import {
  aggregateSkuLogs,
  filterSkuLogs,
  getLatestDateForBrand,
} from "./skuReporting";
import { getIndonesianMonthLabel } from "./reporting";
import {
  getAvailableReportDates,
  getReportPeriodLabel,
} from "./reportDateFilters";

export interface BuildProductPerformanceViewModelInput {
  shopeeSkuLogs: readonly SkuLogEntry[];
  brandPerformanceLogs: readonly BrandPerformanceLogEntry[];
  activeReportBrandId: string;
  operatorDateFilterType: "all" | "latest" | "month" | "custom";
  selectedLatestDate?: string;
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
  selectedLatestDate,
  operatorCustomStartDate,
  operatorCustomEndDate,
  operatorSelectedMonth,
  operatorPlatformFilter,
  operatorShiftFilters,
  reportDbSearchQuery,
}: BuildProductPerformanceViewModelInput): BuildProductPerformanceViewModelResult {
  const brandLatestDate = getLatestDateForBrand(
    brandPerformanceLogs,
    activeReportBrandId,
  );
  const skuLatestDate = getLatestDateForBrand(
    shopeeSkuLogs,
    activeReportBrandId,
  );
  const targetLatestDate = brandLatestDate || skuLatestDate;
  const skuAvailableDates = getAvailableReportDates({
    logs: shopeeSkuLogs,
    platformFilter: operatorPlatformFilter,
  });
  const effectiveLatestDate =
    operatorDateFilterType === "latest" &&
    selectedLatestDate &&
    skuAvailableDates.includes(selectedLatestDate)
      ? selectedLatestDate
      : targetLatestDate;

  const currentSkus = filterSkuLogs(shopeeSkuLogs, {
    brandId: activeReportBrandId,
    dateFilterType: operatorDateFilterType,
    latestDate: effectiveLatestDate,
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
        : effectiveLatestDate || "Semua Waktu",
    targetLatestDate: effectiveLatestDate,
    customStartDate: operatorCustomStartDate,
  });

  const aggregatedSkus = aggregateSkuLogs(currentSkus);
  const totalSold = aggregatedSkus.reduce((sum, item) => sum + item.sold, 0);

  return {
    targetLatestDate: effectiveLatestDate,
    productPeriodLabel,
    currentSkus,
    aggregatedSkus,
    totalSold,
  };
}
