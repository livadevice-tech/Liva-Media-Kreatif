import assert from "node:assert/strict";
import test from "node:test";

import {
  formatContractDate,
  normalizeDateStr,
  padLocal,
} from "../src/shared/utils/dateFormatting";

test("formatContractDate converts ISO dates to DD/MM/YYYY", () => {
  assert.equal(formatContractDate("2026-07-02T10:15:00Z"), "02/07/2026");
  assert.equal(formatContractDate(undefined), "—");
});

test("normalizeDateStr converts common date formats to YYYY-MM-DD", () => {
  assert.equal(normalizeDateStr("02/07/2026"), "2026-07-02");
  assert.equal(normalizeDateStr("2-7-26"), "2026-07-02");
  assert.equal(normalizeDateStr("2026-7-2"), "2026-07-02");
});

test("padLocal returns two digit strings", () => {
  assert.equal(padLocal(3), "03");
  assert.equal(padLocal(12), "12");
});
