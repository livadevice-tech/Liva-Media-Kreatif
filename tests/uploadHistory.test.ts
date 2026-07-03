import test from "node:test";
import assert from "node:assert/strict";
import { buildActiveReportBrandUploadHistory } from "../src/shared/utils/uploadHistory";

const brandPerformanceLogs = [
  {
    id: "log-1",
    brandId: "brand-a",
    reportType: "live",
    batchId: "batch-1",
    brandName: "Brand A",
    platform: "Tiktok",
    uploadedAt: "2024-06-02T10:00:00.000Z",
    gmv: 100,
  },
  {
    id: "log-2",
    brandId: "brand-a",
    reportType: "live",
    batchId: "batch-1",
    brandName: "Brand A",
    platform: "Tiktok",
    uploadedAt: "2024-06-02T10:00:00.000Z",
    gmv: 250,
  },
  {
    id: "log-3",
    brandId: "brand-a",
    reportType: "engagement",
    batchId: "batch-2",
    brandName: "Brand A",
    platform: "Shopee",
    uploadedAt: "2024-06-03T10:00:00.000Z",
    gmv: 999,
  },
  {
    id: "log-4",
    brandId: "brand-b",
    reportType: "live",
    batchId: "batch-9",
    brandName: "Brand B",
    platform: "Tiktok",
    uploadedAt: "2024-06-04T10:00:00.000Z",
    gmv: 500,
  },
] as const;

const brandUploadHistory = [
  {
    id: "batch-1",
    brandId: "brand-a",
    brandName: "Brand A",
    platform: "Tiktok",
    fileName: "existing.csv",
    uploadedAt: "2024-06-01T10:00:00.000Z",
    rowCount: 1,
  },
] as const;

const uploadHistory = [
  {
    id: "manual-1",
    brandId: "brand-a",
    brandName: "Brand A",
    platform: "Shopee",
    fileName: "manual.csv",
    uploadedAt: "2024-06-05T10:00:00.000Z",
    rowCount: 2,
  },
  {
    id: "manual-2",
    brandId: "brand-a",
    reportType: "engagement",
    brandName: "Brand A",
    platform: "Shopee",
    fileName: "engagement.csv",
    uploadedAt: "2024-06-06T10:00:00.000Z",
    rowCount: 2,
  },
] as const;

test("buildActiveReportBrandUploadHistory merges saved, derived, and local histories", () => {
  const result = buildActiveReportBrandUploadHistory({
    activeReportBrandId: "brand-a",
    brandPerformanceLogs,
    brandUploadHistory,
    uploadHistory,
  });

  assert.equal(result.length, 2);
  assert.equal(result[0].id, "manual-1");
  assert.equal(result[1].id, "batch-1");
  assert.equal(result.some((item) => item.id === "manual-2"), false);
});

test("buildActiveReportBrandUploadHistory returns empty array for missing brand", () => {
  const result = buildActiveReportBrandUploadHistory({
    activeReportBrandId: "",
    brandPerformanceLogs,
    brandUploadHistory,
    uploadHistory,
  });

  assert.deepEqual(result, []);
});
