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
