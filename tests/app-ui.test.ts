import assert from "node:assert/strict";
import test from "node:test";

import {
  formatDisplayDate,
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
