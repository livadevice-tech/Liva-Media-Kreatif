import assert from "node:assert/strict";
import test from "node:test";

import { getIndonesianMockResponse } from "../src/shared/utils/copilotFallback";

const reports = [
  {
    name: "Amanda Putri",
    countTepatWaktu: 8,
    countTerlambat: 1,
    countAlpa: 0,
    totalHadir: 9,
    netSalary: 4800000,
  },
  {
    name: "Budi",
    countTepatWaktu: 3,
    countTerlambat: 2,
    countAlpa: 1,
    totalHadir: 5,
    netSalary: 3100000,
  },
];

const context = {
  timelyIncentive: 250000,
  latePenalty: 50000,
  punctualityRate: 82,
  totalLogs: 24,
};

test("getIndonesianMockResponse returns a performance summary", () => {
  const response = getIndonesianMockResponse("ringkasan performa minggu ini", reports, context);

  assert.match(response, /Ringkasan Performa Kehadiran Tim Minggu Ini/);
  assert.match(response, /\*\*Tingkat On-Time \(Punctuality\)\*\*: \*\*79%\*\*/);
});

test("getIndonesianMockResponse returns salary recap with the top earner", () => {
  const response = getIndonesianMockResponse("rekap gaji host", reports, context);

  assert.match(response, /Amanda Putri/);
  assert.match(response, /Rp\s?4\.800\.000/);
  assert.match(response, /Rp\s?250\.000/);
});

test("getIndonesianMockResponse returns anomaly guidance when attendance issues are mentioned", () => {
  const response = getIndonesianMockResponse("ada masalah absen", reports, context);

  assert.match(response, /Laporan Anomali Kehadiran & Kedisiplinan/);
  assert.match(response, /Rp\s?50\.000/);
  assert.match(response, /Budi/);
});

test("getIndonesianMockResponse falls back to the default dashboard summary", () => {
  const response = getIndonesianMockResponse("halo", reports, context);

  assert.match(response, /Kehadiran Tepat Waktu Tim: \*\*82%\*\*/);
  assert.match(response, /Total log tersimpan: \*\*24\*\*/);
});
