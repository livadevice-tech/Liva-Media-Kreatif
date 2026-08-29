import React from "react";
import { type ReportLogLike } from "../../shared/utils/reportTable";
import {
  formatLiveSessionAverageDuration,
  formatLiveSessionDuration,
  getLiveSessionMetrics,
} from "../../shared/utils/liveSessionsTable";

interface MobileLiveDailyTableProps {
  logs: ReportLogLike[];
}

interface DailyGroupRow {
  label: string;
  duration: number;
  viewer: number;
  gmv: number;
  itemsSold: number;
  avgViewDuration: number;
  customers: number;
  sessionCount: number;
}

const parseGroupDateLabel = (lbl: string) => {
  const parts = lbl.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    return new Date(lbl).getTime();
  }
  return lbl;
};

export function MobileLiveDailyTable({ logs }: MobileLiveDailyTableProps) {
  const groups: Record<string, DailyGroupRow> = {};

  logs.forEach((log) => {
    let key = "";
    const dStr = String(log.dateTime || log.date || "");
    const dPart = dStr.includes("T") ? dStr.split("T")[0] : dStr.split(" ")[0];

    const dSplit = dPart.split("-");
    if (dSplit.length === 3) {
      if (dSplit[0].length === 4) {
        key = `${dSplit[2]}-${dSplit[1]}-${dSplit[0]}`;
      } else {
        key = `${dSplit[0]}-${dSplit[1]}-${dSplit[2]}`;
      }
    } else {
      key = dPart;
    }

    if (!groups[key]) {
      groups[key] = {
        label: key,
        duration: 0,
        viewer: 0,
        gmv: 0,
        itemsSold: 0,
        avgViewDuration: 0,
        customers: 0,
        sessionCount: 0,
      };
    }

    const metrics = getLiveSessionMetrics(log);
    groups[key].duration += log.duration || 0;
    groups[key].viewer += metrics.viewer;
    groups[key].gmv += metrics.gmv;
    groups[key].itemsSold += metrics.itemsSold;
    groups[key].avgViewDuration += metrics.avgViewDuration;
    groups[key].customers += metrics.customers;
    groups[key].sessionCount += 1;
  });

  const sortedGroups = Object.values(groups).sort((a, b) => {
    const valA = parseGroupDateLabel(a.label);
    const valB = parseGroupDateLabel(b.label);
    if (typeof valA === "number" && typeof valB === "number" && !Number.isNaN(valA) && !Number.isNaN(valB)) {
      return valB - valA; // Descending
    }
    return a.label > b.label ? -1 : 1;
  });

  const idFormatter = new Intl.NumberFormat("id-ID");

  return (
    <div className="md:hidden bg-white rounded-[16px] border border-[#e6dff8] shadow-sm font-sans mb-4 w-full overflow-hidden animate-fadeIn">
      <div className="w-full">
        <table className="w-full text-center whitespace-nowrap table-fixed">
          <thead className="bg-[#f8f9fc] border-b border-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 w-[6%]">No</th>
              <th className="py-2.5 w-[16%]">Tanggal</th>
              <th className="py-2.5 w-[14%]">Durasi</th>
              <th className="py-2.5 w-[13%]">Viewer</th>
              <th className="py-2.5 w-[21%]">GMV</th>
              <th className="py-2.5 w-[10%]">Sold</th>
              <th className="py-2.5 w-[10%]">Avg</th>
              <th className="py-2.5 w-[10%]">Cust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedGroups.map((g, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-2.5 text-[8px] font-medium text-slate-500">{idx + 1}</td>
                <td className="py-2.5 text-[8px] font-bold text-slate-800">{g.label}</td>
                <td className="py-2.5 text-[8px] font-medium text-slate-500">
                  {formatLiveSessionDuration(g.duration)}
                </td>
                <td className="py-2.5 text-[8px] font-bold text-slate-700">
                  {idFormatter.format(g.viewer)}
                </td>
                <td className="py-2.5 text-[8px] font-black text-emerald-600">
                  Rp{idFormatter.format(g.gmv)}
                </td>
                <td className="py-2.5 text-[8px] font-bold text-slate-700">
                  {idFormatter.format(g.itemsSold)}
                </td>
                <td className="py-2.5 text-[8px] font-semibold text-slate-500">
                  {formatLiveSessionAverageDuration(
                    g.sessionCount > 0 ? g.avgViewDuration / g.sessionCount : 0
                  )}
                </td>
                <td className="py-2.5 text-[8px] font-bold text-[#5600e0]">
                  {idFormatter.format(g.customers)}
                </td>
              </tr>
            ))}
            {sortedGroups.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-xs text-center text-slate-500">
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
