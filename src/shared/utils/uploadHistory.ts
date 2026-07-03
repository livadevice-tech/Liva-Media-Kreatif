import type { BrandPerformanceLogEntry, UploadHistoryEntry } from "../types/reporting";

type BatchHistory = UploadHistoryEntry & { rowCount: number; gmv: number };

type BuildActiveReportBrandUploadHistoryInput = {
  activeReportBrandId: string;
  brandPerformanceLogs: readonly BrandPerformanceLogEntry[];
  brandUploadHistory: readonly UploadHistoryEntry[];
  uploadHistory: readonly UploadHistoryEntry[];
};

export function buildActiveReportBrandUploadHistory({
  activeReportBrandId,
  brandPerformanceLogs,
  brandUploadHistory,
  uploadHistory,
}: BuildActiveReportBrandUploadHistoryInput): UploadHistoryEntry[] {
  if (!activeReportBrandId) return [];

  const brandLogsForHistory = brandPerformanceLogs.filter(
    (log) =>
      log.brandId === activeReportBrandId &&
      log.reportType !== "engagement",
  );

  const batchesMap = new Map<string, BatchHistory>();

  brandLogsForHistory.forEach((log) => {
    const batchId = log.batchId;
    if (!batchId) return;
    if (!batchesMap.has(batchId)) {
      batchesMap.set(batchId, {
        id: batchId,
        brandId: log.brandId,
        brandName: log.brandName || "Unknown",
        platform: log.platform || "Unknown",
        fileName: "Manual Upload / Legacy Import",
        uploadedAt: log.uploadedAt || new Date(2023, 0, 1).toISOString(),
        rowCount: 0,
        gmv: 0,
      });
    }

    const batch = batchesMap.get(batchId);
    if (!batch) return;
    batch.rowCount += 1;
    batch.gmv += Number(log.gmv) || 0;
  });

  const existingBatchIds = new Set(brandUploadHistory.map((history) => history.id));
  const missingBatches = Array.from(batchesMap.values()).filter(
    (batch) => !existingBatchIds.has(batch.id),
  );

  const localHistories = uploadHistory.filter(
    (history) =>
      history.brandId === activeReportBrandId &&
      history.reportType !== "engagement" &&
      !existingBatchIds.has(history.id),
  );

  return [
    ...brandUploadHistory.filter(
      (history) =>
        history.brandId === activeReportBrandId &&
        history.reportType !== "engagement",
    ),
    ...missingBatches,
    ...localHistories,
  ]
    .reduce((acc: UploadHistoryEntry[], current) => {
      if (acc.some((item) => item.id === current.id)) return acc;
      acc.push(current);
      return acc;
    }, [])
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
}
