import assert from "node:assert/strict";
import test from "node:test";

import {
  buildReportChartData,
  filterReportLogs,
  getNextSortState,
  sortReportLogs,
} from "../src/shared/utils/reportTable";

test("filterReportLogs handles month filters and common dimensions", () => {
  const logs = [
    {
      date: "2026-07-01",
      title: "Alpha Stream",
      platform: "TikTok",
      shift: "Pagi",
      gmv: 100,
    },
    {
      date: "2026-06-15",
      title: "Beta Stream",
      platform: "Shopee Live",
      shift: "Malam",
      gmv: 50,
    },
    {
      date: "2026-06-20",
      title: "Gamma Session",
      platform: "TikTok",
      shift: "Sore",
      gmv: 25,
    },
  ];

  const current = filterReportLogs(logs, {
    filterType: "month",
    selectedMonth: "2026-07",
    searchQuery: "alpha",
    platformFilter: "TikTok",
    shiftFilters: ["Pagi"],
  });

  const previous = filterReportLogs(logs, {
    filterType: "month",
    isPrevPeriod: true,
    prevStartDate: "2026-06-01",
    prevEndDate: "2026-06-30",
  });

  assert.deepEqual(
    current.map((log) => log.title),
    ["Alpha Stream"],
  );
  assert.equal(previous.length, 2);
});

test("sortReportLogs respects date and metric columns", () => {
  const logs = [
    { date: "02/07/2026", impressions: 8, clicks: 2, productImpressions: 4, buyers: 5 },
    { date: "2026-07-01", impressions: 10, clicks: 1, productImpressions: 2, buyers: 3 },
  ];

  const byDate = sortReportLogs(logs, "date", true);
  const byViews = sortReportLogs(logs, "views", false);

  assert.equal(byDate[0].date, "2026-07-01");
  assert.equal(byViews[0].impressions, 10);
});

test("buildReportChartData normalizes mixed date formats", () => {
  const chart = buildReportChartData([
    { date: "02/07/2026", gmv: 100, impressions: 3 },
    { date: "2026-07-02", gmv: 50, views: 2 },
  ]);

  assert.deepEqual(chart, [
    { date: "2026-07-02", gmv: 150, impressions: 5 },
  ]);
});

test("getNextSortState toggles or resets the sort direction", () => {
  assert.deepEqual(getNextSortState("date", true, "date"), {
    sortKey: "date",
    sortAsc: false,
  });
  assert.deepEqual(getNextSortState("date", false, "views"), {
    sortKey: "views",
    sortAsc: true,
  });
});
