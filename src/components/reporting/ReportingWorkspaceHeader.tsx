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
    <div className="flex flex-col gap-4 border-b border-[#e5e2e1] bg-white px-6 py-5 text-left sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali ke daftar brand"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            Workspace detail
          </p>
          <h3 className="font-display text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            {brandName || "Nama Brand"}
          </h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDeleteRange}
          className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-bold text-orange-700 shadow-sm transition-colors hover:bg-orange-100"
          title="Hapus Rentang Waktu"
        >
          <Calendar className="w-3.5 h-3.5" />
          Hapus Rentang Waktu
        </button>

        <button
          type="button"
          onClick={onDeleteAll}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-[11px] font-bold text-red-700 shadow-sm transition-colors hover:bg-red-100"
          title="Hapus Semua Data"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus Semua Data
        </button>

        {activeTab === "product" && (
          <button
            type="button"
            onClick={onImportSku}
            className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-[11px] font-bold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-100"
            title="Import Data SKU"
          >
            <Download className="w-3.5 h-3.5" />
            Import Data SKU
          </button>
        )}

        {(activeTab === "live" || activeTab === "engagement") && (
          <button
            type="button"
            onClick={onImportRaw}
            className="flex items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-slate-800"
            title="Import Raw Data"
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
    `relative border-b-2 pb-3 text-sm font-bold transition-colors bg-transparent ${
      activeTab === tab
        ? "text-indigo-600 border-indigo-600"
        : "text-slate-500 border-transparent hover:text-slate-800"
    }`;

  return (
    <div className="mb-6 flex gap-6 border-b border-slate-200 px-6 sm:px-8">
      <button
        type="button"
        onClick={() => onTabChange("live")}
        className={tabClass("live")}
      >
        Live Performance
      </button>
      <button
        type="button"
        onClick={() => onTabChange("product")}
        className={tabClass("product")}
      >
        Product Performance
      </button>
      <button
        type="button"
        onClick={() => onTabChange("engagement")}
        className={tabClass("engagement")}
      >
        Engagement & Promotion
      </button>
    </div>
  );
}
