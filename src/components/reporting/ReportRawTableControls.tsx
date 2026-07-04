interface ReportRawTableControlsProps {
  reportingShopeeRawTab: "day" | "shift" | "dayOfWeek" | "raw";
  setReportingShopeeRawTab: (
    value: "day" | "shift" | "dayOfWeek" | "raw",
  ) => void;
  shifts: string[];
  adminShiftChecklist: string[];
  setAdminShiftChecklist: (value: string[]) => void;
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
}: ReportRawTableControlsProps) {
  return (
    <>
      <div className="mb-4 flex w-fit rounded-[16px] border border-[#e4ddf6] bg-[#faf8ff] p-1 shadow-sm">
        {RAW_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportingShopeeRawTab(tab.id)}
            className={`rounded-[12px] px-4 py-2 text-xs font-bold transition-all ${reportingShopeeRawTab === tab.id ? "bg-white text-[#5600e0] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {reportingShopeeRawTab === "shift" && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[18px] border border-[#e4ddf6] bg-[#faf8ff] p-3">
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
      )}
    </>
  );
}
