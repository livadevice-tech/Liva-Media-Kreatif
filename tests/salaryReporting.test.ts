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
