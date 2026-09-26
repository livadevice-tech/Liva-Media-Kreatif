import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateTenure,
  computeThrAmount,
  resolveHostBaseSalary,
  buildThrItemsFromHosts,
} from "../src/shared/utils/thrCalculator";
import type { HostEmployee, ThrPeriod } from "../src/types";

test("calculateTenure correctly calculates tenure based on join date and holiday date", () => {
  // User Example 1: Join 1 Juli 2026, Holiday 10 Maret 2027 -> 8 bulan
  const tenure1 = calculateTenure("2026-07-01", "2027-03-10");
  assert.equal(tenure1.months, 8, "Masa kerja harus 8 bulan");
  assert.equal(tenure1.years, 0);
  assert.equal(tenure1.isUnderOneMonth, false);

  // User Example 2: Join 16 Feb 2026, Holiday 10 Mar 2027 -> > 12 bulan (1 tahun)
  const tenure2 = calculateTenure("2026-02-16", "2027-03-10");
  assert.ok(tenure2.months >= 12, "Masa kerja harus >= 12 bulan");
  assert.equal(tenure2.years, 1);

  // User Example 3: Join < 1 bulan sebelum hari raya
  const tenure3 = calculateTenure("2027-02-25", "2027-03-10");
  assert.equal(tenure3.months, 0);
  assert.equal(tenure3.isUnderOneMonth, true);
});

test("computeThrAmount matches official Indonesian labor regulation and user requirements", () => {
  // Case 1: Masa kerja >= 12 bulan -> THR = 1 bulan upah pokok
  const result1 = computeThrAmount({
    baseSalary: 2700000,
    tenureMonths: 12,
  });
  assert.equal(result1.calculatedThr, 2700000);
  assert.equal(result1.finalThr, 2700000);
  assert.equal(result1.isEligible, true);

  // Case 2: Masa kerja >= 1 bulan & < 12 bulan -> THR = (Masa Kerja / 12) * Gaji Pokok
  // Contoh user: Masa kerja 8 bulan, Gaji 2.700.000 -> 8 / 12 * 2.700.000 = 1.800.000
  const result2 = computeThrAmount({
    baseSalary: 2700000,
    tenureMonths: 8,
  });
  assert.equal(result2.calculatedThr, 1800000);
  assert.equal(result2.finalThr, 1800000);
  assert.equal(result2.isEligible, true);

  // Case 3: Masa kerja < 1 bulan -> Default tidak eligible (Rp 0)
  const result3 = computeThrAmount({
    baseSalary: 2700000,
    tenureMonths: 0,
    isEligible: true,
  });
  assert.equal(result3.calculatedThr, 0);
  assert.equal(result3.finalThr, 0);
  assert.equal(result3.isEligible, false);

  // Case 4: Manual override / adjustment for non-eligible or performance bonus
  const result4 = computeThrAmount({
    baseSalary: 2700000,
    tenureMonths: 8,
    adjustmentAmount: 200000, // Bonus tambahan Rp 200.000
  });
  assert.equal(result4.calculatedThr, 1800000);
  assert.equal(result4.finalThr, 2000000);

  // Case 5: Manual override for employee < 1 month with explicit allowance
  const result5 = computeThrAmount({
    baseSalary: 2700000,
    tenureMonths: 0,
    isEligible: true,
    allowUnderOneMonth: true,
    adjustmentAmount: 500000,
  });
  assert.equal(result5.finalThr, 500000);
});

test("resolveHostBaseSalary prioritizes customBaseSalary over regional defaults", () => {
  const hostCustom = {
    customBaseSalary: 3200000,
    studio: "Studio Tanggamus",
  };
  const salarySettings = {
    tanggamusRegulerBase: 2700000,
    bandarLampungRegulerBase: 4000000,
  };

  assert.equal(
    resolveHostBaseSalary(hostCustom, salarySettings),
    3200000,
    "Harus memprioritaskan customBaseSalary"
  );

  const hostTanggamus = {
    studio: "Studio Tanggamus",
  };
  assert.equal(
    resolveHostBaseSalary(hostTanggamus, salarySettings),
    2700000,
    "Harus mengambil default Tanggamus jika customBaseSalary tidak diset"
  );

  const hostBandarLampung = {
    studio: "Studio Bandar Lampung",
  };
  assert.equal(
    resolveHostBaseSalary(hostBandarLampung, salarySettings),
    4000000,
    "Harus mengambil default Bandar Lampung jika studio Bandar Lampung"
  );
});

test("buildThrItemsFromHosts generates items accurately and preserves ops employees", () => {
  const period: ThrPeriod = {
    id: "thr_2027",
    year: 2027,
    holidayName: "Idul Fitri 1448 H",
    holidayDate: "2027-03-10",
    paymentStatus: "Draft",
  };

  const hosts: HostEmployee[] = [
    {
      id: "h1",
      name: "Adinda Septiani",
      employeeId: "EMP001",
      role: "Host Reguler",
      studio: "Studio Tanggamus",
      joinedDate: "2026-07-01",
      platforms: [],
      brands: [],
      baseMonthlyTargetHours: 80,
      baseMonthlyTargetRevenue: 0,
      consistencyScore: 100,
      email: "",
      phone: "",
    },
  ];

  const salarySettings = {
    tanggamusRegulerBase: 2700000,
    bandarLampungRegulerBase: 4000000,
  };

  const existingItems = [
    {
      id: "ops_1",
      periodId: "thr_2027",
      employeeType: "ops" as const,
      name: "Budi Studio Manager",
      role: "Manager",
      department: "Operations",
      joinedDate: "2025-01-01",
      tenureMonths: 26,
      basicSalary: 3500000,
      fixedAllowance: 0,
      thrBaseSalary: 3500000,
      calculatedThr: 3500000,
      adjustmentAmount: 0,
      finalThr: 3500000,
      isEligible: true,
      status: "Pending" as const,
    },
  ];

  const generated = buildThrItemsFromHosts({
    period,
    hosts,
    salarySettings,
    existingItems,
  });

  assert.equal(generated.length, 2, "Harus berisi 1 host dan 1 ops employee");

  const hostItem = generated.find((i) => i.employeeId === "h1");
  assert.ok(hostItem);
  assert.equal(hostItem.tenureMonths, 8);
  assert.equal(hostItem.basicSalary, 2700000);
  assert.equal(hostItem.calculatedThr, 1800000);
  assert.equal(hostItem.finalThr, 1800000);

  const opsItem = generated.find((i) => i.id === "ops_1");
  assert.ok(opsItem);
  assert.equal(opsItem.name, "Budi Studio Manager");
});
