import assert from "node:assert/strict";
import test from "node:test";

import {
  parseReportingUploadRows,
  parseSkuUploadRows,
} from "../src/shared/utils/xlsxUploadParsers";

test("parseSkuUploadRows maps sku workbook rows", () => {
  const rows = [
    ["laporan", "2026-07-01"],
    ["SKU", "Nama Produk", "Items Sold", "Revenue", "Date"],
    ["sku-1", "Alpha", "2", "Rp 15.000", "2026-07-02"],
  ];

  const parsed = parseSkuUploadRows(rows, "alpha-export-2026-07.xlsx");

  assert.equal(parsed.length, 1);
  assert.deepEqual(parsed[0], {
    id: parsed[0].id,
    sku: "sku-1",
    productName: "Alpha",
    sold: 2,
    revenue: 15000,
    date: "2026-07-02",
  });
});

test("parseReportingUploadRows maps reporting workbook rows", () => {
  const rows = [
    [
      "Nama Livestream",
      "Start Time",
      "Durasi",
      "GMV",
      "Produk Terjual",
      "Pembeli",
      "Views",
      "Impressions",
      "Penonton",
      "Penonton Aktif",
      "Product Views",
      "Clicks",
      "Orders",
      "Pengikut Baru",
      "Suka",
      "Dibagikan",
      "Komentar",
      "Avg. Watch Duration",
      "Peak Viewers",
      "Voucher Toko Diklaim",
      "Voucher Spesial Live Diklaim",
      "Koin Diklaim",
    ],
    [
      "Session 1",
      "2026-07-01 13:05",
      "01:02:03",
      "Rp 1.500.000",
      "12",
      "10",
      "100",
      "200",
      "150",
      "20",
      "30",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "00:02:00",
      "25",
      "1",
      "2",
      "3",
    ],
  ];

  const parsed = parseReportingUploadRows(rows, [
    "Shift Pagi (06:00 - 10:00)",
    "Shift Siang (10:00 - 14:00)",
    "Shift Sore (14:00 - 18:00)",
    "Shift Malam (18:00 - 22:00)",
  ]);

  assert.equal(parsed.length, 1);
  assert.deepEqual(parsed[0], {
    title: "Session 1",
    date: "2026-07-01",
    dateTime: "2026-07-01 13:05",
    shift: "Shift Siang (10:00 - 14:00)",
    duration: 3723,
    gmv: 1500000,
    products_sold: 12,
    buyers: 10,
    aov: 300000,
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
  });
});

test("parseReportingUploadRows computes TikTok live duration and AOV from raw columns", () => {
  const rows = [
    [
      "Room ID",
      "Room Title",
      "Start Time",
      "End Time",
      "Attributed GMV",
      "Attributed items sold",
      "Attributed orders",
      "Customers",
      "AOV",
      "Views",
      "Impressions",
      "Avg. viewing duration",
      "Product clicks",
      "Likes",
      "Comments",
      "Shares",
      "News followers",
    ],
    [
      "7590640393755052821",
      "PROMO ISAGO✨💎💍",
      "2026-01-02 13:01:55",
      "2026-01-02 15:00:54",
      "Rp5,4JT",
      "3",
      "3",
      "1",
      "Rp1,8JT",
      "547",
      "7.72K",
      "45.77s",
      "294",
      "1.11K",
      "55",
      "0",
      "3",
    ],
  ];

  const parsed = parseReportingUploadRows(rows, [
    "Shift Pagi (06:00 - 10:00)",
    "Shift Siang (10:00 - 14:00)",
    "Shift Sore (14:00 - 18:00)",
    "Shift Malam (18:00 - 22:00)",
  ]);

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].gmv, 5400000);
  assert.equal(parsed[0].products_sold, 3);
  assert.equal(parsed[0].buyers, 1);
  assert.equal(parsed[0].orders, 3);
  assert.equal(parsed[0].aov, 1800000);
  assert.equal(parsed[0].duration, 7139);
});
