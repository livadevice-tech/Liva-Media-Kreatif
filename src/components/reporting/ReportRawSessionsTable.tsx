import React, { useState } from "react";
import { formatDisplayDate } from "../../shared/utils/appUi";
import {
  formatLiveSessionAverageDuration,
  formatLiveSessionDuration,
  getLiveSessionConversionRate,
  getLiveSessionMetrics,
} from "../../shared/utils/liveSessionsTable";
import { type ReportLogLike } from "../../shared/utils/reportTable";
import type { BrandDashboardSettings } from "../../types";

interface ReportRawSessionsTableProps {
  reportingShopeeRawTab: "day" | "shift" | "dayOfWeek" | "raw";
  sortedTableLogs: ReportLogLike[];
  paginatedLogs: ReportLogLike[];
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
  adminShiftChecklist: string[];
  brandDashboardSettings?: BrandDashboardSettings;
  isShopee?: boolean;
  isClientView?: boolean;
  onEditPerformanceLogDuration?: (id: string, newDuration: number) => void;
}

interface RawSessionGroupRow {
  label: string;
  duration: number;
  viewer: number;
  gmv: number;
  itemsSold: number;
  avgViewDuration: number;
  customers: number;
  sessionCount: number;
  clicks: number;
  orders: number;
  platform?: string;
}

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const parseGroupDateLabel = (lbl: string) => {
  const parts = lbl.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    return new Date(lbl).getTime();
  }
  return lbl;
};

export function ReportRawSessionsTable({
  reportingShopeeRawTab,
  sortedTableLogs,
  paginatedLogs,
  isLogsLoading,
  currentPage,
  itemsPerPage,
  reportDbSortCol,
  reportDbSortAsc,
  onSort,
  onDeletePerformanceLog,
  adminShiftChecklist,
  brandDashboardSettings,
  isShopee = true,
  isClientView,
  onEditPerformanceLogDuration,
}: ReportRawSessionsTableProps) {
  const [editingDurationId, setEditingDurationId] = useState<string | null>(null);
  const [editingDurationStr, setEditingDurationStr] = useState<string>("");
  const hc = brandDashboardSettings?.hiddenColumns || [];
  const isColumnHidden = (id: string) => hc.includes(isShopee ? `shopee_live_${id}` : `tiktok_live_${id}`);
  const renderGroupedRows = () => {
    const groups: Record<string, RawSessionGroupRow> = {};

    if (reportingShopeeRawTab === "shift" && adminShiftChecklist.length > 0) {
      adminShiftChecklist.forEach((sh) => {
        groups[sh] = {
          label: sh,
          duration: 0,
          viewer: 0,
          gmv: 0,
          itemsSold: 0,
          avgViewDuration: 0,
          customers: 0,
          sessionCount: 0,
          clicks: 0,
          orders: 0,
          platform: undefined,
        };
      });
    }

    sortedTableLogs.forEach((log) => {
      let key = "";
      const dStr = String(log.dateTime || log.date || "");
      const dPart = dStr.includes("T") ? dStr.split("T")[0] : dStr.split(" ")[0];

      if (reportingShopeeRawTab === "day") {
        const dSplit = dPart.split("-");
        if (dSplit.length === 3) {
          if (dSplit[0].length === 4) {
            key = `${dSplit[2]}-${dSplit[1]}-${dSplit[0]}`;
          } else {
            key = `${dSplit[0]}-${dSplit[1]}-${dSplit[2]}`;
          }
        } else {
          key = dPart;
        }
      } else if (reportingShopeeRawTab === "shift") {
        key = log.shift || "Lainnya";
        if (adminShiftChecklist.length > 0 && !adminShiftChecklist.includes(key)) {
          return;
        }
      } else if (reportingShopeeRawTab === "dayOfWeek") {
        const dSplit = dPart.split("-");
        if (dSplit.length === 3) {
          const dateObj =
            dSplit[0].length === 4
              ? new Date(dPart)
              : new Date(`${dSplit[2]}-${dSplit[1]}-${dSplit[0]}`);
          if (!Number.isNaN(dateObj.getTime())) {
            key = DAYS[dateObj.getDay()];
          } else {
            key = "Unknown";
          }
        } else {
          key = "Unknown";
        }
      }

      if (!groups[key]) {
        groups[key] = {
          label: key,
          duration: 0,
          viewer: 0,
          gmv: 0,
          itemsSold: 0,
          avgViewDuration: 0,
          customers: 0,
          sessionCount: 0,
          clicks: 0,
          orders: 0,
          platform: log.platform,
        };
      }

      const metrics = getLiveSessionMetrics(log);
      groups[key].duration += log.duration || 0;
      groups[key].viewer += metrics.viewer;
      groups[key].gmv += metrics.gmv;
      groups[key].itemsSold += metrics.itemsSold;
      groups[key].avgViewDuration += metrics.avgViewDuration;
      groups[key].customers += metrics.customers;
      groups[key].clicks += metrics.clicks;
      groups[key].orders += metrics.orders;
      groups[key].sessionCount += 1;
    });

    const idFormatter = new Intl.NumberFormat("id-ID");
    const sortedGroups = Object.values(groups).sort((a, b) => {
      let valA: number | string = "";
      let valB: number | string = "";

      if (reportDbSortCol === "duration") {
        valA = a.duration || 0;
        valB = b.duration || 0;
      } else if (reportDbSortCol === "views") {
        valA = a.viewer || 0;
        valB = b.viewer || 0;
      } else if (reportDbSortCol === "gmv") {
        valA = a.gmv || 0;
        valB = b.gmv || 0;
      } else if (reportDbSortCol === "products_sold") {
        valA = a.itemsSold || 0;
        valB = b.itemsSold || 0;
      } else if (reportDbSortCol === "customers") {
        valA = a.customers || 0;
        valB = b.customers || 0;
      } else if (reportDbSortCol === "avgViewDuration") {
        valA = a.sessionCount > 0 ? a.avgViewDuration / a.sessionCount : 0;
        valB = b.sessionCount > 0 ? b.avgViewDuration / b.sessionCount : 0;
      }

      if (reportDbSortCol === "date") {
        valA = parseGroupDateLabel(a.label);
        valB = parseGroupDateLabel(b.label);
        if (
          typeof valA === "number" &&
          typeof valB === "number" &&
          !Number.isNaN(valA) &&
          !Number.isNaN(valB)
        ) {
          return reportDbSortAsc ? valA - valB : valB - valA;
        }
        valA = a.label;
        valB = b.label;
      }

      if (valA < valB) return reportDbSortAsc ? -1 : 1;
      if (valA > valB) return reportDbSortAsc ? 1 : -1;
      return 0;
    });

    return sortedGroups.map((g, idx) => (
      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
        <td className="px-5 py-3.5 text-slate-400">{idx + 1}</td>
        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-800">
          {g.label}
        </td>
        {!isColumnHidden("duration") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-slate-500">
            {formatLiveSessionDuration(g.duration || 0)}
          </td>
        )}
        {!isColumnHidden("penonton") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-700">
            {idFormatter.format(g.viewer)}
          </td>
        )}
        {!isColumnHidden("gmv") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-black text-emerald-600">
            Rp{idFormatter.format(g.gmv)}
          </td>
        )}
        {!isColumnHidden("items_sold") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-700">
            {idFormatter.format(g.itemsSold)}
          </td>
        )}
        {!isColumnHidden("engagement") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-500">
            {formatLiveSessionAverageDuration(
              g.sessionCount > 0 ? g.avgViewDuration / g.sessionCount : 0,
            )}
          </td>
        )}
        {!isColumnHidden("orders") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-indigo-600">
            {idFormatter.format(g.customers)}
          </td>
        )}
        {!isColumnHidden("conversion_rate") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-black text-indigo-600">
            {(() => {
              const platform = String(g.platform || "").toLowerCase();
              return getLiveSessionConversionRate(g.orders, g.clicks, platform).toFixed(2);
            })()}%
          </td>
        )}
        {!isClientView && (
          <td className="px-5 py-3.5 text-right" />
        )}
      </tr>
    ));
  };

  return (
    <>
      {isLogsLoading ? (
        <tr>
          <td
            colSpan={10}
            className="px-5 py-16 text-center text-slate-500 font-bold w-full"
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
              Sedang memuat data dari database...
            </div>
          </td>
        </tr>
      ) : sortedTableLogs.length === 0 ? (
        <tr>
          <td colSpan={10} className="px-5 py-10 text-center text-slate-400">
            Tidak ada sesi ditemukan.
          </td>
        </tr>
      ) : (
        <>
          {reportingShopeeRawTab !== "raw"
            ? renderGroupedRows()
            : paginatedLogs.map((log, idx) => {
                const metrics = getLiveSessionMetrics(log);

                return (
                  <tr
                    key={log.id || idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-slate-400">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {formatDisplayDate(log.dateTime || log.date, log.platform)}
                    </td>
                    {!isColumnHidden("duration") && (
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-slate-500">
                        {editingDurationId === log.id ? (
                          <input
                            type="text"
                            value={editingDurationStr}
                            onChange={(e) => setEditingDurationStr(e.target.value)}
                            className="w-24 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="HH:MM:SS"
                            autoFocus
                          />
                        ) : (
                          formatLiveSessionDuration(log.duration || 0)
                        )}
                      </td>
                    )}
                    {!isColumnHidden("penonton") && (
                      <td className="px-5 py-3.5">
                        {new Intl.NumberFormat("id-ID").format(metrics.viewer)}
                      </td>
                    )}
                    {!isColumnHidden("gmv") && (
                      <td className="px-5 py-3.5">
                        Rp
                        {new Intl.NumberFormat("id-ID", {
                          maximumFractionDigits: 0,
                        }).format(log.gmv || 0)}
                      </td>
                    )}
                    {!isColumnHidden("items_sold") && (
                      <td className="px-5 py-3.5">
                        {new Intl.NumberFormat("id-ID").format(
                          log.products_sold || log.items_sold || 0,
                        )}
                      </td>
                    )}
                    {!isColumnHidden("engagement") && (
                      <td className="px-5 py-3.5">
                        {formatLiveSessionAverageDuration(log.avgViewDuration || 0)}
                      </td>
                    )}
                    {!isColumnHidden("orders") && (
                      <td className="px-5 py-3.5">
                        {new Intl.NumberFormat("id-ID").format(metrics.customers)}
                      </td>
                    )}
                    {!isColumnHidden("conversion_rate") && (
                      <td className="px-5 py-3.5">
                        {metrics.conversionRate.toFixed(2)}%
                      </td>
                    )}
                    {!isClientView && (
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {editingDurationId === log.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="Simpan Durasi"
                              className="text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 p-1 rounded"
                              onClick={() => {
                                if (onEditPerformanceLogDuration) {
                                  let newDuration = 0;
                                  const parts = editingDurationStr.split(":").map(p => parseInt(p, 10));
                                  if (parts.length === 3 && !parts.some(isNaN)) {
                                    newDuration = parts[0] * 3600 + parts[1] * 60 + parts[2];
                                  } else if (parts.length === 2 && !parts.some(isNaN)) {
                                    newDuration = parts[0] * 60 + parts[1];
                                  } else {
                                    newDuration = parseInt(editingDurationStr, 10) || 0;
                                  }
                                  onEditPerformanceLogDuration(log.id, newDuration);
                                }
                                setEditingDurationId(null);
                              }}
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              title="Batal"
                              className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-1 rounded"
                              onClick={() => setEditingDurationId(null)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              aria-label="Edit durasi performa live"
                              onClick={() => {
                                setEditingDurationId(log.id);
                                setEditingDurationStr(formatLiveSessionDuration(log.duration || 0));
                              }}
                              className="text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none cursor-pointer bg-transparent border-0"
                              title="Edit Durasi"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              aria-label="Hapus log performa live"
                              onClick={() =>
                                onDeletePerformanceLog(log.id, log.brandName, log.date)
                              }
                              className="text-slate-400 hover:text-red-500 transition-colors focus:outline-none cursor-pointer bg-transparent border-0"
                              title="Hapus Log"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
        </>
      )}
    </>
  );
}
