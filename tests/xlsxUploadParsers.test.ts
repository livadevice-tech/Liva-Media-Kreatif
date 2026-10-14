import assert from "node:assert/strict";
import test from "node:test";

import { parseReportingUploadRows } from "../src/shared/utils/xlsxUploadParsers";

test("parseReportingUploadRows reads Shopee avg view duration header variants", () => {
  const rows = [
    [
      "Nama Livestream",
      "Waktu Mulai",
      "GMV",
      "Produk Terjual",
      "Pembeli",
      "Views",
      "Penonton",
      "Klik Produk",
      "Orders",
      "Durasi   Rata - Rata   Menonton",
    ],
    [
      "Live 1",
      "2024-05-01 10:00",
      "100000",
      "2",
      "3",
      "10",
      "11",
      "4",
      "5",
      "00:01:30",
    ],
  ] as const;

  const parsed = parseReportingUploadRows(rows, []);

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].avgViewDuration, 90);
  assert.equal(parsed[0].gmv, 100000);
  assert.equal(parsed[0].orders, 5);
});

test("parseReportingUploadRows converts Excel fraction durations into seconds", () => {
  const rows = [
    [
      "Periode Data",
      "User Id",
      "No.",
      "Nama Livestream",
      "Start Time",
      "Durasi",
      "Penonton Aktif",
      "Komentar",
      "Tambah ke Keranjang",
      "Durasi Rata-Rata Menonton",
      "Penonton",
      "Pesanan(Pesanan Dibuat)",
      "Pesanan(Pesanan Siap Dikirim)",
      "Produk Terjual(Pesanan Dibuat)",
      "Produk Terjual(Pesanan Siap Dikirim)",
      "Penjualan(Pesanan Dibuat)",
      "Penjualan(Pesanan Siap Dikirim)",
    ],
    [
      "01-01-2026 - 31-01-2026",
      138166366,
      164,
      "SARIAYU FLASH SALE DISC UP TO 50%",
      46023.248611111114,
      0.0853125,
      36,
      6,
      55,
      0.00028935185185185184,
      782,
      9,
      6,
      21,
      11,
      937747,
      437109,
    ],
  ] as const;

  const parsed = parseReportingUploadRows(rows, []);

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].avgViewDuration, 25);
  assert.equal(parsed[0].duration, 7371);
});

test("parseReportingUploadRows prioritizes Confirmed Order over Placed Order and parses ATC/Engaged Viewers for Shopee", () => {
  const rows = [
    [
      "Data Period",
      "User Id",
      "No.",
      "Livestream Name",
      "Start Time",
      "Duration:",
      "Engaged Viewers",
      "Comments",
      "ATC",
      "Avg. Viewing Duration",
      "Viewers",
      "Orders(Placed Order)",
      "Orders(Confirmed Order)",
      "Items Sold(Placed Order)",
      "Items Sold(Confirmed Order)",
      "Sales(Placed Order)",
      "Sales(Confirmed Order)",
    ],
    [
      "10-10-20",
      6382511,
      1,
      "SAFI SP",
      "10-10-20",
      "18:01:32",
      1231,
      721,
      1818,
      "00:01:07",
      7824,
      518,
      478,
      658,
      607,
      "Rp60.967.236",
      "Rp55.800.867",
    ],
    [
      "10-10-20",
      6382511,
      2,
      "SAFI SP",
      "10-10-20",
      "01:03:22",
      109,
      54,
      153,
      "00:00:51",
      714,
      40,
      39,
      50,
      48,
      "Rp4.793.349",
      "Rp4.631.149",
    ],
    [
      "10-10-20",
      6382511,
      3,
      "SAFI SP",
      "10-10-20",
      "02:40:12",
      97,
      50,
      162,
      "00:00:36",
      1076,
      57,
      31,
      915,
      37,
      "Rp94.820.403",
      "Rp3.400.011",
    ],
    [
      "10-10-20",
      6382511,
      4,
      "SAFI SP",
      "10-10-20",
      "02:00:46",
      372,
      107,
      708,
      "00:00:55",
      2420,
      173,
      153,
      210,
      188,
      "Rp17.215.905",
      "Rp14.446.428",
    ],
  ] as const;

  const parsed = parseReportingUploadRows(rows, [], "Shopee Live", "live");

  assert.equal(parsed.length, 4);

  // Row 1 checks
  assert.equal(parsed[0].gmv, 55800867); // Confirmed, not 60967236
  assert.equal(parsed[0].products_sold, 607); // Confirmed, not 658
  assert.equal(parsed[0].orders, 478); // Confirmed, not 518
  assert.equal(parsed[0].clicks, 1818); // ATC
  assert.equal(parsed[0].views, 7824); // Viewers
  assert.equal(parsed[0].liveVisits, 1231); // Engaged Viewers
  assert.equal(parsed[0].avgViewDuration, 67); // 00:01:07

  // Row 3 checks (where Placed Order was wildly inflated: 94.8M vs 3.4M Confirmed)
  assert.equal(parsed[2].gmv, 3400011);
  assert.equal(parsed[2].products_sold, 37);
  assert.equal(parsed[2].orders, 31);

  // Totals verification
  const totalGmv = parsed.reduce((sum, r) => sum + r.gmv, 0);
  const totalItemsSold = parsed.reduce((sum, r) => sum + r.products_sold, 0);
  const totalOrders = parsed.reduce((sum, r) => sum + r.orders, 0);
  const totalClicks = parsed.reduce((sum, r) => sum + r.clicks, 0);

  assert.equal(totalGmv, 78278455); // Confirmed Order sum, NOT 177796893
  assert.equal(totalItemsSold, 880); // Confirmed Order sum, NOT 1833
  assert.equal(totalOrders, 701); // Confirmed Order sum, NOT 788
  assert.equal(totalClicks, 2841); // Sum of ATC
});
