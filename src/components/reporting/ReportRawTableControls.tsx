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
      <div className="flex bg-slate-100 p-1 mb-4 rounded-xl w-fit">
        {RAW_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportingShopeeRawTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${reportingShopeeRawTab === tab.id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {reportingShopeeRawTab === "shift" && (
        <div className="mb-4 flex flex-wrap gap-2 items-center p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <span className="text-xs font-bold text-indigo-600 mr-2">
            Filter & Grouping Shift:
          </span>
          {shifts.map((sh) => (
            <label
              key={sh}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <input
                type="checkbox"
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
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
