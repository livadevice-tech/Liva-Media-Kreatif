import type { AttendanceLog, HostEmployee } from "../../types";

export type HostSalarySettings = {
  overtimePayPerHour?: number;
  tanggamusBackupPay?: number;
  bandarLampungBackupPay?: number;
  workingDays?: number;
  tanggamusRegulerBase?: number;
  bandarLampungRegulerBase?: number;
  tanggamusRegulerBonus?: number;
  bandarLampungRegulerBonus?: number;
  useCutOff?: boolean;
  cutOffStartDay?: number | null;
  cutOffEndDay?: number | null;
};

export type HostReportRow = HostEmployee & {
  countTepatWaktu: number;
  countTerlambat: number;
  countAlpa: number;
  countIzin: number;
  totalHadir: number;
  totalBackupShiftsAsReguler: number;
  calculatedBackupPay: number;
  isEligibleForBonus: boolean;
  calculatedBonus: number;
  totalOvertimeHours: number;
  calculatedOvertimePay: number;
  basePayRate: number;
  netSalary: number;
  requiredWorkingDays: number;
  revenueSum: number;
  ordersSum: number;
};

export type HostDateMatcher = (rawDate: string) => boolean;
export type HostDateExtractor = (log: AttendanceLog) => string;

export const buildHostReportList = (
  hosts: readonly HostEmployee[],
  logs: readonly AttendanceLog[],
  salarySettings: HostSalarySettings,
  isDateMatching: HostDateMatcher,
  getLogDateInput: HostDateExtractor,
): HostReportRow[] => {
  return hosts.map((host) => {
    const records = logs.filter(
      (l) =>
        (l.hostId === host.id || l.hostName === host.name) &&
        isDateMatching(getLogDateInput(l)),
    );

    const regulerRecords = records.filter((r) => !r.isBackupShift);
    const backupShiftRecords = records.filter((r) => r.isBackupShift);

    const countTepatWaktu = regulerRecords.filter(
      (r) => r.status === "Present",
    ).length;
    const countTerlambat = regulerRecords.filter(
      (r) => r.status === "Late",
    ).length;
    const countAlpa = regulerRecords.filter(
      (r) =>
        r.status !== "Present" &&
        r.status !== "Late" &&
        r.status !== "Excused",
    ).length;
    const countIzin = regulerRecords.filter(
      (r) => r.status === "Excused",
    ).length;
    const totalHadir = countTepatWaktu + countTerlambat;

    const totalBackupShiftsAsReguler = backupShiftRecords.filter(
      (r) => r.status === "Present" || r.status === "Late",
    ).length;

    const totalOvertimeHours = records.reduce(
      (sum, r) => sum + (r.overtimeHours || 0),
      0,
    );
    const calculatedOvertimePay =
      totalOvertimeHours * (salarySettings.overtimePayPerHour || 20000);

    const isTanggamus = host.studio && host.studio.includes("Tanggamus");
    const hostType = host.hostType || "Reguler";

    const backupShiftRate =
      typeof host.customShiftRate === "number"
        ? host.customShiftRate
        : isTanggamus
          ? (salarySettings.tanggamusBackupPay ?? 150000)
          : (salarySettings.bandarLampungBackupPay ?? 175000);

    let basePayRate = 0;
    let netSalary = calculatedOvertimePay;
    let isEligibleForBonus = false;
    let calculatedBonus = 0;
    let calculatedBackupPay = 0;

    const requiredWorkingDays =
      hostType === "Reguler"
        ? host.customWorkingDaysTarget || salarySettings.workingDays || 26
        : salarySettings.workingDays || 26;

    if (hostType === "Reguler") {
      const regulerBase =
        typeof host.customBaseSalary === "number"
          ? host.customBaseSalary
          : isTanggamus
            ? (salarySettings.tanggamusRegulerBase ?? 3500000)
            : (salarySettings.bandarLampungRegulerBase ?? 4000000);
      basePayRate = regulerBase;

      const activeDaysRatio = totalHadir / requiredWorkingDays;
      netSalary += Math.round(regulerBase * activeDaysRatio);

      calculatedBackupPay = totalBackupShiftsAsReguler * backupShiftRate;
      netSalary += calculatedBackupPay;

      if (totalHadir >= requiredWorkingDays && countTerlambat <= 3) {
        isEligibleForBonus = true;
        calculatedBonus = isTanggamus
          ? (salarySettings.tanggamusRegulerBonus ?? 250000)
          : (salarySettings.bandarLampungRegulerBonus ?? 300000);
        netSalary += calculatedBonus;
      }
    } else {
      const totalBackupHadir = records.filter(
        (r) => r.status === "Present" || r.status === "Late",
      ).length;
      basePayRate = backupShiftRate;
      netSalary += totalBackupHadir * backupShiftRate;
    }

    return {
      ...host,
      countTepatWaktu,
      countTerlambat,
      countAlpa,
      countIzin,
      totalHadir,
      totalBackupShiftsAsReguler,
      calculatedBackupPay,
      isEligibleForBonus,
      calculatedBonus,
      totalOvertimeHours,
      calculatedOvertimePay,
      basePayRate,
      netSalary,
      requiredWorkingDays,
      revenueSum: records.reduce((sum, r) => sum + (r.revenueGenerated || 0), 0),
      ordersSum: records.reduce((sum, r) => sum + (r.orders || 0), 0),
    };
  });
};
