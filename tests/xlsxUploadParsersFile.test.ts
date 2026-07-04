import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";

import { readFirstWorksheetRowsFromFile } from "../src/shared/utils/xlsxUploadParsers";

test("readFirstWorksheetRowsFromFile reads the first worksheet rows", async () => {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([
    ["Header"],
    ["Value"],
  ]);
  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");

  const workbookArray = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const file = new File([workbookArray], "sample.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const rows = await readFirstWorksheetRowsFromFile(file);

  assert.deepEqual(rows, [["Header"], ["Value"]]);
});
