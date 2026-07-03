import assert from "node:assert/strict";
import test from "node:test";

import { formatDateTimeSafe } from "../src/shared/utils/dateTime";

test("formatDateTimeSafe returns a readable Indonesian date string", () => {
  const output = formatDateTimeSafe("2026-07-02T10:15:00Z");

  assert.match(output, /^\d{2} \w{3} \d{4}, \d{2}\.\d{2}$/);
});

test("formatDateTimeSafe returns fallback values for missing or invalid input", () => {
  assert.equal(formatDateTimeSafe(undefined), "-");
  assert.equal(formatDateTimeSafe("not-a-date"), "not-a-date");
});
