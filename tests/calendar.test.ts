import assert from "node:assert/strict";
import test from "node:test";

import { getPickerDays } from "../src/shared/utils/calendar";

test("getPickerDays always returns a 6-week grid", () => {
  const days = getPickerDays(2026, 6);

  assert.equal(days.length, 42);
  assert.equal(days.filter((day) => day.monthType === "current").length, 31);
  assert.ok(days.some((day) => day.monthType === "current" && day.dateString === "2026-07-01"));
  assert.ok(days.some((day) => day.monthType === "next"));
});
