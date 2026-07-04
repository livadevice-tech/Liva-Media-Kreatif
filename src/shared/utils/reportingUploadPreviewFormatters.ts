import { formatDisplayDate } from "./appUi";
import type { ReportingRawRow } from "../types/reporting";

export function formatReportingPreviewGroupDuration(seconds?: number): string {
  const totalSeconds = seconds || 0;
  if (!totalSeconds) return "-";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours > 0 ? `${hours}j ` : ""}${minutes}m`;
}

export function formatReportingPreviewDurationMinutes(seconds?: number): string {
  if (!seconds) return "-";
  return `${Math.round(seconds / 60) || seconds} Mnt`;
}

export function formatReportingPreviewDate(
  row: Pick<ReportingRawRow, "dateTime" | "date">,
  saveTargetPlatform: string,
): string {
  if (saveTargetPlatform === "Shopee Live") {
    const rawStr = String(row.dateTime || row.date || "");
    const dPart = rawStr.split(" ")[0] || "";
    const dSplit = dPart.split("-");
    if (dSplit.length === 3 && dSplit[0].length === 4) {
      return `${dSplit[2]}-${dSplit[1]}-${dSplit[0]}`;
    }
    return dPart;
  }

  return formatDisplayDate(row.dateTime || row.date, saveTargetPlatform);
}

export function formatReportingPreviewShopeeTime(
  row: Pick<ReportingRawRow, "dateTime" | "date">,
): string {
  const rawStr = String(row.dateTime || row.date || "");
  const match = rawStr.match(/\d{1,2}:\d{2}(:\d{2})?/);
  if (!match) return "-";

  let formatted = match[0].replace(":", ".");
  if (formatted.startsWith("0") && formatted.length > 4) {
    formatted = formatted.substring(1);
  }
  return formatted;
}

export function formatReportingPreviewShopeeRawDate(
  row: Pick<ReportingRawRow, "dateTime" | "date">,
): string {
  const rawStr = String(row.dateTime || row.date || "");
  const dPart = rawStr.split(" ")[0] || "";
  const dSplit = dPart.split("-");
  if (dSplit.length === 3 && dSplit[0].length === 4) {
    return `${dSplit[2]}-${dSplit[1]}-${dSplit[0]}`;
  }
  return dPart;
}

export function formatReportingPreviewRate(
  numerator: number,
  denominator: number,
): string {
  if (denominator <= 0) return "0.00";
  return ((numerator / denominator) * 100).toFixed(2);
}

export function formatReportingPreviewCtr(
  row: Pick<
    ReportingRawRow,
    "likes" | "comments" | "shares" | "followers" | "penonton" | "impressions"
  >,
): string {
  const uniqueViewers = row.penonton || row.impressions || 0;
  return formatReportingPreviewRate(
    (row.likes || 0) + (row.comments || 0) + (row.shares || 0) + (row.followers || 0),
    uniqueViewers,
  );
}

export function formatReportingPreviewCvr(
  row: Pick<ReportingRawRow, "buyers" | "penonton" | "impressions">,
): string {
  return formatReportingPreviewRate(row.buyers || 0, row.penonton || row.impressions || 0 || 1);
}
