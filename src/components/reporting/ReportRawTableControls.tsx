import { Download } from "lucide-react";

interface ReportRawTableControlsProps {
  reportingShopeeRawTab: "day" | "shift" | "dayOfWeek" | "raw";
  setReportingShopeeRawTab: (
    value: "day" | "shift" | "dayOfWeek" | "raw",
  ) => void;
  shifts: string[];
  adminShiftChecklist: string[];
  setAdminShiftChecklist: (value: string[]) => void;
  title?: string;
  isClientView?: boolean;
  onExportTable?: () => void;
}

const RAW_TABS = [
  { id: "day", label: "Harian" },
  { id: "shift", label: "Shift" },
  { id: "dayOfWeek", label: "Hari" },
  { id: "raw", label: "By Raw" },
] as const;

export function ReportRawTableControls({
  reportingShopeeRawTab,
  setReportingShopeeRawTab,
  shifts,
  adminShiftChecklist,
  setAdminShiftChecklist,
  title = "Performa Live Harian",
  isClientView = false,
  onExportTable,
}: ReportRawTableControlsProps) {
  return (
    <div className="mb-4 rounded-[20px] border border-[#e4ddf6] bg-white shadow-[0_1px_0_rgba(17,24,39,0.03)]">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
            {title}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Pilih mode tampilan data yang ingin dibaca.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap w-fit rounded-[16px] border border-[#e4ddf6] bg-[#faf8ff] p-1 shadow-sm">
            {RAW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReportingShopeeRawTab(tab.id)}
                className={`rounded-[12px] px-4 py-2 text-xs font-bold transition-colors ${reportingShopeeRawTab === tab.id ? "bg-white text-[#5600e0] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {onExportTable && (
            <button
              type="button"
              onClick={onExportTable}
              className="flex items-center gap-1.5 rounded-[16px] border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-700 px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title={
                reportingShopeeRawTab === "raw"
                  ? "Export data per sesi live saat di-start ke Excel (.xlsx)"
                  : "Export data tabel ini ke Excel (.xlsx)"
              }
            >
              <Download className="w-3.5 h-3.5" />
              <span>{reportingShopeeRawTab === "raw" ? "Export Sesi Live" : "Export Tabel"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
