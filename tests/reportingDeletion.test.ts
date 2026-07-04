import assert from "node:assert/strict";
import test from "node:test";

import {
  filterItemsWithinDateRange,
  isDateWithinInclusiveRange,
  normalizeDateForRangeComparison,
} from "../src/shared/utils/reportingDeletion";

test("normalizeDateForRangeComparison converts mixed date formats", () => {
  assert.equal(normalizeDateForRangeComparison("01/07/2026"), "2026-07-01");
  assert.equal(normalizeDateForRangeComparison("2026-07-02T10:00:00Z"), "2026-07-02");
});

test("isDateWithinInclusiveRange handles inclusive comparisons", () => {
  assert.equal(isDateWithinInclusiveRange("2026-07-01", "2026-07-01", "2026-07-03"), true);
  assert.equal(isDateWithinInclusiveRange("2026-06-30", "2026-07-01", "2026-07-03"), false);
});

test("filterItemsWithinDateRange keeps matching items and preserves custom predicates", () => {
  const rows = [
    { id: "1", date: "2026-07-01" },
    { id: "2", date: "2026-07-04" },
    { id: "3", date: "2026-07-02" },
  ];

  const filtered = filterItemsWithinDateRange(rows, "2026-07-01", "2026-07-03", (row) => row.id !== "2");

  assert.deepEqual(
    filtered.map((row) => row.id),
    ["1", "3"],
  );
});
