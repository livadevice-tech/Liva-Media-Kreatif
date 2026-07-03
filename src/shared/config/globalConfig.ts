import { settingsApi } from "../../api";
import { BRANDS, PLATFORMS, SHIFTS } from "../../data";

export const GLOBAL_CONFIG_STORAGE_KEY = "liva_global_configs";

export interface GlobalConfigData {
  platforms: string[];
  brands: string[];
  shifts: string[];
  studios: {
    id: string;
    name: string;
    location: string;
  }[];
  agencyLogoUrl: string;
  salarySettings: {
    workingDays: number;
    bandarLampungRegulerBase: number;
    tanggamusRegulerBase: number;
    bandarLampungBackupPay: number;
    tanggamusBackupPay: number;
    bandarLampungRegulerBonus: number;
    tanggamusRegulerBonus: number;
    overtimePayPerHour: number;
    useCutOff: boolean;
    cutOffStartDay: number;
    cutOffEndDay: number;
  };
  adminShiftChecklistObj: Record<string, string[]>;
}

export const DEFAULT_GLOBAL_CONFIG = {
  platforms: PLATFORMS,
  brands: BRANDS,
  shifts: SHIFTS,
  studios: [
    {
      id: "std_1",
      name: "Studio Bandar Lampung",
      location: "Bandar Lampung",
    },
    {
      id: "std_2",
      name: "Studio Tanggamus",
      location: "Tanggamus",
    },
    {
      id: "std_3",
      name: "Studio 01",
      location: "Bandar Lampung",
    },
    {
      id: "std_4",
      name: "Studio 02",
      location: "Tanggamus",
    },
  ],
  agencyLogoUrl: "",
  salarySettings: {
    workingDays: 26,
    bandarLampungRegulerBase: 4000000,
    tanggamusRegulerBase: 3500000,
    bandarLampungBackupPay: 175000,
    tanggamusBackupPay: 150000,
    bandarLampungRegulerBonus: 300000,
    tanggamusRegulerBonus: 250000,
    overtimePayPerHour: 20000,
    useCutOff: true,
    cutOffStartDay: 16,
    cutOffEndDay: 15,
  },
  adminShiftChecklistObj: {},
};

export function saveLocalConfig(partialConfig: Partial<GlobalConfigData> & Record<string, unknown>): void {
  try {
    const existing = localStorage.getItem(GLOBAL_CONFIG_STORAGE_KEY);
    const current = existing ? JSON.parse(existing) : {};
    const merged = { ...current, ...partialConfig };
    delete merged.adminCredentials;
    localStorage.setItem(GLOBAL_CONFIG_STORAGE_KEY, JSON.stringify(merged));

    // Sync to MySQL
    if (typeof settingsApi !== "undefined") {
      settingsApi.save(GLOBAL_CONFIG_STORAGE_KEY, merged).catch(console.error);
    }
  } catch (e) {
    console.error("saveLocalConfig error:", e);
  }
}
