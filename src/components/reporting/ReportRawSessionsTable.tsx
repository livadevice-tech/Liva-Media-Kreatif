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
}: ReportRawSessionsTableProps) {
  const hc = brandDashboardSettings?.hiddenColumns || [];
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
        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-slate-500">
          {formatLiveSessionDuration(g.duration || 0)}
        </td>
        {!hc.includes("penonton") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-700">
            {idFormatter.format(g.viewer)}
          </td>
        )}
        {!hc.includes("gmv") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-black text-emerald-600">
            Rp{idFormatter.format(g.gmv)}
          </td>
        )}
        {!hc.includes("items_sold") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-700">
            {idFormatter.format(g.itemsSold)}
          </td>
        )}
        {!hc.includes("engagement") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-500">
            {formatLiveSessionAverageDuration(
              g.sessionCount > 0 ? g.avgViewDuration / g.sessionCount : 0,
            )}
          </td>
        )}
        {!hc.includes("orders") && (
          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-indigo-600">
            {idFormatter.format(g.customers)}
          </td>
        )}
        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-black text-indigo-600">
          {(() => {
            const platform = String(g.platform || "").toLowerCase();
            const isTikTok = platform.includes("tiktok");
            const cr = isTikTok
              ? g.clicks > 0 ? (g.orders / g.clicks) * 100 : 0
              : g.viewer > 0 ? (g.customers / g.viewer) * 100 : 0;
            return `${cr.toFixed(2)}%`;
          })()}
        </td>
        <td className="px-5 py-3.5 text-right" />
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
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-slate-500">
                      {formatLiveSessionDuration(log.duration || 0)}
                    </td>
                    {!hc.includes("penonton") && (
                      <td className="px-5 py-3.5">
                        {new Intl.NumberFormat("id-ID").format(metrics.viewer)}
                      </td>
                    )}
                    {!hc.includes("gmv") && (
                      <td className="px-5 py-3.5">
                        Rp
                        {new Intl.NumberFormat("id-ID", {
                          maximumFractionDigits: 0,
                        }).format(log.gmv || 0)}
                      </td>
                    )}
                    {!hc.includes("items_sold") && (
                      <td className="px-5 py-3.5">
                        {new Intl.NumberFormat("id-ID").format(
                          log.products_sold || log.items_sold || 0,
                        )}
                      </td>
                    )}
                    {!hc.includes("engagement") && (
                      <td className="px-5 py-3.5">
                        {formatLiveSessionAverageDuration(log.avgViewDuration || 0)}
                      </td>
                    )}
                    {!hc.includes("orders") && (
                      <td className="px-5 py-3.5">
                        {new Intl.NumberFormat("id-ID").format(metrics.customers)}
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      {metrics.conversionRate.toFixed(2)}%
                    </td>
                    <td className="px-5 py-3.5 text-right">
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
                    </td>
                  </tr>
                );
              })}
        </>
      )}
    </>
  );
}
