import { ArrowLeft, Calendar, Download, Trash2 } from "lucide-react";

type ReportingTab = "live" | "product" | "engagement";

type ReportingWorkspaceHeaderProps = {
  brandName: string;
  activeTab: ReportingTab;
  onBack: () => void;
  onDeleteRange: () => void;
  onDeleteAll: () => void;
  onImportSku: () => void;
  onImportRaw: () => void;
};

export function ReportingWorkspaceHeader({
  brandName,
  activeTab,
  onBack,
  onDeleteRange,
  onDeleteAll,
  onImportSku,
  onImportRaw,
}: ReportingWorkspaceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white mb-6 text-left border-b border-slate-200 px-6 sm:px-8 py-5">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {brandName || "Nama Brand"}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onDeleteRange}
          className="px-4 py-2 bg-white text-orange-600 hover:text-orange-700 font-bold text-[11px] rounded-lg shadow-sm border border-slate-200 hover:bg-orange-50 flex items-center gap-2 cursor-pointer transition-all"
          title="Hapus Rentang Waktu"
        >
          <Calendar className="w-3.5 h-3.5" />
          Hapus Rentang Waktu
        </button>

        <button
          onClick={onDeleteAll}
          className="px-4 py-2 bg-white text-red-600 hover:text-red-700 font-bold text-[11px] rounded-lg shadow-sm border border-slate-200 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-all"
          title="Hapus Semua Data"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus Semua Data
        </button>

        {activeTab === "product" && (
          <button
            onClick={onImportSku}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-[11px] rounded-lg shadow-sm border border-indigo-200 hover:bg-indigo-100 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Import Data SKU
          </button>
        )}

        {(activeTab === "live" || activeTab === "engagement") && (
          <button
            onClick={onImportRaw}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-[11px] rounded-lg shadow-sm border border-slate-800 hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Import Raw Data
          </button>
        )}
      </div>
    </div>
  );
}

type ReportingWorkspaceTabsProps = {
  activeTab: ReportingTab;
  onTabChange: (tab: ReportingTab) => void;
};

export function ReportingWorkspaceTabs({
  activeTab,
  onTabChange,
}: ReportingWorkspaceTabsProps) {
  const tabClass = (tab: ReportingTab) =>
    `pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer bg-transparent relative ${
      activeTab === tab
        ? "text-indigo-600 border-indigo-600"
        : "text-slate-500 border-transparent hover:text-slate-800"
    }`;

  return (
    <div className="px-6 sm:px-8 mb-6 border-b border-slate-200 flex gap-6">
      <button onClick={() => onTabChange("live")} className={tabClass("live")}>
        Live Performance
      </button>
      <button
        onClick={() => onTabChange("product")}
        className={tabClass("product")}
      >
        Product Performance
      </button>
      <button
        onClick={() => onTabChange("engagement")}
        className={tabClass("engagement")}
      >
        Engagement & Promotion
      </button>
    </div>
  );
}
