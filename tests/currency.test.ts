import assert from "node:assert/strict";
import test from "node:test";

import { formatIDR } from "../src/shared/utils/currency";

test("formatIDR formats values as Indonesian Rupiah", () => {
  const formatted = formatIDR(1234567);

  assert.match(formatted, /^Rp/);
  assert.match(formatted, /1\.234\.567/);
});

test("formatIDR handles zero cleanly", () => {
  assert.match(formatIDR(0), /^Rp/);
});
