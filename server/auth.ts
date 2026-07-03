import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { AuthRole, AuthSession } from "../src/shared/auth/session";
export type { AuthRole, AuthSession } from "../src/shared/auth/session";
import {
  canAccessAnyTab,
  MODULE_TAB_REQUIREMENTS,
} from "../src/shared/auth/access";
export { canAccessDbTest } from "../src/shared/auth/access";

const AUTH_ROLES = new Set<AuthRole>(["master", "admin", "host", "brand"]);
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSessionToken(
  session: AuthSession,
  secret: string,
): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function parseSessionToken(
  token: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): AuthSession | null {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<AuthSession>;

    if (
      !parsed.role ||
      !AUTH_ROLES.has(parsed.role) ||
      typeof parsed.subjectId !== "string" ||
      !parsed.subjectId ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt < nowSeconds
    ) {
      return null;
    }

    return parsed as AuthSession;
  } catch {
    return null;
  }
}

export function verifyStoredPassword(candidate: string, stored: string): boolean {
  if (!candidate || !stored) return false;

  if (stored.startsWith("scrypt:")) {
    const [, saltValue, hashValue, extra] = stored.split(":");
    if (!saltValue || !hashValue || extra) return false;

    try {
      const expectedBuffer = Buffer.from(hashValue, "base64url");
      const actualBuffer = scryptSync(
        candidate,
        Buffer.from(saltValue, "base64url"),
        expectedBuffer.length,
      );
      return timingSafeEqual(expectedBuffer, actualBuffer);
    } catch {
      return false;
    }
  }

  const expected = stored.startsWith("sha256:")
    ? stored
    : `plain:${stored}`;
  const actual = stored.startsWith("sha256:")
    ? `sha256:${createHash("sha256").update(candidate).digest("hex")}`
    : `plain:${candidate}`;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

export function hashPasswordForStorage(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

function isPathUnder(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

function getAdminRequiredTabs(path: string): readonly string[] | null {
  if (isPathUnder(path, "/admin-accounts")) return MODULE_TAB_REQUIREMENTS.adminAccounts;
  if (isPathUnder(path, "/hosts")) return MODULE_TAB_REQUIREMENTS.hosts;
  if (isPathUnder(path, "/logs")) return MODULE_TAB_REQUIREMENTS.logs;
  if (isPathUnder(path, "/schedules")) return MODULE_TAB_REQUIREMENTS.schedules;
  if (isPathUnder(path, "/alerts")) return MODULE_TAB_REQUIREMENTS.alerts;
  if (isPathUnder(path, "/client-brands")) return MODULE_TAB_REQUIREMENTS.clientBrands;
  if (isPathUnder(path, "/client-leads")) return MODULE_TAB_REQUIREMENTS.clientLeads;
  if (isPathUnder(path, "/client-reporting")) return MODULE_TAB_REQUIREMENTS.clientReporting;
  if (isPathUnder(path, "/reporting/brand")) return MODULE_TAB_REQUIREMENTS.reportingBrand;
  if (isPathUnder(path, "/settings")) return MODULE_TAB_REQUIREMENTS.settings;
  if (isPathUnder(path, "/invoice")) return MODULE_TAB_REQUIREMENTS.invoice;
  if (isPathUnder(path, "/chat")) return MODULE_TAB_REQUIREMENTS.chat;
  if (isPathUnder(path, "/ai")) return MODULE_TAB_REQUIREMENTS.ai;
  return null;
}

export function isRequestAllowed(
  session: AuthSession,
  method: string,
  path: string,
): boolean {
  if (session.role === "master") return true;

  if (session.role === "admin") {
    const requiredTabs = getAdminRequiredTabs(path);
    return requiredTabs ? canAccessAnyTab(session.accessTabs, requiredTabs) : false;
  }

  if (session.role === "host") {
    return (
      (method === "GET" && path === `/hosts/${session.subjectId}`) ||
      (method === "GET" && path === "/logs") ||
      (method === "POST" && path === "/logs") ||
      (method === "GET" && path === "/schedules") ||
      (method === "GET" && path === "/settings/liva_global_configs")
    );
  }

  return (
    (method === "GET" && path === `/client-brands/${session.subjectId}`) ||
    (method === "GET" && path === "/schedules") ||
    (method === "GET" && path === "/client-reporting") ||
    (method === "GET" && path.startsWith("/reporting/brand")) ||
    (method === "GET" && path === "/settings/liva_global_configs")
  );
}

export function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }

  return null;
}
