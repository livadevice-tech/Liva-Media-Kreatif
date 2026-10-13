import assert from "node:assert/strict";
import test from "node:test";

import {
  DateSpecificShiftRule,
  filterLogsByDateAndShift,
  formatDisplayDate,
  getLogTimestamp,
  getShiftFromHour,
  isPlatformMatch,
  normalizeDateYMD,
  computeDurationCutoffs,
  formatDurationHoursMinutes,
} from "../src/shared/utils/appUi";

test("normalizeDateYMD converts common input formats into YYYY-MM-DD", () => {
  assert.equal(normalizeDateYMD("01/02/2026"), "2026-02-01");
  assert.equal(normalizeDateYMD("2026-02-01T13:45:00Z"), "2026-02-01");
  assert.equal(normalizeDateYMD("2026/2/3"), "2026-02-03");
});

test("formatDisplayDate keeps Shopee Live dates without injecting time", () => {
  assert.equal(
    formatDisplayDate("2026-07-02T10:15:00Z", "Shopee Live"),
    "02-07-2026",
  );
  assert.equal(
    formatDisplayDate("2026-07-02T10:15:00Z", "TikTok"),
    "02-07-2026 10:15",
  );
});

test("isPlatformMatch treats blank and generic platform filters as matches", () => {
  assert.equal(isPlatformMatch("TikTok Shop", ""), true);
  assert.equal(isPlatformMatch("TikTok Shop", "Semua Platform"), true);
  assert.equal(isPlatformMatch("TikTok Shop", "tiktok"), true);
  assert.equal(isPlatformMatch("TikTok Shop", "Shopee"), false);
});

test("getShiftFromHour returns the matching shift window", () => {
  const shifts = ["Pagi (06:00 - 14:00)", "Sore (14:00 - 22:00)"];

  assert.equal(getShiftFromHour(7, shifts), "Pagi (06:00 - 14:00)");
  assert.equal(getShiftFromHour(21, shifts), "Sore (14:00 - 22:00)");
  assert.equal(getShiftFromHour(23, shifts), undefined);
});

test("getLogTimestamp parses date and start time accurately for ASC/DESC sorting", () => {
  const log1 = { date: "2026-10-04", dateTime: "2026-10-04 10:00:00" };
  const log2 = { date: "2026-10-04", dateTime: "2026-10-04 14:00:00" };
  const log3 = { date: "2026-10-05", dateTime: "2026-10-05 09:00:00" };

  const t1 = getLogTimestamp(log1);
  const t2 = getLogTimestamp(log2);
  const t3 = getLogTimestamp(log3);

  assert.ok(t1 < t2, "10:00 should be earlier than 14:00 on the same date");
  assert.ok(t2 < t3, "14:00 on 4 Oct should be earlier than 09:00 on 5 Oct");

  const list = [log2, log3, log1];
  const sortedAsc = [...list].sort((a, b) => getLogTimestamp(a) - getLogTimestamp(b));
  assert.deepEqual(sortedAsc, [log1, log2, log3], "ASC sort should order chronologically");

  const sortedDesc = [...list].sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a));
  assert.deepEqual(sortedDesc, [log3, log2, log1], "DESC sort should order newest first");
});

test("filterLogsByDateAndShift correctly filters logs with date-specific shift rules", () => {
  const shiftsConfig = [
    "Shift SA 1 (00.00-06.00)",
    "Shift SA 2 (06.00-12.00)",
    "Shift SA 3 (12.00-18.00)",
    "Shift SA 4 (18.00-24.00)",
  ];

  const log1 = {
    id: "1",
    date: "2026-08-08",
    shift: "Shift SA 1 (00.00-06.00)",
    startTime: "02:00",
  };
  const log2 = {
    id: "2",
    date: "2026-08-08",
    shift: "Shift SA 2 (06.00-12.00)",
    startTime: "08:00",
  };
  const log3 = {
    id: "3",
    date: "2026-08-09",
    shift: "Shift SA 2 (06.00-12.00)",
    startTime: "09:00",
  };
  const log4 = {
    id: "4",
    date: "2026-08-09",
    shift: "Shift SA 3 (12.00-18.00)",
    startTime: "13:00",
  };

  const logs = [log1, log2, log3, log4];

  // Case 1: Specific only mode - only 8 Agustus 2026 Shift SA 1
  const rules: DateSpecificShiftRule[] = [
    { date: "2026-08-08", shift: "Shift SA 1 (00.00-06.00)" },
  ];
  const resSpecificOnly = filterLogsByDateAndShift(
    logs,
    [],
    rules,
    "specific_only",
    shiftsConfig,
  );
  assert.equal(resSpecificOnly.length, 1);
  assert.equal(resSpecificOnly[0].id, "1");

  // Case 2: Merged mode - general shift filter is Shift SA 2, plus specific rule for 8 Agustus Shift SA 1
  const resMerged = filterLogsByDateAndShift(
    logs,
    ["Shift SA 2 (06.00-12.00)"],
    rules,
    "merged",
    shiftsConfig,
  );
  // On 2026-08-08, only Shift SA 1 matches (overriding general). On 2026-08-09, general Shift SA 2 matches.
  assert.equal(resMerged.length, 2);
  assert.deepEqual(
    resMerged.map((l) => l.id).sort(),
    ["1", "3"],
  );

  // Case 3: No rules, general filter only
  const resGeneral = filterLogsByDateAndShift(
    logs,
    ["Shift SA 3 (12.00-18.00)"],
    [],
    "merged",
    shiftsConfig,
  );
  assert.equal(resGeneral.length, 1);
  assert.equal(resGeneral[0].id, "4");
});

test("computeDurationCutoffs accurately calculates 360-hour cutoffs and handles surplus & remaining hours", () => {
  // Empty logs test
  const emptyRes = computeDurationCutoffs([], 360);
  assert.equal(emptyRes.batches.length, 0);
  assert.equal(emptyRes.completedBatchesCount, 0);

  // 1 session of 200 hours, 1 session of 165 hours -> total 365 hours (surplus 5 hours)
  const logs1 = [
    {
      id: "log1",
      date: "2026-10-01",
      dateTime: "2026-10-01 08:00:00",
      shift: "Shift 1",
      duration: 200 * 3600,
      gmv: 10000000,
      orders: 100,
    },
    {
      id: "log2",
      date: "2026-10-10",
      dateTime: "2026-10-10 14:00:00",
      shift: "Shift 2",
      duration: 165 * 3600,
      gmv: 8000000,
      orders: 80,
    },
    {
      id: "log3",
      date: "2026-10-15",
      dateTime: "2026-10-15 08:00:00",
      shift: "Shift 1",
      duration: 50 * 3600,
      gmv: 2000000,
      orders: 20,
    },
  ];

  const res = computeDurationCutoffs(logs1, 360);
  assert.equal(res.batches.length, 2, "Should create 1 completed batch and 1 remaining batch");
  assert.equal(res.completedBatchesCount, 1);

  // Batch 1: Completed at log2 (total 365h >= 360h)
  const batch1 = res.batches[0];
  assert.equal(batch1.batchNumber, 1);
  assert.equal(batch1.isCompleted, true);
  assert.equal(batch1.totalDurationSeconds, 365 * 3600);
  assert.equal(batch1.surplusSeconds, 5 * 3600);
  assert.equal(batch1.remainingSeconds, 0);
  assert.equal(batch1.sessionCount, 2);
  assert.equal(batch1.startDate, "2026-10-01");
  assert.equal(batch1.startShift, "Shift 1");
  assert.equal(batch1.endDate, "2026-10-10");
  assert.equal(batch1.endShift, "Shift 2");
  assert.equal(batch1.cutoffTriggerLog.id, "log2");
  assert.equal(batch1.totalGmv, 18000000);
  assert.equal(batch1.totalOrders, 180);

  // Batch 2: In-progress leftover (50h of 360h)
  const batch2 = res.batches[1];
  assert.equal(batch2.batchNumber, 2);
  assert.equal(batch2.isCompleted, false);
  assert.equal(batch2.totalDurationSeconds, 50 * 3600);
  assert.equal(batch2.remainingSeconds, 310 * 3600);
  assert.equal(batch2.sessionCount, 1);
  assert.equal(batch2.startDate, "2026-10-15");
  assert.equal(batch2.endDate, "2026-10-15");

  // Format check
  assert.equal(formatDurationHoursMinutes(365 * 3600), "365 Jam");
  assert.equal(formatDurationHoursMinutes(360 * 3600 + 1800), "360 Jam 30 Menit");
});

test("exportReportToExcel formats cells with true Excel data types and formulas on cutoff totals", async () => {
  const XLSX = await import("xlsx");
  const fs = await import("fs");
  if (typeof (XLSX as any).set_fs === "function") {
    (XLSX as any).set_fs(fs);
  }
  const { exportReportToExcel } = await import("../src/shared/utils/excelExportUtils");

  const mockLogs = [
    {
      dateTime: "19-08-2026 05:21:13",
      platform: "TikTok Live",
      shift: "05:00 - 09:00",
      duration: 1 * 3600 + 39 * 60 + 33,
      gmv: 230229.99,
      items_sold: 2,
      orders: 2,
      customers: 2,
      clicks: 43,
      penonton: 1505,
    },
    {
      dateTime: "20-08-2026 01:02:06",
      platform: "TikTok Live",
      shift: "01:00 - 05:00",
      duration: 3 * 3600 + 57 * 60 + 30,
      gmv: 501926.01,
      items_sold: 5,
      orders: 3,
      customers: 3,
      clicks: 84,
      penonton: 2798,
    },
  ];

  exportReportToExcel({
    reportType: "live",
    selectedMetrics: ["date", "time", "platform", "shift", "duration", "gmv", "items_sold", "orders", "buyers", "aov", "clicks", "penonton", "conversion_rate"],
    brandName: "UnitTestBrand",
    liveReportView: { filteredDb: mockLogs },
    platformFilter: "TikTok Live",
    exportMode: "sessions",
    enableDurationCutoff: true,
    cutoffTargetHours: 5,
  });

  const filename = "Laporan_UnitTestBrand_TikTok_Live_Per_Sesi.xlsx";
  assert.equal(fs.existsSync(filename), true, "Export file must be generated");

  try {
    const wb = XLSX.readFile(filename, { cellNF: true, cellDates: true, cellStyles: true });
    const sheet = wb.Sheets["Sesi Live"];
    assert.ok(sheet, "Worksheet Sesi Live must exist");

    const ref = XLSX.utils.decode_range(sheet["!ref"]!);
    const colMap: Record<string, string> = {};
    for (let c = ref.s.c; c <= ref.e.c; ++c) {
      const h = sheet[XLSX.utils.encode_cell({ r: 0, c })]?.v;
      if (h) colMap[String(h)] = XLSX.utils.encode_col(c);
    }

    // 1. Data Row Check (Row 2): proper data types
    const r2Date = sheet[colMap["Tanggal & Jam Mulai"] + "2"];
    const r2Dur = sheet[colMap["Durasi Live"] + "2"];
    const r2Gmv = sheet[colMap["GMV (Rp)"] + "2"];
    assert.equal(r2Date.t, "d", "Date cell must have date type 'd'");
    assert.equal(r2Dur.z, "hh:mm:ss", "Duration cell must have duration format hh:mm:ss");
    assert.ok(r2Gmv.z.includes("Rp"), "GMV cell must have Rp currency format");
    assert.equal(typeof r2Gmv.v, "number", "GMV value must be numeric");

    // 2. Cutoff Subtotal Row Check (Row 4): formula calculations
    const r4No = sheet[colMap["No"] + "4"];
    const r4Dur = sheet[colMap["Durasi Live"] + "4"];
    const r4Gmv = sheet[colMap["GMV (Rp)"] + "4"];
    const r4Orders = sheet[colMap["Orders"] + "4"];
    const r4Aov = sheet[colMap["AOV (Rp)"] + "4"];
    const r4CR = sheet[colMap["Conversion Rate (%)"] + "4"];

    assert.equal(r4No.v, "TOTAL");
    assert.ok(r4Dur.f?.startsWith("SUM("), "Total duration must have SUM formula");
    assert.equal(r4Dur.z, "[hh]:mm:ss", "Total duration format must be [hh]:mm:ss");
    assert.ok(r4Gmv.f?.startsWith("SUM("), "Total GMV must have SUM formula");
    assert.ok(r4Orders.f?.startsWith("SUM("), "Total Orders must have SUM formula");
    assert.ok(r4Aov.f?.startsWith("IF("), "Total AOV must have IF formula");
    assert.ok(r4CR.f?.startsWith("IF("), "Total CR must have IF formula");

    // Column widths check
    assert.ok(sheet["!cols"] && sheet["!cols"].length > 0, "Worksheet must have auto-fit column widths");
  } finally {
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
  }
});



