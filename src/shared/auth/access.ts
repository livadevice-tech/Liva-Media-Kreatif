import type { AuthSession } from "./session";

export type AdminTab =
  | "dashboard_utama"
  | "task_management"
  | "absensi"
  | "rekap_gaji"
  | "database"
  | "sheets"
  | "credentials"
  | "settings"
  | "data_brand"
  | "reporting_brand"
  | "invoice"
  | "leads"
  | "copilot"
  | "admin_privacy";

export const MODULE_TAB_REQUIREMENTS = {
  adminAccounts: ["admin_privacy"],
  hosts: ["dashboard_utama", "absensi", "rekap_gaji", "database", "credentials", "settings", "task_management"],
  logs: ["dashboard_utama", "absensi", "rekap_gaji", "database"],
  schedules: ["dashboard_utama", "absensi", "rekap_gaji", "database"],
  alerts: ["dashboard_utama", "copilot"],
  clientBrands: ["dashboard_utama", "data_brand", "reporting_brand", "invoice"],
  clientLeads: ["leads"],
  clientReporting: ["reporting_brand"],
  reportingBrand: ["reporting_brand"],
  invoice: ["invoice"],
  tasks: ["task_management", "dashboard_utama"],
  settings: ["settings", "sheets"],
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
