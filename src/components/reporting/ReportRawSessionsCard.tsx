import { ReportRawTableControls } from "./ReportRawTableControls";
import { ReportRawSessionsTable } from "./ReportRawSessionsTable";
import { type ReportLogLike } from "../../shared/utils/reportTable";

interface ReportRawSessionsCardProps {
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
  totalPages: number;
  setCurrentPage: (
    value: number | ((prev: number) => number),
  ) => void;
  sortedTableLogs: ReportLogLike[];
  paginatedLogs: ReportLogLike[];
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
}: ReportRawSessionsCardProps) {
  const isGroupedView = reportingShopeeRawTab !== "raw";

  return (
    <>
      <ReportRawTableControls
        reportingShopeeRawTab={reportingShopeeRawTab}
        setReportingShopeeRawTab={setReportingShopeeRawTab}
        shifts={shifts}
        adminShiftChecklist={adminShiftChecklist}
        setAdminShiftChecklist={setAdminShiftChecklist}
      />

      <div className="bg-white border border-slate-100 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-[#f8fafc] border-b border-slate-100 uppercase text-[9px] font-bold text-slate-400 tracking-wider">
            <tr>
              <th className="px-5 py-3.5">No</th>
              {isGroupedView ? (
                <>
                  <th
                    className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
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
                  <th
                    className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                    onClick={() => onSort("duration")}
                  >
                    Durasi{" "}
                    {reportDbSortCol === "duration"
                      ? reportDbSortAsc
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                </>
              ) : (
                <>
                  <th
                    className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                    onClick={() => onSort("date")}
                  >
                    Tanggal{" "}
                    {reportDbSortCol === "date"
                      ? reportDbSortAsc
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th className="px-5 py-3.5">Jam Start Live</th>
                  <th
                    className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                    onClick={() => onSort("duration")}
                  >
                    Durasi{" "}
                    {reportDbSortCol === "duration"
                      ? reportDbSortAsc
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                </>
              )}
              <th
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                onClick={() => onSort("views")}
              >
                Viewers{" "}
                {reportDbSortCol === "views" ? (reportDbSortAsc ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                onClick={() => onSort("gmv")}
              >
                GMV{" "}
                {reportDbSortCol === "gmv" ? (reportDbSortAsc ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                onClick={() => onSort("products_sold")}
              >
                Produk Terjual{" "}
                {reportDbSortCol === "products_sold"
                  ? reportDbSortAsc
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                onClick={() => onSort("customers")}
              >
                Customer{" "}
                {reportDbSortCol === "customers"
                  ? reportDbSortAsc
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th className="px-5 py-3.5">Convertion Rate</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
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
              shifts={shifts}
              adminShiftChecklist={adminShiftChecklist}
              setAdminShiftChecklist={setAdminShiftChecklist}
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
