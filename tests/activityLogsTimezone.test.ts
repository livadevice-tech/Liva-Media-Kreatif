import test from "node:test";
import assert from "node:assert/strict";

function formatDateActivityLog(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    const normalized = dateStr.includes("T")
      ? dateStr
      : dateStr.replace(" ", "T") + (dateStr.length === 19 ? "+07:00" : "");
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  } catch {
    return dateStr;
  }
}

function getLogDateKey(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const normalized = dateStr.includes("T")
      ? dateStr
      : dateStr.replace(" ", "T") + (dateStr.length === 19 ? "+07:00" : "");
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(d);
  } catch {
    return "";
  }
}

test("formatDateActivityLog correctly formats WIB time from MySQL UTC or ISO string", () => {
  // Rani clocked in at 07:51:33 AM WIB
  const formattedWithT = formatDateActivityLog("2026-09-29T07:51:33+07:00");
  assert.equal(formattedWithT, "29 Sep 2026, 07.51.33");

  const formattedWithSpace = formatDateActivityLog("2026-09-29 07:51:33");
  assert.equal(formattedWithSpace, "29 Sep 2026, 07.51.33");

  const formattedUtcIso = formatDateActivityLog("2026-09-29T00:51:33.000Z");
  assert.equal(formattedUtcIso, "29 Sep 2026, 07.51.33");

  // Dwi logged in at 07:06:25 AM WIB
  const dwiFormatted = formatDateActivityLog("2026-09-29T07:06:25+07:00");
  assert.equal(dwiFormatted, "29 Sep 2026, 07.06.25");
});

test("getLogDateKey resolves date accurately in Asia/Jakarta timezone", () => {
  assert.equal(getLogDateKey("2026-09-29T07:51:33+07:00"), "2026-09-29");
  assert.equal(getLogDateKey("2026-09-29 07:51:33"), "2026-09-29");
  assert.equal(getLogDateKey("2026-09-29T00:51:33.000Z"), "2026-09-29");
});
