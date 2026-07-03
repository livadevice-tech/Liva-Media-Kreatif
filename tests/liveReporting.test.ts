import test from "node:test";
import assert from "node:assert/strict";
import { buildLiveReportViewModel } from "../src/shared/utils/liveReporting";

const baseLogs = [
  {
    id: "1",
    brandId: "brand-a",
    reportType: "live",
    date: "2024-05-01",
    platform: "Shopee",
    gmv: 100,
    buyers: 2,
    orders: 2,
    products_sold: 3,
    clicks: 4,
    penonton: 10,
  },
  {
    id: "2",
    brandId: "brand-a",
    reportType: "live",
    date: "2024-05-03",
    platform: "Shopee",
    gmv: 200,
    buyers: 3,
    orders: 3,
    products_sold: 4,
    clicks: 5,
    penonton: 15,
  },
  {
    id: "3",
    brandId: "brand-a",
    reportType: "engagement",
    date: "2024-05-05",
    platform: "Shopee",
    gmv: 999,
  },
  {
    id: "4",
    brandId: "brand-b",
    reportType: "live",
    date: "2024-05-10",
    platform: "Shopee",
    gmv: 500,
  },
] as const;

test("buildLiveReportViewModel resolves latest filter and ignores engagement logs", () => {
  const result = buildLiveReportViewModel({
    brandPerformanceLogs: baseLogs,
    activeReportBrandId: "brand-a",
    dateFilterType: "latest",
    searchQuery: "",
    platformFilter: "",
    shiftFilters: [],
  });

  assert.equal(result.effectiveFilter, "latest");
  assert.equal(result.targetLatestDate, "2024-05-03");
  assert.equal(result.prevStartDate, "2024-05-02");
  assert.equal(result.prevEndDate, "2024-05-02");
  assert.equal(result.tableLogs.length, 1);
  assert.equal(result.tableLogs[0].date, "2024-05-03");
  assert.equal(result.filteredDb.length, 2);
  assert.equal(result.liveChartData.length, 2);
  assert.equal(result.liveChartData[0].date, "2024-05-01");
  assert.equal(result.liveChartData[1].date, "2024-05-03");
});

test("buildLiveReportViewModel builds month comparison windows", () => {
  const result = buildLiveReportViewModel({
    brandPerformanceLogs: baseLogs,
    activeReportBrandId: "brand-a",
    dateFilterType: "month",
    selectedMonth: "2024-05",
    searchQuery: "",
    platformFilter: "",
    shiftFilters: [],
  });

  assert.equal(result.effectiveFilter, "month");
  assert.equal(result.latestDateLabel, "2024-05");
  assert.equal(result.prevStartDate, "2024-04-01");
  assert.equal(result.prevEndDate, "2024-04-31");
  assert.equal(result.tableLogs.length, 2);
  assert.equal(result.prevTableLogs.length, 0);
});
