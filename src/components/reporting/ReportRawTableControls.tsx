interface ReportRawTableControlsProps {
  reportingShopeeRawTab: "day" | "shift" | "dayOfWeek" | "raw";
  setReportingShopeeRawTab: (
    value: "day" | "shift" | "dayOfWeek" | "raw",
  ) => void;
  shifts: string[];
  adminShiftChecklist: string[];
  setAdminShiftChecklist: (value: string[]) => void;
  title?: string;
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
      </div>

      {reportingShopeeRawTab === "shift" && (
        <div className="border-t border-[#edf0fb] px-4 pb-4 pt-3">
          <div className="flex flex-wrap items-center gap-2 rounded-[18px] border border-[#e4ddf6] bg-[#faf8ff] p-3">
            <span className="mr-2 text-xs font-bold text-[#5600e0]">
              Filter & Grouping Shift:
            </span>
            {shifts.map((sh) => (
              <label
                key={sh}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition-colors hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-[#5600e0] focus:ring-[#5600e0]"
                  checked={adminShiftChecklist.includes(sh)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdminShiftChecklist([...adminShiftChecklist, sh]);
                    } else {
                      setAdminShiftChecklist(
                        adminShiftChecklist.filter((x) => x !== sh),
                      );
                    }
                  }}
                />
                <span className="text-xs font-semibold text-slate-700">{sh}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
