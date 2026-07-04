import assert from "node:assert/strict";
import test from "node:test";

import { parseNestedJsonValue } from "../src/shared/config/globalConfig";

test("parseNestedJsonValue returns objects unchanged", () => {
  const value = { brands: ["A"], shifts: ["Pagi"] };

  assert.deepEqual(parseNestedJsonValue(value), value);
});

test("parseNestedJsonValue parses nested JSON strings", () => {
  const value = JSON.stringify(JSON.stringify({ brands: ["A"] }));

  assert.deepEqual(parseNestedJsonValue(value), { brands: ["A"] });
});

test("parseNestedJsonValue rejects invalid payloads", () => {
  assert.equal(parseNestedJsonValue("not-json"), null);
  assert.equal(parseNestedJsonValue(JSON.stringify("still-a-string")), null);
});
