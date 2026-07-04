import assert from "node:assert/strict";
import test from "node:test";

import { buildSkuUploadHistoryRows } from "../src/shared/utils/skuUploadHistory";
import type { SkuLogEntry } from "../src/shared/types/reporting";

const logs: SkuLogEntry[] = [
  {
    id: "1",
    brandId: "brand-a",
    date: "2026-07-01",
    platform: "Shopee Live",
    batchId: "batch-a",
    uploadedAt: "2026-07-01T10:00:00.000Z",
    sku: "SKU-1",
    productName: "Produk A",
    sold: 1,
    revenue: 1000,
  },
  {
    id: "2",
    brandId: "brand-a",
    date: "2026-07-01",
    platform: "Shopee Live",
    batchId: "batch-a",
    uploadedAt: "2026-07-01T10:00:00.000Z",
    sku: "SKU-2",
    productName: "Produk B",
    sold: 2,
    revenue: 2000,
  },
  {
    id: "3",
    brandId: "brand-a",
    date: "2026-07-02",
    platform: "Shopee Live",
    batchId: "batch-b",
    uploadedAt: "2026-07-02T10:00:00.000Z",
    sku: "SKU-3",
    productName: "Produk C",
    sold: 3,
    revenue: 3000,
  },
];

test("buildSkuUploadHistoryRows groups batches and sorts newest first", () => {
  const rows = buildSkuUploadHistoryRows(logs);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].batchId, "batch-b");
  assert.equal(rows[0].records, 1);
  assert.equal(rows[1].batchId, "batch-a");
  assert.equal(rows[1].records, 2);
});
