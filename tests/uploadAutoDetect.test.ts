import assert from "node:assert/strict";
import test from "node:test";

import {
  findReportingUploadHeaderRowIndex,
  detectReportingPlatformFromHeaders,
} from "../src/shared/utils/uploadAutoDetect";

test("findReportingUploadHeaderRowIndex ignores grouped title rows", () => {
  const rows = [
    ["interaksi", "promosi", "data utama", "konversi"],
    ["", "", "", ""],
    ["User ID", "GMV", "Penonton", "Komentar"],
  ];

  assert.equal(findReportingUploadHeaderRowIndex(rows), 2);
});

test("findReportingUploadHeaderRowIndex returns -1 when no header exists", () => {
  assert.equal(findReportingUploadHeaderRowIndex([["A"], ["B"]]), -1);
});

test("detectReportingPlatformFromHeaders detects Shopee Live from raw headers", () => {

  const headers = [
    "Data Period",
    "User Id",
    "No.",
    "Livestream Name",
    "Start Time",
    "Duration:",
    "Engaged Viewers",
    "Comments",
    "ATC",
    "Avg. Viewing Duration",
    "Viewers",
    "Orders(Placed Order)",
    "Orders(Confirmed Order)",
    "Items Sold(Placed Order)",
    "Items Sold(Confirmed Order)",
    "Sales(Placed Order)",
    "Sales(Confirmed Order)",
  ];

  assert.equal(detectReportingPlatformFromHeaders(headers), "Shopee Live");
});
