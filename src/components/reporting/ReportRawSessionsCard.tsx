import React from "react";
import * as XLSX from "xlsx";
import { ReportRawTableControls } from "./ReportRawTableControls";
import { ReportRawSessionsTable } from "./ReportRawSessionsTable";
import { type ReportLogLike } from "../../shared/utils/reportTable";
import { formatDisplayDate } from "../../shared/utils/appUi";
import {
  formatLiveSessionDuration,
  getLiveSessionMetrics,
} from "../../shared/utils/liveSessionsTable";
import type { BrandDashboardSettings } from "../../types";

interface ReportRawSessionsCardProps {
  brandName?: string;
  reportingShopeeRawTab: "day" | "shift" | "dayOfWeek" | "raw";
  setReportingShopeeRawTab: (
    value: "day" | "shift" | "dayOfWeek" | "raw",
  ) => void;
  shifts: string[];
  adminShiftChecklist: string[];
  setAdminShiftChecklist: (value: string[]) => void;
  isLogsLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  reportDbSortCol: string;
  reportDbSortAsc: boolean;
  onSort: (col: string) => void;
  onDeletePerformanceLog: (
    id: string,
    brandName?: string,
    date?: string,
  ) => void;
  onEditPerformanceLogDuration?: (
    id: string,
    newDuration: number,
  ) => void;
  totalPages: number;
  setCurrentPage: (
    value: number | ((prev: number) => number),
  ) => void;
  sortedTableLogs: ReportLogLike[];
  paginatedLogs: ReportLogLike[];
  brandDashboardSettings?: BrandDashboardSettings;
  isShopee?: boolean;
  hideControls?: boolean;
  isClientView?: boolean;
}

const RAW_TABLE_COLUMNS = {
  grouped: {
    firstHeader: {
      day: "Tanggal",
      shift: "Shift",
      dayOfWeek: "Hari",
    },
  },
};

function getGroupedFirstHeader(tab: "day" | "shift" | "dayOfWeek") {
  return RAW_TABLE_COLUMNS.grouped.firstHeader[tab];
}

export function ReportRawSessionsCard({
  brandName,
  reportingShopeeRawTab,
  setReportingShopeeRawTab,
  shifts,
  adminShiftChecklist,
  setAdminShiftChecklist,
  sortedTableLogs,
  paginatedLogs,
  isLogsLoading,
  currentPage,
  itemsPerPage,
  reportDbSortCol,
  reportDbSortAsc,
  onSort,
  onDeletePerformanceLog,
  totalPages,
  setCurrentPage,
  brandDashboardSettings,
  isShopee = true,
  hideControls = false,
  isClientView = false,
  onEditPerformanceLogDuration,
}: ReportRawSessionsCardProps) {
  const isGroupedView = reportingShopeeRawTab !== "raw";
  const hc = brandDashboardSettings?.hiddenColumns || [];
  const isColumnHidden = (id: string) => hc.includes(isShopee ? `shopee_live_${id}` : `tiktok_live_${id}`);

  const handleExportTableExcel = () => {
    if (!sortedTableLogs || sortedTableLogs.length === 0) return;

    let rows: any[] = [];
    const cleanBrand = brandName ? brandName.replace(/[^a-zA-Z0-9_-]/g, "_") : "Brand";

    const platformLabel = isShopee ? "Shopee_Live" : "TikTok_Live";

    if (reportingShopeeRawTab === "raw") {
      // Export per session (saat di-start)
      rows = sortedTableLogs.map((log, idx) => {
        const metrics = getLiveSessionMetrics(log);
        const startFormatted = formatDisplayDate(log.dateTime || log.date, log.platform);
        return {
          "No": idx + 1,
          "Tanggal & Jam Mulai": startFormatted || log.dateTime || log.date || "-",
          "Durasi": formatLiveSessionDuration(log.duration || 0),
          [isShopee ? "Views" : "Live Viewer"]: metrics.viewer,
          "GMV (Rp)": log.gmv || 0,
          "Item Sold": log.products_sold || log.items_sold || 0,
          "Avg. View Duration (detik)": Number((log.avgViewDuration || 0).toFixed(2)),
          [isShopee ? "Purchase" : "Orders"]: isShopee ? (metrics.orders || metrics.customers) : metrics.orders,
          [isShopee ? "Add to Cart" : "Product Clicks"]: metrics.clicks,
          "Conversion Rate (%)": Number(metrics.conversionRate.toFixed(2)),
          "Platform": log.platform || (isShopee ? "Shopee Live" : "TikTok Live"),
          "Shift": log.shift || "-",
        };
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sesi Live");
      XLSX.writeFile(wb, `Laporan_${cleanBrand}_${platformLabel}_Sesi_Per_Start.xlsx`);
    } else if (reportingShopeeRawTab === "day") {
      // Export Akumulasi Harian
      const groups: Record<string, any> = {};
      sortedTableLogs.forEach((log) => {
        const dStr = String(log.dateTime || log.date || "");
        const dPart = dStr.includes("T") ? dStr.split("T")[0] : dStr.split(" ")[0];
        let key = dPart;
        const dSplit = dPart.split("-");
        if (dSplit.length === 3) {
          key = dSplit[0].length === 4 ? `${dSplit[2]}-${dSplit[1]}-${dSplit[0]}` : `${dSplit[0]}-${dSplit[1]}-${dSplit[2]}`;
        }
        if (!groups[key]) {
          groups[key] = { label: key, rawDate: dPart, sessionCount: 0, duration: 0, viewer: 0, gmv: 0, itemsSold: 0, orders: 0, clicks: 0, avgViewDurationSum: 0 };
        }
        const g = groups[key];
        const m = getLiveSessionMetrics(log);
        g.sessionCount += 1;
        g.duration += (log.duration || 0);
        g.viewer += m.viewer;
        g.gmv += (log.gmv || 0);
        g.itemsSold += (log.products_sold || log.items_sold || 0);
        g.orders += (isShopee ? (m.orders || m.customers) : m.orders);
        g.clicks += m.clicks;
        g.avgViewDurationSum += (log.avgViewDuration || 0);
      });
      const sortedGroups = Object.values(groups).sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
      rows = sortedGroups.map((g, idx) => {
        const avgView = g.sessionCount > 0 ? g.avgViewDurationSum / g.sessionCount : 0;
        const cr = isShopee ? (g.viewer > 0 ? (g.orders / g.viewer) * 100 : 0) : (g.clicks > 0 ? (g.orders / g.clicks) * 100 : 0);
        return {
          "No": idx + 1,
          "Tanggal": g.label,
          "Jumlah Sesi": g.sessionCount,
          "Total Durasi": formatLiveSessionDuration(g.duration),
          [isShopee ? "Total Views" : "Total Live Viewer"]: g.viewer,
          "Total GMV (Rp)": g.gmv,
          "Item Sold": g.itemsSold,
          "Avg. View Duration (detik)": Number(avgView.toFixed(2)),
          [isShopee ? "Total Purchase" : "Total Orders"]: g.orders,
          [isShopee ? "Total Add to Cart" : "Total Product Clicks"]: g.clicks,
          "Conversion Rate (%)": Number(cr.toFixed(2)),
        };
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Akumulasi Harian");
      XLSX.writeFile(wb, `Laporan_${cleanBrand}_${platformLabel}_Akumulasi_Harian.xlsx`);
    } else if (reportingShopeeRawTab === "shift") {
      // Export per shift
      const groups: Record<string, any> = {};
      sortedTableLogs.forEach((log) => {
        const key = log.shift || "Lainnya";
        if (adminShiftChecklist.length > 0 && !adminShiftChecklist.includes(key)) return;
        if (!groups[key]) {
          groups[key] = { label: key, sessionCount: 0, duration: 0, viewer: 0, gmv: 0, itemsSold: 0, orders: 0, clicks: 0, avgViewDurationSum: 0 };
        }
        const g = groups[key];
        const m = getLiveSessionMetrics(log);
        g.sessionCount += 1;
        g.duration += (log.duration || 0);
        g.viewer += m.viewer;
        g.gmv += (log.gmv || 0);
        g.itemsSold += (log.products_sold || log.items_sold || 0);
        g.orders += (isShopee ? (m.orders || m.customers) : m.orders);
        g.clicks += m.clicks;
        g.avgViewDurationSum += (log.avgViewDuration || 0);
      });
      rows = Object.values(groups).map((g, idx) => {
        const avgView = g.sessionCount > 0 ? g.avgViewDurationSum / g.sessionCount : 0;
        const cr = isShopee ? (g.viewer > 0 ? (g.orders / g.viewer) * 100 : 0) : (g.clicks > 0 ? (g.orders / g.clicks) * 100 : 0);
        return {
          "No": idx + 1,
          "Shift": g.label,
          "Jumlah Sesi": g.sessionCount,
          "Total Durasi": formatLiveSessionDuration(g.duration),
          [isShopee ? "Total Views" : "Total Live Viewer"]: g.viewer,
          "Total GMV (Rp)": g.gmv,
          "Item Sold": g.itemsSold,
          "Avg. View Duration (detik)": Number(avgView.toFixed(2)),
          [isShopee ? "Total Purchase" : "Total Orders"]: g.orders,
          [isShopee ? "Total Add to Cart" : "Total Product Clicks"]: g.clicks,
          "Conversion Rate (%)": Number(cr.toFixed(2)),
        };
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Per Shift");
      XLSX.writeFile(wb, `Laporan_${cleanBrand}_${platformLabel}_Per_Shift.xlsx`);
    } else {
      // Export per hari dalam seminggu
      const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const groups: Record<string, any> = {};
      sortedTableLogs.forEach((log) => {
        const dStr = String(log.dateTime || log.date || "");
        const dPart = dStr.includes("T") ? dStr.split("T")[0] : dStr.split(" ")[0];
        const dSplit = dPart.split("-");
        let dayName = "Unknown";
        if (dSplit.length === 3) {
          const dateObj = dSplit[0].length === 4 ? new Date(dPart) : new Date(`${dSplit[2]}-${dSplit[1]}-${dSplit[0]}`);
          if (!Number.isNaN(dateObj.getTime())) {
            dayName = DAYS[dateObj.getDay()];
          }
        }
        if (!groups[dayName]) {
          groups[dayName] = { label: dayName, sessionCount: 0, duration: 0, viewer: 0, gmv: 0, itemsSold: 0, orders: 0, clicks: 0, avgViewDurationSum: 0 };
        }
        const g = groups[dayName];
        const m = getLiveSessionMetrics(log);
        g.sessionCount += 1;
        g.duration += (log.duration || 0);
        g.viewer += m.viewer;
        g.gmv += (log.gmv || 0);
        g.itemsSold += (log.products_sold || log.items_sold || 0);
        g.orders += (isShopee ? (m.orders || m.customers) : m.orders);
        g.clicks += m.clicks;
        g.avgViewDurationSum += (log.avgViewDuration || 0);
      });
      rows = Object.values(groups).map((g, idx) => {
        const avgView = g.sessionCount > 0 ? g.avgViewDurationSum / g.sessionCount : 0;
        const cr = isShopee ? (g.viewer > 0 ? (g.orders / g.viewer) * 100 : 0) : (g.clicks > 0 ? (g.orders / g.clicks) * 100 : 0);
        return {
          "No": idx + 1,
          "Hari": g.label,
          "Jumlah Sesi": g.sessionCount,
          "Total Durasi": formatLiveSessionDuration(g.duration),
          [isShopee ? "Total Views" : "Total Live Viewer"]: g.viewer,
          "Total GMV (Rp)": g.gmv,
          "Item Sold": g.itemsSold,
          "Avg. View Duration (detik)": Number(avgView.toFixed(2)),
          [isShopee ? "Total Purchase" : "Total Orders"]: g.orders,
          [isShopee ? "Total Add to Cart" : "Total Product Clicks"]: g.clicks,
          "Conversion Rate (%)": Number(cr.toFixed(2)),
        };
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Per Hari");
      XLSX.writeFile(wb, `Laporan_${cleanBrand}_${platformLabel}_Per_Hari.xlsx`);
    }
  };

  return (
    <>
      {!hideControls && (
        <ReportRawTableControls
          reportingShopeeRawTab={reportingShopeeRawTab}
          setReportingShopeeRawTab={setReportingShopeeRawTab}
          shifts={shifts}
          adminShiftChecklist={adminShiftChecklist}
          setAdminShiftChecklist={setAdminShiftChecklist}
          title={isShopee ? "Performa Shopee Live Harian" : "Performa TikTok Live Harian"}
          isClientView={isClientView}
          onExportTable={handleExportTableExcel}
        />
      )}

      <div className="bg-white border border-slate-100 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-[#f8fafc] border-b border-slate-100 uppercase text-[9px] font-black text-slate-500 tracking-[0.18em]">
            <tr>
              <th className="w-14 px-5 py-4">No</th>
              {isGroupedView ? (
                <>
                  <th
                    className="px-5 py-4 cursor-pointer hover:bg-slate-100"
                    onClick={() => onSort("date")}
                  >
                    {reportingShopeeRawTab === "day"
                      ? getGroupedFirstHeader("day")
                      : reportingShopeeRawTab === "shift"
                        ? getGroupedFirstHeader("shift")
                        : getGroupedFirstHeader("dayOfWeek")}{" "}
                    {reportDbSortCol === "date"
                      ? reportDbSortAsc
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  {!isColumnHidden("duration") && (
                    <th
                      className="px-5 py-4 cursor-pointer hover:bg-slate-100"
                      onClick={() => onSort("duration")}
                    >
                      Durasi{" "}
                      {reportDbSortCol === "duration"
                        ? reportDbSortAsc
                          ? "↑"
                          : "↓"
                        : ""}
                    </th>
                  )}
                </>
              ) : (
                <>
                  <th
                    className="px-0.5 sm:px-5 py-2 sm:py-4 cursor-pointer hover:bg-slate-100"
                    onClick={() => onSort("date")}
                  >
                    Tanggal{" "}
                    {reportDbSortCol === "date"
                      ? reportDbSortAsc
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  {!isColumnHidden("duration") && (
                    <th
                      className="px-0.5 sm:px-5 py-2 sm:py-4 cursor-pointer hover:bg-slate-100"
                      onClick={() => onSort("duration")}
                    >
                      Durasi{" "}
                      {reportDbSortCol === "duration"
                        ? reportDbSortAsc
                          ? "↑"
                          : "↓"
                        : ""}
                    </th>
                  )}
                </>
              )}
              {!isColumnHidden("penonton") && (
                <th
                  className="px-0.5 sm:px-5 py-2 sm:py-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => onSort("views")}
                >
                  Viewer{" "}
                  {reportDbSortCol === "views" ? (reportDbSortAsc ? "↑" : "↓") : ""}
                </th>
              )}
              {!isColumnHidden("gmv") && (
                <th
                  className="px-0.5 sm:px-5 py-2 sm:py-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => onSort("gmv")}
                >
                  <span className="md:hidden">GMV</span>
                  <span className="hidden md:inline">GMV (Rp)</span>{" "}
                  {reportDbSortCol === "gmv" ? (reportDbSortAsc ? "↑" : "↓") : ""}
                </th>
              )}
              {!isColumnHidden("items_sold") && (
                <th
                  className="px-0.5 sm:px-5 py-2 sm:py-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => onSort("products_sold")}
                >
                  <span className="md:hidden">Sold</span>
                  <span className="hidden md:inline">Items Sold</span>{" "}
                  {reportDbSortCol === "products_sold"
                    ? reportDbSortAsc
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
              )}
              {!isColumnHidden("engagement") && (
                <th
                  className="px-0.5 sm:px-5 py-2 sm:py-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => onSort("avgViewDuration")}
                >
                  <span className="md:hidden">Avg</span>
                  <span className="hidden md:inline">Avg. View Duration</span>{" "}
                  {reportDbSortCol === "avgViewDuration"
                    ? reportDbSortAsc
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
              )}
              {!isColumnHidden("orders") && (
                <th
                  className="px-0.5 sm:px-5 py-2 sm:py-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => onSort("customers")}
                >
                  <span className="md:hidden">Cust</span>
                  <span className="hidden md:inline">{isShopee ? "Customers" : "Orders"}</span>{" "}
                  {reportDbSortCol === "customers"
                    ? reportDbSortAsc
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
              )}
              {!isColumnHidden("conversion_rate") && (
                <th className="px-5 py-4">Conversion Rate</th>
              )}
              {!isClientView && (
                <th className="px-5 py-4 text-right">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700 bg-white">
            <ReportRawSessionsTable
              reportingShopeeRawTab={reportingShopeeRawTab}
              sortedTableLogs={sortedTableLogs}
              paginatedLogs={paginatedLogs}
              isLogsLoading={isLogsLoading}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              reportDbSortCol={reportDbSortCol}
              reportDbSortAsc={reportDbSortAsc}
              onSort={onSort}
              onDeletePerformanceLog={onDeletePerformanceLog}
              onEditPerformanceLogDuration={onEditPerformanceLogDuration}
              adminShiftChecklist={adminShiftChecklist}
              brandDashboardSettings={brandDashboardSettings}
              isShopee={isShopee}
              isClientView={isClientView}
            />
          </tbody>
        </table>
      </div>

      {totalPages > 1 && reportingShopeeRawTab === "raw" && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, sortedTableLogs.length)} dari{" "}
            {sortedTableLogs.length} data
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1.5">
              Halaman {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </>
  );
}
