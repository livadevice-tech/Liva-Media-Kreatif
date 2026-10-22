import assert from "node:assert/strict";
import test from "node:test";

import { buildHostReportList } from "../src/shared/utils/salaryReporting";

test("buildHostReportList calculates regular host salary components", () => {
  const hosts = [
    {
      id: "host-1",
      name: "Ayu",
      employeeId: "EMP-1",
      avatar: "",
      role: "Senior Host",
      platforms: ["TikTok Live"],
      brands: ["Brand A"],
      baseMonthlyTargetHours: 80,
      baseMonthlyTargetRevenue: 150000000,
      consistencyScore: 95,
      joinedDate: "2025-01-01",
      email: "ayu@example.com",
      phone: "0812",
      studio: "Studio Bandar Lampung",
      hostType: "Reguler" as const,
      customWorkingDaysTarget: 2,
      customBaseSalary: 1000000,
      customShiftRate: 50000,
    },
  ];

  const logs = [
    {
      id: "log-1",
      hostId: "host-1",
      hostName: "Ayu",
      employeeId: "EMP-1",
      date: "2026-07-01",
      shiftHours: "09:00 - 13:00",
      platform: "TikTok Live",
      brandHandled: "Brand A",
      liveDuration: 4,
      sessionCount: 1,
      status: "Present" as const,
      revenueGenerated: 100000,
      orders: 2,
      overtimeHours: 1,
      isBackupShift: false,
    },
    {
      id: "log-2",
      hostId: "host-1",
      hostName: "Ayu",
      employeeId: "EMP-1",
      date: "2026-07-02",
      shiftHours: "09:00 - 13:00",
      platform: "TikTok Live",
      brandHandled: "Brand A",
      liveDuration: 4,
      sessionCount: 1,
      status: "Late" as const,
      revenueGenerated: 50000,
      orders: 1,
      overtimeHours: 0,
      isBackupShift: false,
    },
    {
      id: "log-3",
      hostId: "host-1",
      hostName: "Ayu",
      employeeId: "EMP-1",
      date: "2026-07-02",
      shiftHours: "14:00 - 18:00",
      platform: "TikTok Live",
      brandHandled: "Brand A",
      liveDuration: 4,
      sessionCount: 1,
      status: "Present" as const,
      revenueGenerated: 25000,
      orders: 1,
      overtimeHours: 0,
      isBackupShift: true,
    },
  ];

  const result = buildHostReportList(
    hosts,
    logs,
    {
      overtimePayPerHour: 20000,
      bandarLampungBackupPay: 175000,
      bandarLampungRegulerBase: 4000000,
      bandarLampungRegulerBonus: 300000,
      workingDays: 2,
      useCutOff: false,
    },
    () => true,
    (log) => log.date || "",
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].totalHadir, 2);
  assert.equal(result[0].calculatedBackupPay, 50000);
  assert.equal(result[0].isEligibleForBonus, true);
  assert.equal(result[0].calculatedBonus, 300000);
  assert.equal(result[0].totalOvertimeHours, 1);
  assert.equal(result[0].netSalary, 1370000);
});


test("buildHostReportList applies explicit overtime records to selected cutoff", () => {
  const hosts = [
    {
      id: "host-1",
      name: "Ayu",
      employeeId: "EMP-1",
      avatar: "",
      role: "Senior Host",
      platforms: ["TikTok Live"],
      brands: ["Brand A"],
      studio: "Studio Bandar Lampung",
      hostType: "Reguler" as const,
      customWorkingDaysTarget: 26,
      customBaseSalary: 2600000,
    },
  ];

  const logs = [
    {
      id: "log-1",
      hostId: "host-1",
      hostName: "Ayu",
      date: "2026-10-01",
      status: "Present" as const,
    },
  ];

  const overtimes = [
    {
      id: "ot-1",
      hostId: "host-1",
      hostName: "Ayu",
      cutoffPeriod: "2026-10",
      date: "2026-10-05",
      hours: 3.5,
      amount: 70000,
      notes: "Lembur 10.10",
    },
    {
      id: "ot-2",
      hostId: "host-1",
      hostName: "Ayu",
      cutoffPeriod: "2026-11", // different cutoff
      date: "2026-11-02",
      hours: 2,
      amount: 50000,
      notes: "Lembur 11.11",
    },
  ];

  const resultCutoff10 = buildHostReportList(
    hosts,
    logs,
    { workingDays: 26, tanggamusRegulerBase: 2600000, bandarLampungRegulerBase: 2600000 },
    () => true,
    (log) => log.date || "",
    [],
    overtimes,
    "2026-10",
  );

  assert.equal(resultCutoff10[0].totalOvertimeHours, 3.5);
  assert.equal(resultCutoff10[0].calculatedOvertimePay, 70000);
  assert.equal(resultCutoff10[0].overtimeRecords?.length, 1);
  // Base: (2.600.000 / 26) * 1 = 100.000 + Overtime 70.000 = 170.000
  assert.equal(resultCutoff10[0].netSalary, 170000);

  const resultCutoff11 = buildHostReportList(
    hosts,
    logs,
    { workingDays: 26, tanggamusRegulerBase: 2600000, bandarLampungRegulerBase: 2600000 },
    () => true,
    (log) => log.date || "",
    [],
    overtimes,
    "2026-11",
  );

  assert.equal(resultCutoff11[0].totalOvertimeHours, 2);
  assert.equal(resultCutoff11[0].calculatedOvertimePay, 50000);
  assert.equal(resultCutoff11[0].overtimeRecords?.length, 1);
  assert.equal(resultCutoff11[0].netSalary, 150000);
});
