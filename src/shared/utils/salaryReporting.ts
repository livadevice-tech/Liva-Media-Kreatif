import type { AttendanceLog, HostEmployee, OvertimeRecord } from "../../types";

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
  hasViolations: boolean;
  violationsCount: number;
  overtimeRecords?: OvertimeRecord[];
};

export type HostDateMatcher = (rawDate: string) => boolean;
export type HostDateExtractor = (log: AttendanceLog) => string;

export const buildHostReportList = (
  hosts: readonly HostEmployee[],
  logs: readonly AttendanceLog[],
  salarySettings: HostSalarySettings,
  isDateMatching: HostDateMatcher,
  getLogDateInput: HostDateExtractor,
  violations?: readonly any[],
  overtimes?: readonly OvertimeRecord[],
  activeCutoff?: string,
): HostReportRow[] => {
  return hosts.map((host) => {
    const hostAny = host as any;
    const records = logs.filter((l) => {
      const lAny = l as any;
      const matchHost =
        (l.hostId && l.hostId === host.id) ||
        (lAny.host_id && lAny.host_id === host.id) ||
        (l.hostName && host.name && l.hostName.toLowerCase() === host.name.toLowerCase()) ||
        (lAny.host_name && host.name && lAny.host_name.toLowerCase() === host.name.toLowerCase()) ||
        (hostAny.username && (l.hostName === hostAny.username || lAny.host_name === hostAny.username));
      return matchHost && isDateMatching(getLogDateInput(l));
    });

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

    // Explicit overtime records for this host in the selected cutoff
    const hostOvertimes = (overtimes || []).filter(
      (o) =>
        (o.hostId === host.id || o.hostName === host.name) &&
        (!activeCutoff || activeCutoff === "Semua" || o.cutoffPeriod === activeCutoff),
    );

    const recordedOvertimeHours = hostOvertimes.reduce(
      (sum, o) => sum + (Number(o.hours) || 0),
      0,
    );
    const recordedOvertimePay = hostOvertimes.reduce(
      (sum, o) => sum + (Number(o.amount) || 0),
      0,
    );

    const logOvertimeHours = records.reduce(
      (sum, r) => sum + (Number(r.overtimeHours) || 0),
      0,
    );
    const logOvertimePay =
      logOvertimeHours * (salarySettings.overtimePayPerHour || 20000);

    // If explicit overtimes exist, use them. Otherwise fallback to attendance log overtime.
    const totalOvertimeHours = hostOvertimes.length > 0 ? recordedOvertimeHours : logOvertimeHours;
    const calculatedOvertimePay = hostOvertimes.length > 0 ? recordedOvertimePay : logOvertimePay;

    const isTanggamus = host.studio && host.studio.includes("Tanggamus");
    const hostType = host.hostType || hostAny.host_type || "Reguler";

    const customShift = host.customShiftRate ?? hostAny.custom_shift_rate;
    const backupShiftRate =
      typeof customShift === "number" && !isNaN(customShift)
        ? customShift
        : isTanggamus
          ? (salarySettings.tanggamusBackupPay ?? 150000)
          : (salarySettings.bandarLampungBackupPay ?? 175000);

    // Check violations in the payroll cutoff date range
    const hostViolations = (violations || []).filter(
      (v) =>
        (v.host_id === host.id || v.host_name === host.name || (v.hostName && v.hostName === host.name)) &&
        isDateMatching(v.violation_date || (v.created_at ? v.created_at.split("T")[0] : ""))
    );
    const hasViolations = hostViolations.length > 0;

    let basePayRate = 0;
    let netSalary = calculatedOvertimePay;
    let isEligibleForBonus = false;
    let calculatedBonus = 0;
    let calculatedBackupPay = 0;

    const customTarget = host.customWorkingDaysTarget ?? hostAny.custom_working_days_target;
    const requiredWorkingDays =
      hostType === "Reguler"
        ? (typeof customTarget === "number" && customTarget > 0 ? customTarget : (salarySettings.workingDays || 26))
        : (salarySettings.workingDays || 26);

    if (hostType === "Reguler") {
      const customBase = host.customBaseSalary ?? hostAny.custom_base_salary;
      const regulerBase =
        typeof customBase === "number" && !isNaN(customBase)
          ? customBase
          : isTanggamus
            ? (salarySettings.tanggamusRegulerBase ?? 3500000)
            : (salarySettings.bandarLampungRegulerBase ?? 4000000);
      basePayRate = regulerBase;

      const activeDaysRatio = totalHadir / requiredWorkingDays;
      netSalary += Math.round(regulerBase * activeDaysRatio);

      calculatedBackupPay = totalBackupShiftsAsReguler * backupShiftRate;
      netSalary += calculatedBackupPay;

      if (totalHadir >= requiredWorkingDays && countTerlambat <= 3 && !hasViolations) {
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

    const hostEmpId = host.employeeId || hostAny.employee_id || "";

    return {
      ...host,
      employeeId: hostEmpId,
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
      revenueSum: records.reduce((sum, r) => sum + (Number(r.revenueGenerated) || 0), 0),
      ordersSum: records.reduce((sum, r) => sum + (Number(r.orders) || 0), 0),
      hasViolations,
      violationsCount: hostViolations.length,
      overtimeRecords: hostOvertimes,
    };
  });
};
