import { Database, Trash2 } from "lucide-react";
import type { SkuLogEntry } from "../../shared/types/reporting";
import { buildSkuUploadHistoryRows } from "../../shared/utils/skuUploadHistory";

interface SkuUploadHistoryCardProps {
  brandSkuLogs: SkuLogEntry[];
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (value: number | ((prev: number) => number)) => void;
  onDeleteBatch: (batchId: string) => void;
}

export function SkuUploadHistoryCard({
  brandSkuLogs,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  onDeleteBatch,
}: SkuUploadHistoryCardProps) {
  const uploadHistoryList = buildSkuUploadHistoryRows(brandSkuLogs);

  const totalPages = Math.max(
    1,
    Math.ceil(uploadHistoryList.length / itemsPerPage),
  );
  const paginatedHistory = uploadHistoryList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col mb-6">
      <div className="bg-[#f8fafc] border-b border-slate-100 px-5 lg:px-7 py-5 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-black text-slate-800 uppercase flex items-center gap-2 tracking-widest">
            <Database className="w-5 h-5 text-indigo-500" /> History Upload SKU
          </h4>
          <p className="text-xs text-slate-500 font-semibold mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            {uploadHistoryList.length} riwayat batch ditemukan
          </p>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left whitespace-nowrap min-w-[700px]">
          <thead className="bg-[#f8fafc] text-xs font-black text-slate-500 uppercase tracking-widest leading-none border-b border-slate-100">
            <tr>
              <th className="px-5 py-4 w-12 text-center">No</th>
              <th className="px-5 py-4 w-40">Tanggal Upload</th>
              <th className="px-5 py-4 min-w-[150px]">Batch ID</th>
              <th className="px-5 py-4 w-32">Platform</th>
              <th className="px-5 py-4 w-32 text-right">Jumlah Record</th>
              <th className="px-5 py-4 w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-700 bg-white">
            {paginatedHistory.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-slate-400"
                >
                  Belum ada riwayat upload.
                </td>
              </tr>
            ) : (
              paginatedHistory.map((batch, idx) => (
                <tr
                  key={batch.batchId}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3 text-center text-slate-400 font-bold">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="px-5 py-3">
                    {new Date(batch.uploadedAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="bg-slate-100 text-slate-500 px-2 py-1 rounded inline-block text-[10px] font-mono tracking-tight">
                      {batch.batchId}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#FF5722]/10 text-[#FF5722] font-black text-[10px] uppercase">
                      {batch.platform}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-emerald-600 font-bold">
                    {new Intl.NumberFormat("id-ID").format(batch.records)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => onDeleteBatch(batch.batchId)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus History"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, uploadHistoryList.length)}{" "}
            dari {uploadHistoryList.length} data
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
    </div>
  );
}
