import test from "node:test";
import assert from "node:assert/strict";
import { buildEngagementReportViewModel } from "../src/shared/utils/engagementReporting";

const engagementLogs = [
  {
    id: "1",
    brandId: "brand-a",
    reportType: "engagement",
    date: "2024-06-01",
    platform: "Shopee",
    views: 100,
    penonton: 100,
    likes: 10,
    comments: 5,
    shares: 2,
    followers: 3,
    shopVouchers: 1,
    specialVouchers: 2,
    coinsClaimed: 4,
    peakViewers: 50,
    shift: "Morning",
  },
  {
    id: "2",
    brandId: "brand-a",
    reportType: "engagement",
    date: "2024-06-02",
    platform: "Shopee",
    views: 150,
    penonton: 120,
    likes: 20,
    comments: 10,
    shares: 5,
    followers: 5,
    shopVouchers: 0,
    specialVouchers: 1,
    coinsClaimed: 0,
    peakViewers: 80,
    shift: "Morning",
  },
  {
    id: "3",
    brandId: "brand-a",
    reportType: "live",
    date: "2024-06-03",
    platform: "Shopee",
  },
] as const;

test("buildEngagementReportViewModel filters engagement logs and aggregates metrics", () => {
  const result = buildEngagementReportViewModel({
    brandPerformanceLogs: engagementLogs,
    activeReportBrandId: "brand-a",
    operatorDateFilterType: "all",
    operatorPlatformFilter: "Shopee",
    operatorShiftFilters: ["Morning"],
  });

  assert.equal(result.engagementLogsForBrand.length, 2);
  assert.equal(result.logs.length, 2);
  assert.equal(result.engagementLatestDate, "2024-06-02");
  assert.equal(result.engagementPeriodLabel, "Semua Waktu");
  assert.equal(result.totalImpressions, 220);
  assert.equal(result.totalPenonton, 220);
  assert.equal(result.avgPeakViewers, 65);
  assert.equal(result.totalLikes, 30);
  assert.equal(result.totalShares, 7);
  assert.equal(result.totalComments, 15);
  assert.equal(result.totalFollowers, 8);
  assert.equal(result.totalShopVouchers, 1);
  assert.equal(result.totalSpecialVouchers, 3);
  assert.equal(result.totalCoinsClaimed, 4);
  assert.equal(result.chartData.length, 2);
  assert.equal(result.chartData[0].date, "2024-06-01");
  assert.equal(result.chartData[1].date, "2024-06-02");
});

test("buildEngagementReportViewModel supports latest date period labels", () => {
  const result = buildEngagementReportViewModel({
    brandPerformanceLogs: engagementLogs,
    activeReportBrandId: "brand-a",
    operatorDateFilterType: "latest",
    operatorPlatformFilter: "Shopee",
    operatorShiftFilters: [],
  });

  assert.equal(result.engagementLatestDate, "2024-06-02");
  assert.equal(result.engagementDateLabel, "2024-06-02");
  assert.match(result.engagementPeriodLabel, /2024/);
});
