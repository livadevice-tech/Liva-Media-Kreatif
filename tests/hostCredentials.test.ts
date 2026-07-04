import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeHostStudioLocation,
  resolveHostPasswordHash,
} from "../src/shared/utils/hostCredentials";

test("normalizeHostStudioLocation converts legacy studio names to cities", () => {
  assert.equal(normalizeHostStudioLocation("Studio Bandar Lampung"), "Bandar Lampung");
  assert.equal(normalizeHostStudioLocation("Studio Tanggamus"), "Tanggamus");
  assert.equal(normalizeHostStudioLocation("  Tanggamus  "), "Tanggamus");
});

test("resolveHostPasswordHash preserves the existing hash when password is empty", () => {
  const hashPassword = (password: string) => `hash:${password}`;

  assert.equal(
    resolveHostPasswordHash("", "stored-hash", hashPassword),
    "stored-hash",
  );
  assert.equal(
    resolveHostPasswordHash(undefined, "stored-hash", hashPassword),
    "stored-hash",
  );
  assert.equal(
    resolveHostPasswordHash("new-secret", "stored-hash", hashPassword),
    "hash:new-secret",
  );
});
