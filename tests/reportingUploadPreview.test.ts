import assert from "node:assert/strict";
import test from "node:test";

import { buildReportingUploadPreviewGroups } from "../src/shared/utils/reportingUploadPreview";
import type { ReportingRawRow } from "../src/shared/types/reporting";

const rows: ReportingRawRow[] = [
  {
    title: "Morning Live",
    date: "2026-07-01",
    dateTime: "2026-07-01 09:15",
    shift: "Pagi",
    duration: 3600,
    gmv: 100000,
    products_sold: 4,
    buyers: 2,
    aov: 50000,
    views: 10,
    impressions: 12,
    penonton: 50,
    liveVisits: 3,
    productImpressions: 5,
    clicks: 6,
    orders: 2,
    followers: 1,
    likes: 2,
    shares: 0,
    comments: 1,
    avgViewDuration: 30,
    peakViewers: 8,
    shopVouchers: 0,
    specialVouchers: 0,
    coinsClaimed: 0,
    hasFunnelInFile: true,
  },
  {
    title: "Night Live",
    date: "2026-07-01",
    dateTime: "2026-07-01 23:10",
    shift: "Malam",
    duration: 1800,
    gmv: 250000,
    products_sold: 2,
    buyers: 1,
    aov: 250000,
    views: 8,
    impressions: 10,
    penonton: 25,
    liveVisits: 2,
    productImpressions: 4,
    clicks: 3,
    orders: 1,
    followers: 0,
    likes: 1,
    shares: 0,
    comments: 0,
    avgViewDuration: 15,
    peakViewers: 5,
    shopVouchers: 0,
    specialVouchers: 0,
    coinsClaimed: 0,
    hasFunnelInFile: true,
  },
  {
    title: "Other Day",
    date: "2026-07-02",
    dateTime: "2026-07-02 08:00",
    shift: "Pagi",
    duration: 900,
    gmv: 50000,
    products_sold: 1,
    buyers: 1,
    aov: 50000,
    views: 5,
    impressions: 6,
    penonton: 15,
    liveVisits: 1,
    productImpressions: 2,
    clicks: 1,
    orders: 1,
    followers: 0,
    likes: 1,
    shares: 0,
    comments: 0,
    avgViewDuration: 10,
    peakViewers: 3,
    shopVouchers: 0,
    specialVouchers: 0,
    coinsClaimed: 0,
    hasFunnelInFile: true,
  },
];

test("buildReportingUploadPreviewGroups groups day buckets and sorts descending by default", () => {
  const result = buildReportingUploadPreviewGroups(rows, "day", [], false);

  assert.equal(result.length, 2);
  assert.equal(result[0].label, "2026-07-02");
  assert.equal(result[0].penonton, 15);
  assert.equal(result[0].gmv, 50000);
  assert.equal(result[1].label, "2026-07-01");
  assert.equal(result[1].penonton, 75);
  assert.equal(result[1].duration, 5400);
  assert.equal(result[1].orders, 3);
});

test("buildReportingUploadPreviewGroups maps wrapped shifts correctly", () => {
  const result = buildReportingUploadPreviewGroups(
    rows,
    "shift",
    ["22:00 - 02:00", "08:00 - 12:00"],
    true,
  );

  assert.equal(result.length, 2);
  assert.equal(result[0].label, "08:00 - 12:00");
  assert.equal(result[0].gmv, 150000);
  assert.equal(result[1].label, "22:00 - 02:00");
  assert.equal(result[1].gmv, 250000);
});
