import { CheckCircle2, Loader2, Save, Upload } from "lucide-react";

import type { SkuLogEntry } from "../../shared/types/reporting";

type BrandOption = {
  id: string;
  name: string;
};

type SkuUploadModalProps = {
  isOpen: boolean;
  isSavingReport: boolean;
  isDragOverReporting: boolean;
  saveTargetBrandId: string;
  saveTargetPlatform: string;
  skuRawData: readonly SkuLogEntry[];
  clientBrands: readonly BrandOption[];
  onClose: () => void;
  onResetFile: () => void;
  onSave: () => void;
  onBrandChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onFileSelect: (file: File) => void;
};

export function SkuUploadModal({
  isOpen,
  isSavingReport,
  isDragOverReporting,
  saveTargetBrandId,
  saveTargetPlatform,
  skuRawData,
  clientBrands,
  onClose,
  onResetFile,
  onSave,
  onBrandChange,
  onPlatformChange,
  onDragOver,
  onDragLeave,
  onFileSelect,
}: SkuUploadModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 sm:p-6 sm:pt-[6vh] sm:pb-12 animate-fadeIn"
      id="upload_sku_modal"
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={() => {
          if (isSavingReport) return;
          onClose();
        }}
      />
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 text-left relative animate-scaleUp my-auto sm:my-4 z-10">
        <button
          onClick={() => {
            if (isSavingReport) return;
            onClose();
          }}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors z-20"
          disabled={isSavingReport}
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Upload className="w-6 h-6 text-indigo-500" /> Upload SKU Data
            (Shopee / TikTok)
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            Extract and analyze top performing SKUs directly from Shopee /
            TikTok item export.
          </p>
        </div>

        {!skuRawData || skuRawData.length === 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  1. Tentukan Brand Klien
                </label>
                <select
                  value={saveTargetBrandId}
                  onChange={(e) => onBrandChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-bold focus:border-indigo-500 outline-none text-xs text-slate-700"
                >
                  <option value="" disabled>
                    Pilih Brand...
                  </option>
                  {clientBrands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  2. Tentukan Platform
                </label>
                <select
                  value={saveTargetPlatform}
                  onChange={(e) => onPlatformChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-bold focus:border-indigo-500 outline-none text-xs text-slate-700"
                >
                  <option value="TikTok Live">TikTok Live</option>
                  <option value="Shopee Live">Shopee Live</option>
                  <option value="Tokopedia">Tokopedia</option>
                  <option value="Lazada">Lazada</option>
                </select>
              </div>
            </div>
            <div
              className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragOverReporting ? "border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50"}`}
              onDragOver={(e) => {
                e.preventDefault();
                onDragOver();
              }}
              onDragLeave={onDragLeave}
              onDrop={(e) => {
                e.preventDefault();
                onDragLeave();
                const file = e.dataTransfer.files?.[0];
                if (file) onFileSelect(file);
              }}
            >
              <input
                type="file"
                id="sku_reporting_upload"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileSelect(file);
                }}
              />
              <label
                htmlFor="sku_reporting_upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-4"
              >
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-indigo-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg mb-1">
                    Klik atau Drag & Drop file (Shopee/TikTok Item Export)
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mb-2">
                    Hanya menerima .xlsx, .xls, .csv
                  </p>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-900">
                    Data SKU Berhasil Diproses
                  </h3>
                  <p className="text-[10px] sm:text-xs font-semibold text-emerald-700">
                    {skuRawData.length} Records Terdeteksi
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onResetFile}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white text-rose-600 border border-rose-200 text-xs font-black rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  disabled={isSavingReport}
                >
                  Reset File
                </button>
                <button
                  onClick={onSave}
                  disabled={isSavingReport}
                  className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 text-white text-xs rounded-lg font-black shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingReport ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan Data
                </button>
              </div>
            </div>

            <div className="bg-white border text-xs border-slate-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-500">
                      Date
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-500">
                      SKU
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-500">
                      Sold
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-500">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skuRawData.slice(0, 50).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{r.date}</td>
                      <td className="px-4 py-3 text-slate-700 truncate max-w-[200px]">
                        {r.productName}
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">
                        {r.sold}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-bold">
                        Rp {new Intl.NumberFormat("id-ID").format(r.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
