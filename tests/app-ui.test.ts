import assert from "node:assert/strict";
import test from "node:test";

import {
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
