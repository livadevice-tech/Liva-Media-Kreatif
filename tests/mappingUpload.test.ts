import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMappedUploadRows,
  sanitizeMappedNumber,
} from "../src/shared/utils/mappingUpload";

test("sanitizeMappedNumber handles mixed separators and currency text", () => {
  assert.equal(sanitizeMappedNumber("Rp 1.234,50"), 1234.5);
  assert.equal(sanitizeMappedNumber("12.345"), 12345);
  assert.equal(sanitizeMappedNumber("IDR 2,500"), 2500);
});

test("buildMappedUploadRows maps columns and filters invalid totals", () => {
  const rows = buildMappedUploadRows(
    [
      ["Produk A", "1.234,50", "2", "3", "4", "5", "6", "7", "8", "9"],
      ["Total", "10", "10", "10", "10", "10", "10", "10", "10", "10"],
      ["Produk Nol", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
    ],
    {
      date: "0",
      gmv: "1",
      items_sold: "2",
      ctr: "3",
      ctor: "4",
      views: "5",
      viewers: "6",
      impressions: "7",
      clicks: "8",
      orders: "9",
    },
    "TikTok Live",
  );

  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], {
    name: "Produk A",
    platform: "TikTok Live",
    gmv: 1234.5,
    items_sold: 2,
    ctr: 3,
    ctor: 4,
    views: 5,
    viewers: 6,
    impressions: 7,
    clicks: 8,
    orders: 9,
  });
});
