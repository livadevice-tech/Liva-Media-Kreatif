import assert from "node:assert/strict";
import test from "node:test";

import { formatDateUILocal } from "../src/shared/utils/date";

test("formatDateUILocal keeps invoice timestamps in the browser timezone", () => {
  const value = "2026-01-01T20:00:00Z";
  const date = new Date(value);
  const expectedDay = String(date.getDate()).padStart(2, "0");
  const expectedMonth = String(date.getMonth() + 1).padStart(2, "0");
  const expectedYear = date.getFullYear();

  assert.match(
    formatDateUILocal(value),
    new RegExp(`^${expectedDay}/${expectedMonth}/${expectedYear}`),
  );
});
