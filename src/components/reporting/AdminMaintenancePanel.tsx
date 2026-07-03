import type { ChangeEvent } from "react";

import { Database, Download, FileSpreadsheet, RefreshCw, Trash2, Upload } from "lucide-react";

interface AdminMaintenancePanelProps {
  canTestDb: boolean;
  testDbConnection: () => Promise<{ message: string }>;
  onExportJSON: () => void;
  onImportJSON: (e: ChangeEvent<HTMLInputElement>) => void;
  onRecoverLocalStorage: () => void;
  onClearAllData: () => void;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export function AdminMaintenancePanel({
  canTestDb,
  testDbConnection,
  onExportJSON,
  onImportJSON,
  onRecoverLocalStorage,
  onClearAllData,
}: AdminMaintenancePanelProps) {
  return (
    <div className="space-y-6">
      {canTestDb && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" /> Test Koneksi MySQL
          </h4>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Uji coba apakah server aplikasi saat ini berhasil terhubung dengan database MySQL.
          </p>
          <button
            type="button"
            onClick={async () => {
              try {
                const result = await testDbConnection();
                alert("✅ " + result.message);
              } catch (err: unknown) {
                alert("❌ " + getErrorMessage(err));
              }
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer border-0"
          >
            Jalankan Test Koneksi
          </button>
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-slate-500" /> Otentikasi Dua Langkah (2FA)
        </h4>
        <p className="text-xs text-slate-500 font-medium mb-4">
          Lindungi akun Master Admin dengan verifikasi tambahan dari aplikasi auth.
        </p>

        <div className="flex items-center justify-between bg-white border border-emerald-100 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-700 uppercase">
                Aktif
              </div>
              <div className="text-[10px] text-slate-500">Sejak 2 Hari Lalu</div>
            </div>
          </div>
          <button className="text-[10px] font-bold px-3 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
            Nonaktifkan
          </button>
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
        <h4 className="text-sm font-black text-purple-900 mb-2 flex items-center gap-2">
          <Download className="w-4 h-4 text-purple-600" /> Migrasi & Alat
          Backup Instan
        </h4>
        <p className="text-[11px] text-purple-700 font-semibold mb-4 leading-relaxed">
          Gunakan fitur ini untuk memindahkan seluruh data (Host, Absensi,
          Brand, Leads, Kalender) dari Google AI Studio atau VPS lain secara
          instan dengan berkas pertukaran `.json`.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onExportJSON}
            className="w-full text-xs font-bold bg-white border border-purple-200 hover:bg-purple-100 text-purple-700 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer border-0"
          >
            <Download className="w-4 h-4" /> Ekspor Basis Data (.json)
          </button>

          <div className="bg-white border border-dashed border-purple-200 rounded-lg p-3 text-center transition-all relative">
            <label className="block text-purple-700 hover:text-purple-950 font-bold text-xs cursor-pointer">
              <Upload className="w-4 h-4 mx-auto mb-1.5 text-purple-500" />
              Impor Dari Berkas Backup (.json)
              <input
                type="file"
                accept=".json"
                onChange={onImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-xl p-5 border border-red-100">
        <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-600" /> Manajemen Basis Data
        </h4>
        <p className="text-xs text-red-600/80 font-medium mb-4">
          Aksi berbahaya. Pengelolaan ulang dan pemulihan data sistem secara
          paksa dari atau ke cloud.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRecoverLocalStorage}
            className="w-full text-xs font-black bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Pulihkan Data Lokal ke Cloud
          </button>

          <button
            onClick={onClearAllData}
            className="w-full text-xs font-black bg-white border border-red-200 hover:bg-red-600 hover:text-white text-red-700 px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Kosongkan Seluruh Data Cloud
          </button>
        </div>
      </div>
    </div>
  );
}
