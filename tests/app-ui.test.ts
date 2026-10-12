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

