import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDailyChart,
  buildAvailableCutoffMonths,
  buildMonthlyChart,
  formatCutoffPeriodNote,
  formatCutoffPeriodOptionLabel,
  getLogDateInput,
  getIndonesianMonthLabel,
  getMonthOffset,
  isLogDateMatching,
} from "../src/shared/utils/reporting";

test("getIndonesianMonthLabel maps YYYY-MM to Indonesian names", () => {
  assert.equal(getIndonesianMonthLabel("2026-01"), "Januari");
  assert.equal(getIndonesianMonthLabel("2026-12"), "Desember");
  assert.equal(getIndonesianMonthLabel(""), "");
});

test("buildMonthlyChart aggregates raw logs by month", () => {
  const chart = buildMonthlyChart(
    ["2026-06", "2026-07"],
    [
      {
        date: "2026-06-02",
        gmv: 120,
        orders: 3,
        products_sold: 5,
        clicks: 10,
        penonton: 11,
      },
      {
        date: "2026-07-01",
        gmv: 80,
        orders: 2,
        products_sold: 4,
        clicks: 7,
        impressions: 9,
      },
    ],
  );

  assert.deepEqual(chart, [
    {
      date: "Juni",
      labelMonth: "2026-06",
      gmv: 120,
      orders: 3,
      itemsSold: 5,
      clicks: 10,
      penonton: 11,
    },
    {
      date: "Juli",
      labelMonth: "2026-07",
      gmv: 80,
      orders: 2,
      itemsSold: 4,
      clicks: 7,
      penonton: 9,
    },
  ]);
});

test("buildDailyChart aggregates raw logs by day within range", () => {
  const chart = buildDailyChart(
    [
      {
        date: "2026-07-01T10:15:00Z",
        gmv: 100,
        orders: 2,
        products_sold: 4,
        clicks: 8,
        penonton: 9,
      },
      {
        date: "2026-07-02",
        gmv: 50,
        orders: 1,
        products_sold: 3,
        clicks: 5,
        impressions: 6,
      },
      {
        date: "2026-07-10",
        gmv: 999,
        orders: 9,
        products_sold: 9,
        clicks: 9,
        penonton: 9,
      },
    ],
    "2026-07-01",
    "2026-07-02",
  );

  assert.deepEqual(chart, [
    {
      date: "2026-07-01",
      gmv: 100,
      orders: 2,
      itemsSold: 4,
      clicks: 8,
      penonton: 9,
    },
    {
      date: "2026-07-02",
      gmv: 50,
      orders: 1,
      itemsSold: 3,
      clicks: 5,
      penonton: 6,
    },
  ]);
});

test("getMonthOffset shifts YYYY-MM values correctly", () => {
  assert.equal(getMonthOffset("2026-01", -1), "2025-12");
  assert.equal(getMonthOffset("2026-01", 1), "2026-02");
  assert.equal(getMonthOffset("2026-12", 1), "2027-01");
});

test("getLogDateInput prefers date and falls back to timestamp", () => {
  assert.equal(getLogDateInput({ date: "2026-07-03" }), "2026-07-03");
  assert.equal(
    getLogDateInput({ timestamp: "2026-07-03 10:00:00" }),
    "2026-07-03",
  );
});

test("isLogDateMatching handles daily, weekly, and cutoff monthly filters", () => {
  assert.equal(
    isLogDateMatching("2026-07-03", {
      timeFilter: "Harian",
      referenceDate: "2026-07-03",
      useCutOff: false,
    }),
    true,
  );
  assert.equal(
    isLogDateMatching("2026-07-01", {
      timeFilter: "Mingguan",
      referenceDate: "2026-07-07",
      useCutOff: false,
    }),
    true,
  );
  assert.equal(
    isLogDateMatching("2026-06-20", {
      timeFilter: "Bulanan",
      referenceDate: "2026-07-10",
      useCutOff: true,
      cutOffStartDay: 16,
      cutOffEndDay: 15,
    }),
    true,
  );
});

test("buildAvailableCutoffMonths includes current and derived months", () => {
  const months = buildAvailableCutoffMonths(
    [{ date: "2026-05-20" }, { timestamp: "2026-07-02 10:00:00" }],
    "2026-07-16",
    new Date("2026-07-03T00:00:00Z"),
  );

  assert.deepEqual(months, ["2026-08", "2026-07", "2026-06"]);
});

test("formatCutoffPeriod helpers preserve the displayed cutoff wording", () => {
  assert.equal(
    formatCutoffPeriodOptionLabel("2026-07"),
    " 25 Juli 2026 (16 Juni - 15 Juli) ",
  );
  assert.equal(
    formatCutoffPeriodNote("2026-07", 16, 15),
    "16 Juni 2026 s/d 15 Juli 2026",
  );
});
