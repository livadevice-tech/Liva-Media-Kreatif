import assert from "node:assert/strict";
import test from "node:test";

import { buildLiveReportPanelData } from "../src/shared/utils/liveReportPanel";
import type {
  BrandPerformanceLogEntry,
  ReportLogLike,
} from "../src/shared/types/reporting";

const currentLog: BrandPerformanceLogEntry = {
  id: "1",
  brandId: "brand-a",
  platform: "Shopee Live",
  reportType: "live",
  gmv: 200,
  buyers: 4,
  orders: 5,
  products_sold: 6,
  likes: 7,
  comments: 8,
  shares: 9,
  clicks: 10,
  liveVisits: 11,
  productImpressions: 12,
  duration: 0.5,
  avgViewDuration: 20,
};

const currentTableLog: ReportLogLike = {
  id: "1",
  platform: "Shopee Live",
  reportType: "live",
  gmv: 200,
  buyers: 4,
  orders: 5,
  products_sold: 6,
  likes: 7,
  comments: 8,
  shares: 9,
  clicks: 10,
  liveVisits: 11,
  productImpressions: 12,
  duration: 0.5,
  avgViewDuration: 20,
  penonton: 13,
};

const previousTableLog: ReportLogLike = {
  id: "2",
  platform: "Shopee Live",
  reportType: "live",
  gmv: 100,
  buyers: 2,
  orders: 3,
  products_sold: 4,
  likes: 1,
  comments: 2,
  shares: 3,
  clicks: 4,
  liveVisits: 5,
  productImpressions: 6,
  duration: 1,
  avgViewDuration: 10,
  penonton: 7,
};

test("buildLiveReportPanelData aggregates current and previous report stats", () => {
  const result = buildLiveReportPanelData({
    model: {
      effectiveFilter: "all",
      filteredDb: [currentLog],
      targetLatestDate: "",
      latestDateLabel: "Semua Waktu",
      prevStartDate: "",
      prevEndDate: "",
      tableLogs: [currentTableLog],
      prevTableLogs: [previousTableLog],
      liveChartData: [],
    },
    operatorPlatformFilter: "Shopee Live",
    reportDbSortCol: "date",
    reportDbSortAsc: false,
    currentPage: 1,
    itemsPerPage: 20,
  });

  assert.equal(result.stats.totalGmvDb, 200);
  assert.equal(result.stats.pTotalGmvDb, 100);
  assert.equal(result.stats.avgAovDb, 40);
  assert.equal(result.stats.pAvgAovDb, 33.333333333333336);
  assert.equal(result.stats.totalDbImpressions, 13);
  assert.equal(result.stats.pTotalDbImpressions, 7);
  assert.equal(result.stats.totalDbDuration, 43200);
  assert.equal(result.stats.pTotalDbDuration, 1);
  assert.equal(result.stats.gmvPerHour, 16.666666666666668);
  assert.equal(result.totalPages, 1);
  assert.equal(result.sortedTableLogs.length, 1);
  assert.equal(result.paginatedLogs.length, 1);
  assert.equal(result.stats.isShopee, true);
});
