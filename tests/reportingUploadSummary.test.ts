import assert from "node:assert/strict";
import test from "node:test";

import { buildReportingUploadSummary } from "../src/shared/utils/reportingUploadSummary";
import type { ReportingRawRow } from "../src/shared/types/reporting";

const rows: ReportingRawRow[] = [
  {
    title: "Session A",
    date: "2026-07-01",
    dateTime: "2026-07-01 10:00",
    shift: "Pagi",
    duration: 3600,
    gmv: 1500000,
    products_sold: 12,
    buyers: 10,
    aov: 150000,
    views: 100,
    impressions: 200,
    penonton: 150,
    liveVisits: 20,
    productImpressions: 30,
    clicks: 4,
    orders: 5,
    followers: 6,
    likes: 7,
    shares: 8,
    comments: 9,
    avgViewDuration: 120,
    peakViewers: 25,
    shopVouchers: 1,
    specialVouchers: 2,
    coinsClaimed: 3,
    hasFunnelInFile: true,
  },
  {
    title: "Session B",
    date: "2026-07-02",
    dateTime: "2026-07-02 11:00",
    shift: "Siang",
    duration: 1800,
    gmv: 500000,
    products_sold: 3,
    buyers: 5,
    aov: 100000,
    views: 50,
    impressions: 70,
    penonton: 60,
    liveVisits: 10,
    productImpressions: 20,
    clicks: 2,
    orders: 3,
    followers: 4,
    likes: 5,
    shares: 6,
    comments: 7,
    avgViewDuration: 60,
    peakViewers: 15,
    shopVouchers: 2,
    specialVouchers: 1,
    coinsClaimed: 9,
    hasFunnelInFile: false,
  },
];

test("buildReportingUploadSummary aggregates reporting upload metrics", () => {
  const summary = buildReportingUploadSummary(rows);

  assert.equal(summary.recordCount, 2);
  assert.equal(summary.totalViewerReach, 270);
  assert.equal(summary.totalViews, 150);
  assert.equal(summary.totalLiveVisits, 30);
  assert.equal(summary.totalProductImpressions, 50);
  assert.equal(summary.totalClicks, 6);
  assert.equal(summary.totalOrders, 8);
  assert.equal(summary.totalBuyerConversions, 15);
  assert.equal(summary.totalLikes, 12);
  assert.equal(summary.totalComments, 16);
  assert.equal(summary.totalShares, 14);
  assert.equal(summary.totalFollowers, 10);
  assert.equal(summary.totalShopVouchers, 3);
  assert.equal(summary.totalSpecialVouchers, 3);
  assert.equal(summary.totalCoinsClaimed, 12);
  assert.equal(summary.totalInteractions, 42);
  assert.equal(summary.totalGmv, 2000000);
  assert.equal(summary.totalProductsSold, 15);
  assert.equal(summary.totalBuyers, 15);
  assert.equal(summary.averageAov, 133333.33333333334);
  assert.equal(summary.averageViewDuration, 90);
  assert.equal(summary.peakViewers, 20);
  assert.equal(summary.engagementErrRate, 24.761904761904763);
  assert.equal(summary.ctrRate, 4);
  assert.equal(summary.cartToClickRate, 133.33333333333331);
  assert.equal(summary.checkoutRate, 187.5);
  assert.equal(summary.overallCvr, 10);
  assert.equal(summary.clickWidth, 30);
  assert.equal(summary.orderWidth, 15);
  assert.equal(summary.buyerWidth, 10);
});
