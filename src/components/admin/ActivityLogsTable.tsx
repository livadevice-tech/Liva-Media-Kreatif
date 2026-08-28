import React, { useEffect, useState } from "react";
import { activityLogsApi } from "../../api";
import type { HostActivityLog } from "../../types";
import { Activity, Clock } from "lucide-react";

export const ActivityLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<HostActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await activityLogsApi.getAll();
      setLogs(data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data log");
    } finally {
      setIsLoading(false);
    }
  };

  const parseDetails = (detailsStr?: string) => {
    if (!detailsStr) return "-";
    try {
      const parsed = JSON.parse(detailsStr);
      if (typeof parsed === "object") {
        return Object.entries(parsed)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
      }
      return parsed.toString();
    } catch {
      return detailsStr;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            Riwayat Aktivitas
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Menampilkan maksimal 1000 log aktivitas terbaru dari seluruh host.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm font-medium text-slate-500">
          Memuat data log aktivitas...
        </div>
      ) : error ? (
        <div className="py-6 text-center text-sm font-medium text-red-500 bg-red-50 rounded-xl">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="py-10 text-center text-sm font-medium text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
          Belum ada data log aktivitas
        </div>
      ) : (
        <div className="bg-transparent sm:bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-xl overflow-visible sm:overflow-hidden shadow-none sm:shadow-sm">
          <div className="overflow-x-visible sm:overflow-x-auto pb-4 sm:pb-0">
            <table className="w-full text-left text-xs whitespace-normal sm:whitespace-nowrap block sm:table">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 hidden sm:table-header-group">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Nama Host</th>
                  <th className="px-4 py-3">Aksi</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y-0 sm:divide-y divide-slate-100 block sm:table-row-group space-y-3 sm:space-y-0">
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    {/* DESKTOP ROW */}
                    <tr className="hidden sm:table-row hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(log.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {log.host_name || <span className="text-slate-400 italic">Unknown</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px] truncate max-w-[300px]">
                        {parseDetails(log.details)}
                      </td>
                    </tr>

                    {/* MOBILE CARD */}
                    <tr className="sm:hidden block bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative">
                      <td className="block w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-slate-800 text-[14px]">
                            {log.host_name || <span className="text-slate-400 italic">Unknown</span>}
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
                            {log.action}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px] mb-3">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {formatDate(log.created_at)}
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-600 text-[12px] break-words font-mono">
                          {parseDetails(log.details)}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
