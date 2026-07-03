import assert from "node:assert/strict";
import test from "node:test";

import {
  canAccessDbTest,
  createSessionToken,
  hashPasswordForStorage,
  isRequestAllowed,
  parseSessionToken,
  verifyStoredPassword,
} from "../server/auth";
import { canAccessAnyTab, MODULE_TAB_REQUIREMENTS } from "../src/shared/auth/access";

const secret = "test-session-secret-with-enough-entropy";

test("signed sessions round-trip without exposing the signing secret", () => {
  const token = createSessionToken(
    { role: "host", subjectId: "host_1", expiresAt: 2_000_000_000 },
    secret,
  );

  assert.deepEqual(parseSessionToken(token, secret, 1_900_000_000), {
    role: "host",
    subjectId: "host_1",
    expiresAt: 2_000_000_000,
  });
  assert.equal(token.includes(secret), false);
});

test("signed sessions reject tampering and expiry", () => {
  const token = createSessionToken(
    { role: "brand", subjectId: "brand_1", expiresAt: 2_000_000_000 },
    secret,
  );

  assert.equal(parseSessionToken(`${token}x`, secret, 1_900_000_000), null);
  assert.equal(parseSessionToken(token, secret, 2_000_000_001), null);
});

test("legacy SHA-256 passwords remain verifiable during migration", () => {
  const stored =
    "sha256:2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b";

  assert.equal(verifyStoredPassword("secret", stored), true);
  assert.equal(verifyStoredPassword("wrong", stored), false);
});

test("new password hashes use unique salted scrypt values", () => {
  const first = hashPasswordForStorage("secret");
  const second = hashPasswordForStorage("secret");

  assert.match(first, /^scrypt:/);
  assert.notEqual(first, second);
  assert.equal(verifyStoredPassword("secret", first), true);
  assert.equal(verifyStoredPassword("wrong", first), false);
});

test("host sessions can submit their logs but cannot delete records", () => {
  const session = { role: "host" as const, subjectId: "host_1", expiresAt: 1 };

  assert.equal(isRequestAllowed(session, "POST", "/logs"), true);
  assert.equal(isRequestAllowed(session, "DELETE", "/logs/log_1"), false);
  assert.equal(isRequestAllowed(session, "GET", "/hosts/host_2"), false);
});

test("brand sessions can only open their own brand profile", () => {
  const session = { role: "brand" as const, subjectId: "brand_1", expiresAt: 1 };

  assert.equal(isRequestAllowed(session, "GET", "/client-brands/brand_1"), true);
  assert.equal(isRequestAllowed(session, "GET", "/client-brands/brand_2"), false);
  assert.equal(isRequestAllowed(session, "POST", "/reporting/brand/batch"), false);
});

test("custom admin sessions can only mutate routes for granted tabs", () => {
  const session = {
    role: "admin" as const,
    subjectId: "admin_1",
    expiresAt: 1,
    accessTabs: ["credentials", "settings", "reporting_brand"],
  };

  assert.equal(isRequestAllowed(session, "POST", "/hosts"), true);
  assert.equal(isRequestAllowed(session, "PUT", "/settings/liva_global_configs"), true);
  assert.equal(isRequestAllowed(session, "POST", "/reporting/brand/batch"), true);
  assert.equal(isRequestAllowed(session, "DELETE", "/client-leads/lead_1"), false);
  assert.equal(isRequestAllowed(session, "POST", "/admin-accounts"), false);
});

test("custom admin sessions can only read routes for granted tabs", () => {
  const session = {
    role: "admin" as const,
    subjectId: "admin_1",
    expiresAt: 1,
    accessTabs: ["credentials", "settings", "reporting_brand"],
  };

  assert.equal(isRequestAllowed(session, "GET", "/hosts"), true);
  assert.equal(isRequestAllowed(session, "GET", "/settings/liva_global_configs"), true);
  assert.equal(isRequestAllowed(session, "GET", "/reporting/brand/summary"), true);
  assert.equal(isRequestAllowed(session, "GET", "/client-leads"), false);
  assert.equal(isRequestAllowed(session, "GET", "/admin-accounts"), false);
});

test("shared tab helper matches module requirements", () => {
  const accessTabs = ["settings", "reporting_brand"];

  assert.equal(canAccessAnyTab(accessTabs, MODULE_TAB_REQUIREMENTS.settings), true);
  assert.equal(canAccessAnyTab(accessTabs, MODULE_TAB_REQUIREMENTS.invoice), false);
});

test("db test access is limited to master and admin sessions", () => {
  assert.equal(canAccessDbTest({ role: "master", subjectId: "m", expiresAt: 1 }), true);
  assert.equal(canAccessDbTest({ role: "admin", subjectId: "a", expiresAt: 1 }), true);
  assert.equal(canAccessDbTest({ role: "host", subjectId: "h", expiresAt: 1 }), false);
  assert.equal(canAccessDbTest(null), false);
});
