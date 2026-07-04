import assert from "node:assert/strict";
import test from "node:test";

import {
  formatLiveSessionAverageDuration,
  formatLiveSessionDuration,
  getLiveSessionMetrics,
} from "../src/shared/utils/liveSessionsTable";
import type { ReportLogLike } from "../src/shared/utils/reportTable";

test("live session helpers map Shopee fields correctly", () => {
  const row: ReportLogLike = {
    platform: "Shopee Live",
    penonton: 1200,
    buyers: 30,
    orders: 30,
    products_sold: 42,
    gmv: 418349786,
    avgViewDuration: 25,
    duration: 7261,
  };

  const metrics = getLiveSessionMetrics(row);

  assert.equal(metrics.viewer, 1200);
  assert.equal(metrics.customers, 30);
  assert.equal(metrics.itemsSold, 42);
  assert.equal(metrics.conversionRate, 2.5);
  assert.equal(formatLiveSessionDuration(row.duration), "02:01:01");
  assert.equal(formatLiveSessionAverageDuration(row.avgViewDuration), "25.00s");
});

test("live session helpers map TikTok fields correctly", () => {
  const row: ReportLogLike = {
    platform: "TikTok Live",
    impressions: 900,
    buyers: 18,
    orders: 18,
    items_sold: 19,
    gmv: 12345678,
    avgViewDuration: 12.5,
    duration: 5400,
  };

  const metrics = getLiveSessionMetrics(row);

  assert.equal(metrics.viewer, 900);
  assert.equal(metrics.customers, 18);
  assert.equal(metrics.itemsSold, 19);
  assert.equal(metrics.conversionRate, 2);
  assert.equal(formatLiveSessionDuration(row.duration), "01:30:00");
  assert.equal(formatLiveSessionAverageDuration(row.avgViewDuration), "12.50s");
});
