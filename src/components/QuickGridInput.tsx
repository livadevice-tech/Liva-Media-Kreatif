import React, { useState, useEffect } from 'react';
import { HostEmployee, AttendanceLog } from '../types';
import { Check, AlertCircle } from 'lucide-react';

interface QuickGridInputProps {
  hosts: HostEmployee[];
  dates: string[];
  manualFormConfig: {
    brand: string;
    platform: string;
    shift: string;
    studio: string;
    overtimeHours: number;
    isBackupShift: boolean;
  };
  onSave: (logs: AttendanceLog[]) => void;
  onCancel: () => void;
}

export const QuickGridInput: React.FC<QuickGridInputProps> = ({
  hosts,
  dates,
  manualFormConfig,
  onSave,
  onCancel
}) => {
  // state grid: { hostId_dateStr: "Present" | "Late" | "Absent" | "Excused" }
  const [gridState, setGridState] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize default all to Present
    const initial: Record<string, string> = {};
    hosts.forEach(h => {
      dates.forEach(d => {
        initial[`${h.id}_${d}`] = "Present";
      });
    });
    setGridState(initial);
  }, [hosts, dates]);

  const toggleCellStatus = (hostId: string, dateStr: string) => {
    setGridState(prev => {
      const current = prev[`${hostId}_${dateStr}`] || "Present";
      let next = "Present";
      if (current === "Present") next = "Late";
      else if (current === "Late") next = "Excused";
      else if (current === "Excused") next = "Absent";
      else if (current === "Absent") next = "Present";
      return { ...prev, [`${hostId}_${dateStr}`]: next };
    });
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case "Present": return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold w-full text-center cursor-pointer select-none border border-emerald-200">✅ Hadir</span>;
      case "Late": return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold w-full text-center cursor-pointer select-none border border-amber-200">⏰ Terlambat</span>;
      case "Excused": return <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold w-full text-center cursor-pointer select-none border border-indigo-200">📋 Izin</span>;
      case "Absent": return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold w-full text-center cursor-pointer select-none border border-red-200">❌ Alpa</span>;
      default: return null;
    }
  };

  const setAllColumn = (dateStr: string, status: string) => {
    setGridState(prev => {
      const next = { ...prev };
      hosts.forEach(h => {
        next[`${h.id}_${dateStr}`] = status;
      });
      return next;
    });
  };

  const setAllRow = (hostId: string, status: string) => {
    setGridState(prev => {
      const next = { ...prev };
      dates.forEach(d => {
        next[`${hostId}_${d}`] = status;
      });
      return next;
    });
  };

  const handleSave = () => {
    const newLogs: AttendanceLog[] = [];
    dates.forEach((dateStr, dIdx) => {
      hosts.forEach((host, hIdx) => {
        const status = gridState[`${host.id}_${dateStr}`] as "Present"|"Late"|"Absent"|"Excused" || "Present";
        
        const randomOrders = status === "Absent" ? 0 : Math.floor(Math.random() * 200) + 100;
        const randomRevenue = status === "Absent" ? 0 : randomOrders * 60000;
        
        newLogs.push({
          id: `log_grid_${Date.now()}_${dIdx}_${hIdx}`,
          hostId: host.id,
          hostName: host.name,
          employeeId: host.employeeId,
          date: dateStr,
          shiftHours: manualFormConfig.shift,
          platform: manualFormConfig.platform,
          brandHandled: manualFormConfig.brand,
          studio: manualFormConfig.studio,
          liveDuration: status === "Absent" ? 0 : 4,
          sessionCount: status === "Absent" ? 0 : 1,
          status: status,
          revenueGenerated: randomRevenue,
          conversionRate: status === "Absent" ? 0 : 3.8,
          engagementRate: status === "Absent" ? 0 : 7.2,
          orders: randomOrders,
          overtimeHours: manualFormConfig.overtimeHours,
          isBackupShift: manualFormConfig.isBackupShift,
        });
      });
    });
    onSave(newLogs);
  };

  if (hosts.length === 0 || dates.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-8 h-8 text-amber-500" />
        <p className="text-sm font-black text-amber-700">Pilih Minimal 1 Host dan 1 Tanggal</p>
        <p className="text-[10px] text-amber-600 text-center font-semibold">Silakan atur host dan tanggal pada formulir di sebelah kiri untuk mengaktifkan Grid Rekap Cepat.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-purple-150 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-purple-50 p-4 border-b border-purple-150 flex justify-between items-center shrink-0">
        <div>
          <h4 className="text-sm font-black text-purple-700 flex items-center gap-2">
            <span>⚡</span> Grid Rekap Cepat
          </h4>
          <p className="text-[10px] text-purple-600 font-bold mt-1">Klik sel untuk mengubah status absensi dengan cepat.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto p-4 custom-scrollbar flex-1">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b-2 border-slate-200 bg-slate-50 p-3 text-left text-xs font-bold text-slate-600 min-w-[150px] sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                Host \\ Tanggal
              </th>
              {dates.map(d => (
                <th key={d} className="border-b-2 border-l border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-600 min-w-[110px]">
                  <div className="flex flex-col gap-1.5 items-center">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">{d}</span>
                    <button onClick={() => setAllColumn(d, "Present")} className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200 cursor-pointer font-bold w-full hover:bg-emerald-200 transition-colors">Set Semua Hadir</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hosts.map(h => (
              <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                <td className="border-b border-slate-200 p-2 text-xs font-bold text-slate-700 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                  <div className="flex justify-between items-center gap-2">
                    <span className="truncate max-w-[100px]">{h.name}</span>
                    <button onClick={() => setAllRow(h.id, "Present")} className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 cursor-pointer font-bold hover:bg-emerald-200 shrink-0">✔ Hadir</button>
                  </div>
                </td>
                {dates.map(d => (
                  <td key={d} className="border-b border-l border-slate-200 p-1 text-center" onClick={() => toggleCellStatus(h.id, d)}>
                    <div className="flex items-center justify-center h-full w-full p-1">
                      {getStatusDisplay(gridState[`${h.id}_${d}`] || "Present")}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-purple-150 bg-slate-50 flex justify-end gap-3 shrink-0">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer border-0 shadow-sm">
          Batal
        </button>
        <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-purple-600 text-white hover:bg-purple-700 font-black rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer border-0 shadow-sm">
          <Check className="w-4 h-4" />
          Simpan ({hosts.length * dates.length} Data)
        </button>
      </div>
    </div>
  );
};
