import { useMemo } from "react";
import { UploadHistoryCard } from "./UploadHistoryCard";

interface UploadHistoryLike {
  id: string;
  brandId?: string;
  brandName?: string;
  platform?: string;
  fileName?: string;
  uploadedAt?: string;
  rowCount?: number;
  gmv?: number;
  reportType?: string;
}

interface BrandPerformanceLogLike {
  brandId: string;
  reportType?: string;
  batchId?: string;
  brandName?: string;
  platform?: string;
  uploadedAt?: string;
  gmv?: number;
}

interface ReportEngagementUploadHistoryProps {
  activeReportBrandId: string;
  brandPerformanceLogs: BrandPerformanceLogLike[];
  brandUploadHistory: UploadHistoryLike[];
  uploadHistory: UploadHistoryLike[];
  isLogsLoading: boolean;
  onDeleteUploadBatch: (
    id: string,
    fileName: string,
    rowCount: number,
  ) => void;
}

export function ReportEngagementUploadHistory({
  activeReportBrandId,
  brandPerformanceLogs,
  brandUploadHistory,
  uploadHistory,
  isLogsLoading,
  onDeleteUploadBatch,
}: ReportEngagementUploadHistoryProps) {
  const completeUploadHistory = useMemo(() => {
    const batchesMap = new Map<string, UploadHistoryLike & { rowCount: number; gmv: number }>();

    brandPerformanceLogs
      .filter(
        (log) =>
          log.brandId === activeReportBrandId &&
          log.reportType === "engagement",
      )
      .forEach((log) => {
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
        history.reportType === "engagement" &&
        !existingBatchIds.has(history.id),
    );

    return [
      ...brandUploadHistory.filter(
        (history) =>
          history.brandId === activeReportBrandId &&
          history.reportType === "engagement",
      ),
      ...missingBatches,
      ...localHistories,
    ]
      .reduce((acc: UploadHistoryLike[], current) => {
        if (acc.some((item) => item.id === current.id)) return acc;
        acc.push(current);
        return acc;
      }, [])
      .sort(
        (a, b) =>
          new Date(b.uploadedAt || 0).getTime() -
          new Date(a.uploadedAt || 0).getTime(),
      );
  }, [activeReportBrandId, brandPerformanceLogs, brandUploadHistory, uploadHistory]);

  return (
    <UploadHistoryCard
      title="Riwayat Upload Data Engagement"
      description="History file CSV raw data performa yang telah berhasil dikonversi dan masuk ke database sentral."
      histories={completeUploadHistory}
      isLoading={isLogsLoading}
      emptyMessage="Belum ada riwayat upload untuk brand ini."
      onDeleteBatch={onDeleteUploadBatch}
    />
  );
}
