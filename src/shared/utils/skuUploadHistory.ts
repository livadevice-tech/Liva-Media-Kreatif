import type { SkuLogEntry } from "../types/reporting";

export interface SkuUploadHistoryRow {
  batchId: string;
  uploadedAt: string;
  records: number;
  platform: string;
}

export function buildSkuUploadHistoryRows(
  brandSkuLogs: readonly SkuLogEntry[],
): SkuUploadHistoryRow[] {
  return Array.from(
    brandSkuLogs
      .reduce((acc, log) => {
        if (!log.batchId) return acc;
        const existing = acc.get(log.batchId);
        if (existing) {
          existing.records += 1;
        } else {
          acc.set(log.batchId, {
            batchId: log.batchId,
            uploadedAt: log.uploadedAt || "",
            records: 1,
            platform: log.platform || "Shopee Live",
          });
        }
        return acc;
      }, new Map<string, SkuUploadHistoryRow>())
      .values(),
  ).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}
