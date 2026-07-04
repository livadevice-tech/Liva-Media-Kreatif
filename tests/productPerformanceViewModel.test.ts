import assert from "node:assert/strict";
import test from "node:test";

import { buildProductPerformanceViewModel } from "../src/shared/utils/productPerformanceViewModel";
import type { BrandPerformanceLogEntry, SkuLogEntry } from "../src/shared/types/reporting";

const skuLogs: SkuLogEntry[] = [
  {
    brandId: "brand-a",
    date: "2026-07-02",
    platform: "Shopee Live",
    shift: "Pagi",
    sku: "SKU-1",
    productName: "Produk 1",
    sold: 2,
    revenue: 100000,
  },
  {
    brandId: "brand-a",
    date: "2026-07-03",
    platform: "Shopee Live",
    shift: "Siang",
    sku: "SKU-1",
    productName: "Produk 1",
    sold: 3,
    revenue: 150000,
  },
];

const brandLogs: BrandPerformanceLogEntry[] = [
  {
    id: "log-1",
    brandId: "brand-a",
    platform: "Shopee Live",
    reportType: "live",
    date: "2026-07-03",
    gmv: 150000,
  },
];

test("buildProductPerformanceViewModel aggregates SKU rows and labels the active period", () => {
  const result = buildProductPerformanceViewModel({
    shopeeSkuLogs: skuLogs,
    brandPerformanceLogs: brandLogs,
    activeReportBrandId: "brand-a",
    operatorDateFilterType: "all",
    operatorCustomStartDate: "",
    operatorCustomEndDate: "",
    operatorSelectedMonth: "",
    operatorPlatformFilter: "Shopee Live",
    operatorShiftFilters: [],
    reportDbSearchQuery: "",
  });

  assert.equal(result.targetLatestDate, "2026-07-03");
  assert.equal(result.productPeriodLabel, "Semua Waktu");
  assert.equal(result.currentSkus.length, 2);
  assert.equal(result.aggregatedSkus.length, 1);
  assert.equal(result.aggregatedSkus[0].sold, 5);
  assert.equal(result.aggregatedSkus[0].revenue, 250000);
  assert.equal(result.totalSold, 5);
});
