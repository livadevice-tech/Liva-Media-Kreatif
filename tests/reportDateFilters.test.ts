import assert from "node:assert/strict";
import test from "node:test";

import {
  applyDateFilterSelection,
  getReportPeriodLabel,
  shiftReportPeriodByOneDay,
} from "../src/shared/utils/reportDateFilters";

test("applyDateFilterSelection opens and closes the expected picker panels", () => {
  let filterType = "all";
  let monthOpen = true;
  let calendarOpen = true;
  let tempStart = "";
  let tempEnd = "";

  applyDateFilterSelection({
    value: "custom",
    setFilterType: (value) => {
      filterType = value;
    },
    setMonthOpen: (value) => {
      monthOpen = value;
    },
    setCalendarOpen: (value) => {
      calendarOpen = value;
    },
    setTempStartDate: (value) => {
      tempStart = value;
    },
    setTempEndDate: (value) => {
      tempEnd = value;
    },
    currentStartDate: "2026-07-01",
    currentEndDate: "2026-07-03",
  });

  assert.equal(filterType, "custom");
  assert.equal(monthOpen, false);
  assert.equal(calendarOpen, true);
  assert.equal(tempStart, "2026-07-01");
  assert.equal(tempEnd, "2026-07-03");
});

test("getReportPeriodLabel returns readable labels for each mode", () => {
  assert.equal(
    getReportPeriodLabel({
      dateFilterType: "all",
      latestDateLabel: "",
      targetLatestDate: "",
      customStartDate: "",
    }),
    "Semua Waktu",
  );

  assert.equal(
    getReportPeriodLabel({
      dateFilterType: "month",
      latestDateLabel: "Juli 2026",
      targetLatestDate: "",
      customStartDate: "",
    }),
    "Juli 2026",
  );

  assert.equal(
    getReportPeriodLabel({
      dateFilterType: "latest",
      latestDateLabel: "",
      targetLatestDate: "2026-07-02",
      customStartDate: "",
    }),
    "Kamis, 2 Juli 2026",
  );
});

test("shiftReportPeriodByOneDay keeps custom mode and moves the date", () => {
  let filterType = "all";
  let customStart = "";
  let customEnd = "";

  shiftReportPeriodByOneDay({
    direction: 1,
    dateFilterType: "latest",
    targetLatestDate: "2026-07-02",
    customStartDate: "",
    setDateFilterType: (value) => {
      filterType = value;
    },
    setCustomStartDate: (value) => {
      customStart = value;
    },
    setCustomEndDate: (value) => {
      customEnd = value;
    },
  });

  assert.equal(filterType, "custom");
  assert.equal(customStart, "2026-07-03");
  assert.equal(customEnd, "2026-07-03");
});
