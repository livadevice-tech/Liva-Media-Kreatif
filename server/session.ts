import type { Request, Response } from "express";
import {
  createSessionToken,
  parseSessionToken,
  readCookie,
  type AuthSession,
  verifyStoredPassword,
} from "./auth";

export const SESSION_COOKIE = "liva_session";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || "";
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("SESSION_SECRET wajib diisi minimal 32 karakter di production");
  }
  return secret || "development-session-secret-change-before-production";
}

export function setSessionCookie(res: Response, token: string, maxAge: number): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`,
  );
}

export function getRequestSession(req: Request): AuthSession | null {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE);
  return token ? parseSessionToken(token, getSessionSecret()) : null;
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function allowLoginAttempt(ip: string): boolean {
  const now = Date.now();
  const current = loginAttempts.get(ip);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (current.count >= 10) return false;
  current.count += 1;
  return true;
}

export function createAuthSessionToken(session: AuthSession): string {
  session.expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return createSessionToken(session, getSessionSecret());
}

export function isStoredPasswordValid(password: string, stored: string): boolean {
  return verifyStoredPassword(password, stored);
}
