import type { HostEmployee, ThrItem, ThrPeriod } from "../../types";

export type HostSalarySettings = {
  workingDays?: number;
  bandarLampungRegulerBase?: number;
  tanggamusRegulerBase?: number;
  bandarLampungBackupPay?: number;
  tanggamusBackupPay?: number;
  bandarLampungRegulerBonus?: number;
  tanggamusRegulerBonus?: number;
  overtimePayPerHour?: number;
};

/**
 * Hitung masa kerja antara tanggal bergabung (join_date) dengan tanggal hari raya (holiday_date).
 * Mengembalikan:
 * - years: jumlah tahun penuh
 * - months: total bulan penuh (misal: 8 bulan)
 * - remainingDays: sisa hari
 * - formatted: teks ramah pengguna (contoh: "8 Bulan", "1 Tahun 2 Bln", "< 1 Bulan (12 hari)")
 */
export function calculateTenure(joinDateStr: string, holidayDateStr: string) {
  if (!joinDateStr || !holidayDateStr) {
    return {
      years: 0,
      months: 0,
      remainingDays: 0,
      formatted: "Belum diset",
      isUnderOneMonth: true,
    };
  }

  // Parse YYYY-MM-DD
  const [jYear, jMonth, jDay] = joinDateStr.split("-").map(Number);
  const [hYear, hMonth, hDay] = holidayDateStr.split("-").map(Number);

  if (!jYear || !jMonth || !hYear || !hMonth) {
    return {
      years: 0,
      months: 0,
      remainingDays: 0,
      formatted: "Format tanggal tidak valid",
      isUnderOneMonth: true,
    };
  }

  let years = hYear - jYear;
  let months = hMonth - jMonth;
  let days = (hDay || 1) - (jDay || 1);

  if (days < 0) {
    months -= 1;
    // Ambil jumlah hari pada bulan sebelumnya dari holiday date
    const prevMonthDays = new Date(hYear, hMonth - 1, 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    // Join date setelah holiday date
    return {
      years: 0,
      months: 0,
      remainingDays: 0,
      formatted: "Join date melewati hari raya",
      isUnderOneMonth: true,
    };
  }

  const totalExactMonths = years * 12 + months;
  const isUnderOneMonth = totalExactMonths === 0 && days < 30;

  let formatted = "";
  if (years >= 1) {
    formatted = `${years} Thn ${months > 0 ? `${months} Bln` : ""}`.trim();
  } else if (totalExactMonths >= 1) {
    formatted = `${totalExactMonths} Bulan`;
  } else {
    formatted = `< 1 Bulan (${days} hr)`;
  }

  return {
    years,
    months: totalExactMonths,
    remainingDays: days,
    formatted,
    isUnderOneMonth,
  };
}

/**
 * Menentukan gaji pokok host berdasarkan prioritas:
 * 1. customBaseSalary host (jika disetel)
 * 2. Standar studio (Tanggamus vs Bandar Lampung) dari salarySettings
 */
export function resolveHostBaseSalary(
  host: {
    customBaseSalary?: number | null;
    studio?: string | null;
    hostType?: string | null;
  },
  salarySettings: HostSalarySettings = {}
): number {
  if (typeof host.customBaseSalary === "number" && host.customBaseSalary > 0) {
    return host.customBaseSalary;
  }

  const isTanggamus = Boolean(host.studio?.toLowerCase().includes("tanggamus"));
  if (isTanggamus) {
    return salarySettings.tanggamusRegulerBase ?? 2700000;
  }
  return salarySettings.bandarLampungRegulerBase ?? 4000000;
}

/**
 * Menghitung nominal THR berdasarkan standar ketenagakerjaan:
 * - Masa kerja >= 12 bulan -> THR = 1 bulan upah pokok (100%)
 * - Masa kerja >= 1 bulan & < 12 bulan -> THR = (Masa Kerja / 12) * 1 bulan upah
 * - Masa kerja < 1 bulan -> Default Rp 0 / tidak eligible, namun dapat dioverride manual
 */
export function computeThrAmount({
  baseSalary,
  fixedAllowance = 0,
  tenureMonths,
  adjustmentAmount = 0,
  isEligible = true,
  allowUnderOneMonth = false,
}: {
  baseSalary: number;
  fixedAllowance?: number;
  tenureMonths: number;
  adjustmentAmount?: number;
  isEligible?: boolean;
  allowUnderOneMonth?: boolean;
}): {
  thrBaseSalary: number;
  calculatedThr: number;
  finalThr: number;
  isEligible: boolean;
  formulaNote: string;
} {
  const thrBaseSalary = Math.max(0, Math.round(baseSalary + fixedAllowance));

  const eligible = isEligible && (tenureMonths >= 1 || allowUnderOneMonth);

  if (!eligible) {
    const finalThr = isEligible ? Math.max(0, Math.round(adjustmentAmount)) : 0;
    return {
      thrBaseSalary,
      calculatedThr: 0,
      finalThr,
      isEligible: eligible,
      formulaNote: "Masa kerja < 1 bulan (Tidak memenuhi syarat proporsional standar)",
    };
  }

  let calculated = 0;
  let formulaNote = "";

  if (tenureMonths >= 12) {
    calculated = thrBaseSalary;
    formulaNote = "100% Gaji Pokok (Masa kerja \u2265 12 bulan)";
  } else {
    // Formula proporsional: (Masa Kerja / 12) * Gaji Pokok
    calculated = Math.round((tenureMonths / 12) * thrBaseSalary);
    formulaNote = `(${tenureMonths}/12) \u00d7 Rp ${new Intl.NumberFormat("id-ID").format(thrBaseSalary)}`;
  }

  const finalThr = Math.max(0, Math.round(calculated + adjustmentAmount));

  return {
    thrBaseSalary,
    calculatedThr: calculated,
    finalThr,
    isEligible: true,
    formulaNote,
  };
}

/**
 * Format IDR currency
 */
export function formatIDR(amount: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(amount || 0));
}

/**
 * Sinkronisasi otomatis host existing ke dalam daftar item THR pada periode tertentu.
 * Mempertahankan data adjustment dan ops employees yang sudah ditambahkan sebelumnya.
 */
export function buildThrItemsFromHosts({
  period,
  hosts,
  salarySettings,
  existingItems = [],
}: {
  period: ThrPeriod;
  hosts: HostEmployee[];
  salarySettings: HostSalarySettings;
  existingItems?: ThrItem[];
}): ThrItem[] {
  const existingMap = new Map<string, ThrItem>();
  // Simpan ops employees
  const opsEmployees: ThrItem[] = [];

  for (const item of existingItems) {
    if (item.employeeType === "ops") {
      opsEmployees.push(item);
    } else if (item.employeeId) {
      existingMap.set(item.employeeId, item);
    }
  }

  const hostItems: ThrItem[] = hosts.map((host) => {
    const existing = existingMap.get(host.id);
    const joinedDate = existing?.joinedDate || host.joinedDate || "";
    const tenure = calculateTenure(joinedDate, period.holidayDate);

    // Ambil salary: prioritas customBaseSalary -> existing.basicSalary -> regional base
    const basicSalary =
      existing?.basicSalary && existing.basicSalary > 0
        ? existing.basicSalary
        : resolveHostBaseSalary(host, salarySettings);

    const fixedAllowance = existing?.fixedAllowance || 0;
    const adjustmentAmount = existing?.adjustmentAmount || 0;

    // Tentukan eligibility default: jika ada existing gunakan existing.isEligible, jika belum, cek tenure >= 1
    const isEligible = existing !== undefined ? existing.isEligible : !tenure.isUnderOneMonth;

    const calculation = computeThrAmount({
      baseSalary: basicSalary,
      fixedAllowance,
      tenureMonths: tenure.months,
      adjustmentAmount,
      isEligible,
      allowUnderOneMonth: isEligible && tenure.isUnderOneMonth,
    });

    return {
      id: existing?.id || `thr_item_${period.id}_${host.id}`,
      periodId: period.id,
      employeeType: "host",
      employeeId: host.id,
      employeeCode: host.employeeId || host.id,
      name: host.name,
      role: host.role || "Host Streamer",
      department: host.studio || "Studio Live",
      joinedDate,
      tenureMonths: tenure.months,
      tenureFormatted: tenure.formatted,
      basicSalary,
      fixedAllowance,
      thrBaseSalary: calculation.thrBaseSalary,
      calculatedThr: calculation.calculatedThr,
      adjustmentAmount,
      finalThr: calculation.finalThr,
      isEligible: calculation.isEligible,
      status: existing?.status || "Pending",
      bankName: existing?.bankName || host.bankName || "",
      bankAccount: existing?.bankAccount || host.bankAccount || "",
      notes: existing?.notes || calculation.formulaNote,
      createdAt: existing?.createdAt,
      updatedAt: existing?.updatedAt,
    };
  });

  return [...hostItems, ...opsEmployees];
}
