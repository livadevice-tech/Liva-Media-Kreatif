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
    <div className="mb-6 flex flex-col overflow-hidden rounded-[22px] border border-[#e6dff8] bg-white shadow-[0_1px_0_rgba(17,24,39,0.03)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#f0ebfb] bg-[#faf8ff] px-5 py-5 lg:px-7">
        <div>
          <h4 className="flex items-center gap-2 text-base font-black uppercase tracking-widest text-slate-950">
            <Database className="h-5 w-5 text-[#5600e0]" /> History Upload SKU
          </h4>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            {uploadHistoryList.length} riwayat batch ditemukan
          </p>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-[700px] w-full whitespace-nowrap text-left">
          <thead className="border-b border-[#f0ebfb] bg-[#faf8ff] text-xs font-black uppercase leading-none tracking-widest text-slate-500">
            <tr>
              <th className="px-5 py-4 w-12 text-center">No</th>
              <th className="px-5 py-4 w-40">Tanggal Upload</th>
              <th className="px-5 py-4 min-w-[150px]">Batch ID</th>
              <th className="px-5 py-4 w-32">Platform</th>
              <th className="px-5 py-4 w-32 text-right">Jumlah Record</th>
              <th className="px-5 py-4 w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-[11px] font-semibold text-slate-700">
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
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
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
        <div className="flex items-center justify-between border-t border-[#f0ebfb] p-4 text-xs font-semibold text-slate-500">
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
