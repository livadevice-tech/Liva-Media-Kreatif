import React, { useState } from "react";
import { CheckCircle2, ChevronDown, Check, CreditCard, Copy, Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type MobilePayrollListProps = {
  data: any[];
  formatIDR: (val: number) => string;
  getAvatarUrl: (name: string) => string;
};

export const MobilePayrollList: React.FC<MobilePayrollListProps> = ({
  data,
  formatIDR,
  getAvatarUrl,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 font-mono font-medium">
        Tidak ada rekam data host yang cocok untuk proses kalkulasi draf gaji.
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3 mt-4">
      {data.map((item, idx) => {
        const isExpanded = expandedId === item.id;
        const hostType = item.hostType || "Reguler";

        return (
          <div
            key={item.id || idx}
            className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100"
          >
            {/* Header / Basic Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarUrl(item.name)}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-100 border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                    {item.isEligibleForBonus && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {item.studio || "Studio Bandar Lampung"} • {item.totalHadir}x Hadir
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-900 text-[15px] font-mono">
                  {formatIDR(item.netSalary)}
                </span>
              </div>
            </div>

            {/* Bill Detail Button */}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                {hostType} Host
              </span>
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold transition-colors ${
                  isExpanded
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Detail Gaji
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isExpanded ? "rotate-180 text-indigo-600" : "text-slate-400"
                  }`}
                />
              </button>
            </div>

            {/* Expanded Accordion */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest leading-none">
                      Rincian Perhitungan
                    </div>
                    
                    {hostType === "Reguler" ? (
                      <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Gaji Pokok / Hari</span>
                          <span className="font-mono font-medium text-slate-700">
                            {formatIDR(item.basePayRate)} / {item.requiredWorkingDays} Hari
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Total Kehadiran</span>
                          <span className="font-mono font-medium text-slate-700">
                            {item.totalHadir} Hari
                          </span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs font-bold text-slate-800">
                          <span>Total Pokok</span>
                          <span className="font-mono">
                            {formatIDR(
                              Math.round(
                                (item.basePayRate / item.requiredWorkingDays) * item.totalHadir
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Tarif per Shift</span>
                          <span className="font-mono font-medium text-slate-700">
                            {formatIDR(item.basePayRate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Total Sesi Masuk</span>
                          <span className="font-mono font-medium text-slate-700">
                            {item.totalHadir} Sesi
                          </span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs font-bold text-slate-800">
                          <span>Total Pokok</span>
                          <span className="font-mono">
                            {formatIDR(item.basePayRate * item.totalHadir)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Bonus & Potongan Summary */}
                    {(item.bonusTotal > 0 || item.deductionTotal > 0) && (
                      <div className="flex gap-2">
                        {item.bonusTotal > 0 && (
                          <div className="flex-1 bg-emerald-50 rounded-lg p-2 flex flex-col justify-center items-center">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase">Total Bonus</span>
                            <span className="text-xs font-mono font-bold text-emerald-700">+{formatIDR(item.bonusTotal)}</span>
                          </div>
                        )}
                        {item.deductionTotal > 0 && (
                          <div className="flex-1 bg-rose-50 rounded-lg p-2 flex flex-col justify-center items-center">
                            <span className="text-[9px] font-bold text-rose-600 uppercase">Potongan</span>
                            <span className="text-xs font-mono font-bold text-rose-700">-{formatIDR(item.deductionTotal)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bank Account Copy */}
                    <div className="pt-2">
                      {item.bankName && item.bankAccount && item.bankAccount !== "-" ? (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(String(item.bankAccount));
                            setCopiedBankId(item.id);
                            setTimeout(() => setCopiedBankId(null), 1500);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                            copiedBankId === item.id
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-white border-slate-200 text-slate-600"
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] font-bold">{item.bankName}</span>
                            <span className="text-xs font-mono font-medium">{item.bankAccount}</span>
                          </div>
                          {copiedBankId === item.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      ) : (
                        <div className="text-[10px] text-center text-slate-400 font-bold uppercase p-2 border border-slate-100 rounded-lg bg-slate-50">
                          Belum ada Rekening
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
