import {
  CalendarDays,
  Download,
  FileText,
  PackageOpen,
  Trash2,
} from "lucide-react";

type ReportingTab = "live" | "product" | "engagement";

type ReportingWorkspaceHeaderProps = {
  brandName: string;
  brandId?: string;
  activeTab: ReportingTab;
  onDeleteRange: () => void;
  onDeleteAll: () => void;
  onImportSku: () => void;
  onImportRaw: () => void;
};

export function ReportingWorkspaceHeader({
  brandName,
  brandId,
  activeTab,
  onDeleteRange,
  onDeleteAll,
  onImportSku,
  onImportRaw,
}: ReportingWorkspaceHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#e8e1fb] bg-white px-6 py-4 text-left sm:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDeleteRange}
          className="inline-flex items-center gap-2 rounded-full border border-[#ece7f7] bg-[#fbf9ff] px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#d6c9ff] hover:bg-[#f7f2ff]"
          title="Hapus Rentang Waktu"
        >
          <CalendarDays className="h-3.5 w-3.5 text-orange-600" />
          Hapus Rentang Waktu
        </button>

        <button
          type="button"
          onClick={onDeleteAll}
          className="inline-flex items-center gap-2 rounded-full border border-[#ece7f7] bg-[#fbf9ff] px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#f7c9d0] hover:bg-rose-50 hover:text-rose-700"
          title="Hapus Semua Data"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus Semua Data
        </button>

        {activeTab === "product" && (
          <button
            type="button"
            onClick={onImportSku}
            className="inline-flex items-center gap-2 rounded-full border border-[#ece7f7] bg-[#fbf9ff] px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#d6c9ff] hover:bg-[#f7f2ff]"
            title="Import Data SKU"
          >
            <PackageOpen className="h-3.5 w-3.5 text-indigo-600" />
            Import Data SKU
          </button>
        )}

        {(activeTab === "live" || activeTab === "engagement") && (
          <button
            type="button"
            onClick={onImportRaw}
            className="inline-flex items-center gap-2 rounded-full border border-[#5600e0] bg-[#5600e0] px-3 py-2 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(86,0,224,0.16)] transition-colors hover:bg-[#4600bb]"
            title="Import Raw Data"
          >
            <Download className="h-3.5 w-3.5" />
            Import Raw Data
          </button>
        )}

        <span className="inline-flex items-center rounded-full border border-[#ece7f7] bg-white px-3 py-2 text-[11px] font-bold text-slate-500">
          {brandName || "Nama Brand"}
          {brandId ? <span className="ml-2 text-slate-300">#{brandId}</span> : null}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#ece7f7] bg-white px-3 py-2 text-[11px] font-bold text-slate-600">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          Kelola data
        </span>
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
        ? "border-[#5600e0] text-[#5600e0]"
        : "border-transparent text-slate-500 hover:text-slate-900"
    }`;

  return (
    <div className="mb-6 flex gap-6 border-b border-[#e8e1fb] px-6 sm:px-8">
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
