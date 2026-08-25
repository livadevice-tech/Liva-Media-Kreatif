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
  const [copiedSalaryId, setCopiedSalaryId] = useState<string | null>(null);

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
        const totalAbsen = (item.countAlpa || 0) + (item.countIzin || 0);

        return (
          <div
            key={item.id || idx}
            className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col"
          >
            {/* Header / Basic Info */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <img
                  src={getAvatarUrl(item.name)}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-100 border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{item.name}</h3>
                    {item.isEligibleForBonus && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate mb-1">
                    {item.studio || "Studio Bandar Lampung"}
                  </p>
                  <div className="text-[9px] sm:text-[10px] text-slate-600 bg-slate-50 px-1.5 py-1 rounded inline-flex gap-1.5 items-center flex-wrap mt-1">
                    <span className="font-bold text-slate-700">{item.requiredWorkingDays || 0} Hari Kerja</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="font-bold text-emerald-600">{item.totalHadir} Masuk</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="font-bold text-rose-500">{item.countTerlambat || 0} Terlambat</span>
                  </div>

                </div>
              </div>
              
              <div className="text-right shrink-0 max-w-[40%] flex flex-col items-end">
                <button
                   onClick={() => {
                     navigator.clipboard.writeText(String(item.netSalary));
                     setCopiedSalaryId(item.id);
                     setTimeout(() => setCopiedSalaryId(null), 1500);
                   }}
                   className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                     copiedSalaryId === item.id
                       ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                       : "bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200"
                   }`}
                   title="Salin nominal gaji"
                >
                  <span className="font-black text-slate-900 text-[14px] sm:text-[15px] font-mono">
                    {formatIDR(item.netSalary)}
                  </span>
                  {copiedSalaryId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Detail Gaji Button (Bottom) */}
            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
              <div className="flex-1 mr-4">
                {item.bankName && item.bankAccount && item.bankAccount !== "-" ? (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(String(item.bankAccount));
                      setCopiedBankId(item.id);
                      setTimeout(() => setCopiedBankId(null), 1500);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left max-w-full transition-colors ${
                      copiedBankId === item.id
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-3xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <CreditCard className={`w-4 h-4 shrink-0 ${copiedBankId === item.id ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-bold truncate leading-none mb-0.5">{item.bankName}</span>
                      <span className="text-[11px] font-mono font-bold truncate leading-none text-slate-700">{item.bankAccount}</span>
                    </div>
                    {copiedBankId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 opacity-50" />
                    )}
                  </button>
                ) : (
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                    Belum ada Rekening
                  </div>
                )}
              </div>
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
                  <div className="pt-3 mt-3 border-t border-slate-100 space-y-3">
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

                    {/* Bonus Eligibility Section (Reguler Only) */}
                    {hostType === "Reguler" && (
                      <div className="pt-2">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest leading-none mb-2">
                          Syarat Bonus Kehadiran
                        </div>
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-[11px]">
                            {item.totalHadir >= item.requiredWorkingDays ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[9px] text-slate-400 font-bold">✕</div>
                            )}
                            <span className={item.totalHadir >= item.requiredWorkingDays ? "text-slate-700" : "text-slate-500"}>
                              Kehadiran Penuh ({item.totalHadir}/{item.requiredWorkingDays} Hari)
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px]">
                            {item.countTerlambat <= 3 ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[9px] text-slate-400 font-bold">✕</div>
                            )}
                            <span className={item.countTerlambat <= 3 ? "text-slate-700" : "text-slate-500"}>
                              Terlambat &le; 3x ({item.countTerlambat}x)
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px]">
                            {!item.hasViolations ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[9px] text-slate-400 font-bold">✕</div>
                            )}
                            <span className={!item.hasViolations ? "text-slate-700" : "text-slate-500"}>
                              {item.hasViolations ? `Ada Pelanggaran (${item.violationsCount}x)` : "Tidak Ada Pelanggaran"}
                            </span>
                          </div>
                        </div>
                        
                        <div className={`p-3 rounded-xl border ${item.isEligibleForBonus ? 'bg-[#ebfef4] border-[#bbf7d0]' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[11px] font-bold ${item.isEligibleForBonus ? 'text-emerald-800' : 'text-slate-500'}`}>
                              Bonus +100% Hadir:
                            </span>
                            <span className={`text-xs font-mono font-bold ${item.isEligibleForBonus ? 'text-emerald-800' : 'text-slate-500'}`}>
                              {item.isEligibleForBonus ? `+${formatIDR(item.calculatedBonus || 300000)}` : 'Rp 0'}
                            </span>
                          </div>
                          <div className={`text-[10px] ${item.isEligibleForBonus ? 'text-emerald-600' : 'text-slate-400'}`}>
                            Status: {item.isEligibleForBonus ? "Memenuhi kualifikasi & berhak menerima bonus" : "Tidak memenuhi syarat bonus"}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bonus & Potongan Summary */}
                    {(item.bonusTotal > 0 || item.deductionTotal > 0) && (
                      <div className="flex gap-2">
                        {item.bonusTotal > 0 && (
                          <div className="flex-1 bg-emerald-50 rounded-lg p-2 flex flex-col justify-center items-center text-center">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase">Total Bonus</span>
                            <span className="text-[11px] font-mono font-bold text-emerald-700 truncate max-w-full">+{formatIDR(item.bonusTotal)}</span>
                          </div>
                        )}
                        {item.deductionTotal > 0 && (
                          <div className="flex-1 bg-rose-50 rounded-lg p-2 flex flex-col justify-center items-center text-center">
                            <span className="text-[9px] font-bold text-rose-600 uppercase">Potongan</span>
                            <span className="text-[11px] font-mono font-bold text-rose-700 truncate max-w-full">-{formatIDR(item.deductionTotal)}</span>
                          </div>
                        )}
                      </div>
                    )}
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
