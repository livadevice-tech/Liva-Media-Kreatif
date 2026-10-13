import assert from "node:assert/strict";
import test from "node:test";

import {
  buildReportBrandSummary,
  getAvailablePlatformsForBrand,
  getAvailableShiftsForBrand,
  selectMostUsedPlatform,
} from "../src/shared/utils/reportBrandSummary";

test("selectMostUsedPlatform returns the most frequent platform", () => {
  assert.equal(
    selectMostUsedPlatform([
      { platform: "TikTok Live" },
      { platform: "Shopee Live" },
      { platform: "TikTok Live" },
    ]),
    "TikTok Live",
  );
  assert.equal(selectMostUsedPlatform([], "Shopee Live"), "Shopee Live");
});

test("getAvailablePlatformsForBrand falls back safely when brand has no logs", () => {
  assert.deepEqual(
    getAvailablePlatformsForBrand("brand-a", [], ["TikTok Live", "Shopee Live"]),
    ["TikTok Live", "Shopee Live"],
  );
});

test("buildReportBrandSummary filters, sorts, and aggregates brand rows", () => {
  const result = buildReportBrandSummary({
    clientBrands: [
      { id: "brand-a", name: "Alpha" },
      { id: "brand-b", name: "Beta" },
    ],
    brandPerformanceLogs: [
      {
        id: "log-1",
        brandId: "brand-a",
        brandName: "Alpha",
        platform: "TikTok Live",
        reportType: "live",
        gmv: 100,
        date: "2026-07-01",
      },
      {
        id: "log-2",
        brandId: "brand-a",
        brandName: "Alpha",
        platform: "TikTok Live",
        reportType: "live",
        gmv: 50,
        date: "2026-07-02",
      },
      {
        id: "log-3",
        brandId: "brand-b",
        brandName: "Beta",
        platform: "Shopee Live",
        reportType: "live",
        gmv: 20,
        date: "2026-07-03",
      },
    ],
    brandUploadHistory: [
      {
        id: "batch-1",
        brandId: "brand-a",
        brandName: "Alpha",
        platform: "TikTok Live",
        fileName: "alpha.xlsx",
        uploadedAt: "2026-07-04T00:00:00.000Z",
        rowCount: 2,
        gmv: 150,
      },
    ],
    reportBrandSearchQuery: "alpha",
    reportBrandPlatformFilter: "TikTok Live",
    reportBrandStatusFilter: "Aktif",
    reportBrandSortKey: "gmv",
  });

  assert.equal(result.overviewStats.totalBrands, 2);
  assert.equal(result.overviewStats.activeBrands, 2);
  assert.equal(result.overviewStats.totalSessions, 3);
  assert.equal(result.overviewStats.totalGmv, 170);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].brand.id, "brand-a");
  assert.equal(result.rows[0].sessionCount, 2);
  assert.equal(result.rows[0].batchCount, 1);
  assert.equal(result.rows[0].totalGmv, 150);
  assert.deepEqual(result.rows[0].platforms, ["TikTok Live"]);
});

test("getAvailableShiftsForBrand merges brand logs, sessions, and master system shifts", () => {
  const shifts = getAvailableShiftsForBrand(
    "brand-a",
    {
      id: "brand-a",
      name: "Alpha",
      sessions: [{ shift: "D2 (18.00)-(23.59)" }],
    } as any,
    [
      {
        id: "log-1",
        brandId: "brand-a",
        shift: "M1 (05.30-12.30)",
        date: "2026-07-01",
      } as any,
    ],
    ["Reg 1 (08.00-14.00)", "M4 (23.30-05.30)"]
  );

  assert.ok(shifts.includes("M1 (05.30-12.30)"));
  assert.ok(shifts.includes("D2 (18.00)-(23.59)"));
  assert.ok(shifts.includes("Reg 1 (08.00-14.00)"));
  assert.ok(shifts.includes("M4 (23.30-05.30)"));
});

