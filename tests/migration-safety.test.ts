import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("initial migration stays inside the database selected by DB_NAME", () => {
  const sql = readFileSync(
    new URL("../scripts/migrations/001_initial_schema.sql", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(sql, /\bCREATE\s+DATABASE\b/i);
  assert.doesNotMatch(sql, /\bUSE\s+[`\w-]+/i);
});
