import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateSkuLogs,
  filterSkuLogs,
  getLatestDateForBrand,
} from "../src/shared/utils/skuReporting";

test("filterSkuLogs filters by brand, date, platform, shift, and search", () => {
  const logs = [
    {
      brandId: "brand-a",
      date: "2026-07-01",
      platform: "Shopee Live",
      shift: "Pagi",
      sku: "SKU-1",
      productName: "Alpha",
    },
    {
      brandId: "brand-a",
      date: "2026-07-02",
      platform: "TikTok Live",
      shift: "Malam",
      sku: "SKU-2",
      productName: "Beta",
    },
    {
      brandId: "brand-b",
      date: "2026-07-02",
      platform: "TikTok Live",
      shift: "Malam",
      sku: "SKU-3",
      productName: "Gamma",
    },
  ];

  const filtered = filterSkuLogs(logs, {
    brandId: "brand-a",
    dateFilterType: "month",
    selectedMonth: "2026-07",
    platformFilter: "tik",
    shiftFilters: ["Malam"],
    searchQuery: "beta",
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].sku, "SKU-2");
});

test("aggregateSkuLogs merges duplicate SKU keys", () => {
  const aggregated = aggregateSkuLogs([
    { sku: "SKU-1", productName: "Alpha", sold: 2, revenue: 100 },
    { sku: "SKU-1", productName: "Alpha", sold: 3, revenue: 150 },
    { sku: "N/A", productName: "Beta", sold: 1, revenue: 50 },
  ]);

  assert.deepEqual(aggregated, [
    { sku: "SKU-1", productName: "Alpha", sold: 5, revenue: 250 },
    { sku: "N/A", productName: "Beta", sold: 1, revenue: 50 },
  ]);
});

test("getLatestDateForBrand returns newest brand date", () => {
  const latest = getLatestDateForBrand(
    [
      { brandId: "brand-a", date: "2026-07-01" },
      { brandId: "brand-a", date: "2026-07-02" },
      { brandId: "brand-b", date: "2026-07-03" },
    ],
    "brand-a",
  );

  assert.equal(latest, "2026-07-02");
});
