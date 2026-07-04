interface UploadHistoryItemLike {
  id: string;
  uploadedAt?: string;
  fileName?: string;
  platform?: string;
  rowCount?: number;
  gmv?: number;
}

interface UploadHistoryCardProps {
  title: string;
  description: string;
  histories: UploadHistoryItemLike[];
  isLoading: boolean;
  emptyMessage: string;
  onDeleteBatch: (id: string, fileName: string, rowCount: number) => void;
}

export function UploadHistoryCard({
  title,
  description,
  histories,
  isLoading,
  emptyMessage,
  onDeleteBatch,
}: UploadHistoryCardProps) {
  return (
    <div className="mt-8 overflow-hidden rounded-[22px] border border-[#e6dff8] bg-white shadow-[0_1px_0_rgba(17,24,39,0.03)]">
      <div className="flex items-center justify-between border-b border-[#f0ebfb] px-6 py-5">
        <div>
          <h4 className="text-base font-black text-slate-950">{title}</h4>
          <p className="text-[11px] font-medium text-slate-500">{description}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="border-b border-[#f0ebfb] bg-[#faf8ff] uppercase text-[9px] font-bold tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Waktu Upload</th>
              <th className="px-5 py-3.5">Nama File / Tipe</th>
              <th className="px-5 py-3.5">Platform</th>
              <th className="px-5 py-3.5">Total Baris</th>
              <th className="px-5 py-3.5">Total GMV (Rp)</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white text-xs font-semibold text-slate-700">
            {isLoading ? (
              <tr key="loading">
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center text-slate-500 font-bold w-full"
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
                    Sedang memuat data dari database...
                  </div>
                </td>
              </tr>
            ) : histories.length === 0 ? (
              <tr key="empty-history">
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              histories.map((history, idx) => (
                <tr
                  key={history.id || idx}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(history.uploadedAt || 0).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td
                    className="px-5 py-3.5 max-w-[200px] truncate"
                    title={history.fileName}
                  >
                    {history.fileName}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                      {history.platform || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {new Intl.NumberFormat("id-ID").format(history.rowCount || 0)}
                  </td>
                  <td className="px-5 py-3.5">
                    Rp
                    {new Intl.NumberFormat("id-ID", {
                      maximumFractionDigits: 0,
                    }).format(history.gmv || 0)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() =>
                        onDeleteBatch(
                          history.id,
                          history.fileName || "Unknown",
                          history.rowCount || 0,
                        )
                      }
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-[10px] font-bold text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus:outline-none"
                      title="Hapus Batch & Semua Data Raw"
                    >
                      Hapus Batch
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
