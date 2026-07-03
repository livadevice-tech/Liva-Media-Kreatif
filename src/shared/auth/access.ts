import type { AuthSession } from "./session";

export type AdminTab =
  | "dashboard_utama"
  | "absensi"
  | "rekap_gaji"
  | "database"
  | "sheets"
  | "credentials"
  | "settings"
  | "data_brand"
  | "reporting_brand"
  | "leads"
  | "copilot"
  | "admin_privacy"
  | "invoice";

export const MODULE_TAB_REQUIREMENTS = {
  adminAccounts: ["admin_privacy"],
  hosts: ["dashboard_utama", "absensi", "rekap_gaji", "database", "credentials", "settings"],
  logs: ["dashboard_utama", "absensi", "rekap_gaji", "database"],
  schedules: ["dashboard_utama", "absensi", "rekap_gaji", "database"],
  alerts: ["dashboard_utama", "copilot"],
  clientBrands: ["dashboard_utama", "data_brand", "invoice", "reporting_brand"],
  clientLeads: ["leads"],
  clientReporting: ["reporting_brand"],
  reportingBrand: ["reporting_brand"],
  settings: ["settings", "sheets"],
  invoice: ["invoice"],
  chat: ["copilot"],
  ai: ["copilot"],
} as const satisfies Record<string, readonly AdminTab[]>;

export function canAccessAnyTab(
  accessTabs: readonly string[] | undefined,
  requiredTabs: readonly string[],
): boolean {
  if (!accessTabs || accessTabs.length === 0) return false;
  const allowed = new Set(accessTabs);
  return requiredTabs.some((tab) => allowed.has(tab));
}

export function canAccessDbTest(session: AuthSession | null | undefined): boolean {
  return session?.role === "master" || session?.role === "admin";
}
