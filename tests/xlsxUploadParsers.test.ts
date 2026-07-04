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
