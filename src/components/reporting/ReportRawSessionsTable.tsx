import { formatDisplayDate } from "../../shared/utils/appUi";
import { type ReportLogLike } from "../../shared/utils/reportTable";

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
  shifts: string[];
  adminShiftChecklist: string[];
  setAdminShiftChecklist: (value: string[]) => void;
}

interface RawSessionGroupRow {
  label: string;
  duration: number;
  impressions: number;
  gmv: number;
  products_sold: number;
  buyers: number;
  [key: string]: string | number;
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

const formatDuration = (secs: number) => {
  if (!secs) return "-";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h > 0 ? `${h}j ` : ""}${m}m`;
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
  shifts,
  adminShiftChecklist,
  setAdminShiftChecklist,
}: ReportRawSessionsTableProps) {
  const renderGroupedRows = () => {
    const groups: Record<string, RawSessionGroupRow> = {};
    if (reportingShopeeRawTab === "shift" && adminShiftChecklist.length > 0) {
      adminShiftChecklist.forEach((sh) => {
        groups[sh] = {
          label: sh,
          duration: 0,
          impressions: 0,
          gmv: 0,
          products_sold: 0,
          buyers: 0,
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
        if (
          adminShiftChecklist.length > 0 &&
          !adminShiftChecklist.includes(key)
        ) {
          return;
        }
      } else if (reportingShopeeRawTab === "dayOfWeek") {
        const dSplit = dPart.split("-");
        if (dSplit.length === 3) {
          const dateObj =
            dSplit[0].length === 4
              ? new Date(dPart)
              : new Date(`${dSplit[2]}-${dSplit[1]}-${dSplit[0]}`);
          if (!isNaN(dateObj.getTime())) {
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
          impressions: 0,
          gmv: 0,
          products_sold: 0,
          buyers: 0,
        };
      }
      groups[key].duration = (groups[key].duration || 0) + (log.duration || 0);
      groups[key].impressions +=
        log.impressions || log.views || log.liveVisits || log.penonton || 0;
      groups[key].gmv += log.gmv || 0;
      groups[key].products_sold += log.products_sold || log.items_sold || 0;
      groups[key].buyers += log.buyers || log.orders || 0;
    });

    const idFormatter = new Intl.NumberFormat("id-ID");
    const sortedGroups = Object.values(groups).sort((a, b) => {
      let valA: number | string = (a as Record<string, number | string>)[
        reportDbSortCol
      ] ?? "";
      let valB: number | string = (b as Record<string, number | string>)[
        reportDbSortCol
      ] ?? "";

      if (reportDbSortCol === "date") {
        valA = parseGroupDateLabel(a.label);
        valB = parseGroupDateLabel(b.label);
        if (
          typeof valA === "number" &&
          typeof valB === "number" &&
          !isNaN(valA) &&
          !isNaN(valB)
        ) {
          return reportDbSortAsc ? valA - valB : valB - valA;
        }
        valA = a.label;
        valB = b.label;
      } else if (reportDbSortCol === "views") {
        valA = a.impressions || 0;
        valB = b.impressions || 0;
      } else if (reportDbSortCol === "customers") {
        valA = a.buyers || 0;
        valB = b.buyers || 0;
      } else if (reportDbSortCol === "gmv") {
        valA = a.gmv || 0;
        valB = b.gmv || 0;
      } else if (reportDbSortCol === "products_sold") {
        valA = a.products_sold || 0;
        valB = b.products_sold || 0;
      } else if (reportDbSortCol === "duration") {
        valA = a.duration || 0;
        valB = b.duration || 0;
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
          {formatDuration(g.duration || 0)}
        </td>
        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-700">
          {idFormatter.format(g.impressions)}
        </td>
        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-black text-emerald-600">
          Rp{idFormatter.format(g.gmv)}
        </td>
        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-700">
          {idFormatter.format(g.products_sold)}
        </td>
        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-indigo-600">
          {idFormatter.format(g.buyers)}
        </td>
        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-black text-indigo-600">
          {g.impressions > 0 ? ((g.buyers / g.impressions) * 100).toFixed(2) : "0.00"}%
        </td>
        <td className="px-5 py-3.5" />
      </tr>
    ));
  };

  return (
    <>
      {isLogsLoading ? (
        <tr>
          <td
            colSpan={8}
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
          <td colSpan={9} className="px-5 py-10 text-center text-slate-400">
            Tidak ada sesi ditemukan.
          </td>
        </tr>
      ) : (
        <>
          {reportingShopeeRawTab !== "raw"
            ? renderGroupedRows()
            : paginatedLogs.map((log, idx) => {
                const isLogShopee =
                  log.platform && log.platform.toLowerCase().includes("shopee");
                const lViews = isLogShopee
                  ? log.penonton || log.impressions || log.views || 0
                  : log.impressions || log.views || log.liveVisits || 0;

                return (
                  <tr
                    key={log.id || idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-slate-400">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      <div className="flex flex-col">
                        <span>
                          {formatDisplayDate(
                            log.dateTime || log.date,
                            log.platform,
                          )}
                        </span>
                        <span className="text-[9px] text-indigo-500">
                          {log.platform}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">
                      {log.dateTime
                        ? log.dateTime.includes(" ")
                          ? log.dateTime.split(" ")[1]
                          : "-"
                        : "-"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-slate-500">
                      {formatDuration(log.duration || 0)}
                    </td>
                    <td className="px-5 py-3.5">
                      {new Intl.NumberFormat("id-ID").format(lViews)}
                    </td>
                    <td className="px-5 py-3.5">
                      Rp
                      {new Intl.NumberFormat("id-ID", {
                        maximumFractionDigits: 0,
                      }).format(log.gmv || 0)}
                    </td>
                    <td className="px-5 py-3.5">
                      {new Intl.NumberFormat("id-ID").format(
                        log.products_sold || log.items_sold || 0,
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {new Intl.NumberFormat("id-ID").format(log.buyers || 0)}
                    </td>
                    <td className="px-5 py-3.5">
                      {lViews > 0
                        ? (
                            ((log.buyers || log.orders || 0) / lViews) * 100
                          ).toFixed(2)
                        : "0.00"}
                      %
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
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
