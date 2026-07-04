import assert from "node:assert/strict";
import test from "node:test";

import { findReportingUploadHeaderRowIndex } from "../src/shared/utils/uploadAutoDetect";

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
