import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  TrendingUp,
  Wallet,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  X,
  PieChart,
  ShieldCheck,
  Activity,
  BadgePercent,
  Calendar,
  Filter,
} from 'lucide-react';
import { ClientBrand, BrandInvoice, HostAccount, ActivityLog, InvoiceSettings } from '../../types';
import {
  getInvoiceClosingPeriod,
  isDateInInvoiceClosingPeriod,
  determineClosingMonthForDate,
  getAvailableClosingMonths,
  getInvoiceBenchmarkDate,
  InvoiceClosingPeriod,
} from '../../shared/utils/invoiceClosingPeriod';
import { settingsApi } from '../../api';

interface FinanceDashboardProps {
  clientBrands: ClientBrand[];
  hosts?: HostAccount[];
  logs?: ActivityLog[];
  filteredHostReportList?: Array<{
    id: string;
    name: string;
    netSalary: number;
    baseSalary?: number;
    overtimePay?: number;
    totalHours?: number;
    studio?: string;
  }>;
  onNavigateTab: (tab: 'invoice' | 'rekap_gaji') => void;
}

// Helper functions for robust, case-insensitive invoice status matching
const isPaidInvoice = (status?: string | null): boolean => {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s.includes('paid') || s.includes('lunas') || s.includes('dibayar');
};

const isCancelledInvoice = (status?: string | null): boolean => {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s.includes('cancel') || s.includes('batal');
};

const isDraftInvoice = (status?: string | null): boolean => {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s.includes('draft');
};

const isOpenInvoice = (status?: string | null): boolean => {
  if (!status || isPaidInvoice(status) || isCancelledInvoice(status) || isDraftInvoice(status)) return false;
  const s = status.trim().toLowerCase();
  return s.includes('open') || s.includes('terkirim') || s.includes('menunggu');
};

const isOverdueInvoice = (
  inv: { status?: string | null; dueDate?: string | null },
  todayStr: string
): boolean => {
  if (isPaidInvoice(inv.status) || isCancelledInvoice(inv.status) || isDraftInvoice(inv.status)) return false;
  const s = inv.status ? inv.status.trim().toLowerCase() : '';
  if (s.includes('overdue') || s.includes('tempo')) return true;
  return Boolean(inv.dueDate && inv.dueDate.slice(0, 10) < todayStr);
};

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  clientBrands,
  filteredHostReportList = [],
  onNavigateTab,
}) => {
  // Tutup Buku / Cut-off closing day state
  const [closingDay, setClosingDay] = useState<number>(25);
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    return determineClosingMonthForDate(new Date(), 25);
  });
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);

  // Load closingDay from MySQL settings
  useEffect(() => {
    settingsApi.get<InvoiceSettings | null>('mcn_invoice_settings').then((saved) => {
      if (saved && Object.keys(saved).length > 0) {
        const cDay = Number(saved.closingDay) || 25;
        setClosingDay(cDay);
        setFilterMonth((prev) => {
          const initialDefault = determineClosingMonthForDate(new Date(), 25);
          if (prev === initialDefault) {
            return determineClosingMonthForDate(new Date(), cDay);
          }
          return prev;
        });
      }
    }).catch(console.error);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(e.target as Node)
      ) {
        setIsPeriodDropdownOpen(false);
      }
    };
    if (isPeriodDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPeriodDropdownOpen]);

  // Aggregate all invoices from all brands
  const allInvoices = useMemo(() => {
    const list: Array<BrandInvoice & { brandName: string; brandId: string }> = [];
    clientBrands.forEach((b) => {
      (b.invoices || []).forEach((inv) => {
        list.push({
          ...inv,
          brandName: b.name,
          brandId: b.id,
        });
      });
    });
    // Sort descending by benchmark date / due date
    return list.sort((a, b) => {
      const dateA = getInvoiceBenchmarkDate(a);
      const dateB = getInvoiceBenchmarkDate(b);
      return dateB.localeCompare(dateA);
    });
  }, [clientBrands]);

  // Available closing periods for dropdown based on benchmark dates (Due Date)
  const availableClosingPeriods = useMemo(() => {
    const dates = allInvoices
      .map((inv) => getInvoiceBenchmarkDate(inv))
      .filter(Boolean);
    return getAvailableClosingMonths(dates, closingDay);
  }, [allInvoices, closingDay]);

  // Selected closing period details
  const selectedPeriod = useMemo(() => {
    if (!filterMonth || filterMonth === 'ALL') return null;
    return (
      availableClosingPeriods.find((p) => p.closingMonth === filterMonth) ||
      getInvoiceClosingPeriod(filterMonth, closingDay)
    );
  }, [filterMonth, availableClosingPeriods, closingDay]);

  // Navigate prev / next month
  const handleNavigateMonth = (direction: -1 | 1) => {
    const currentKey =
      filterMonth && filterMonth !== 'ALL'
        ? filterMonth
        : determineClosingMonthForDate(new Date(), closingDay);
    const [yStr, mStr] = currentKey.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const target = new Date(y, m - 1 + direction, 1);
    const targetKey = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
    setFilterMonth(targetKey);
  };

  // Filtered invoices according to selected cut-off period
  const filteredInvoices = useMemo(() => {
    if (!filterMonth || filterMonth === 'ALL') {
      return allInvoices;
    }
    return allInvoices.filter((inv) => {
      const benchmarkDate = getInvoiceBenchmarkDate(inv);
      if (!benchmarkDate) return false;
      return isDateInInvoiceClosingPeriod(benchmarkDate, filterMonth, closingDay);
    });
  }, [allInvoices, filterMonth, closingDay]);

  // Invoice revenue calculations based on filteredInvoices
  const invoiceStats = useMemo(() => {
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;
    let draftAmount = 0;
    let cancelledAmount = 0;
    let totalAmount = 0;

    let paidCount = 0;
    let openCount = 0;
    let overdueCount = 0;
    let draftCount = 0;
    let cancelledCount = 0;

    const todayStr = new Date().toISOString().slice(0, 10);

    filteredInvoices.forEach((inv) => {
      const amt = Number(inv.totalAmount) || 0;
      totalAmount += amt;

      const isPaid = isPaidInvoice(inv.status);
      const isCancelled = isCancelledInvoice(inv.status);
      const isDraft = isDraftInvoice(inv.status);
      const isOpen = isOpenInvoice(inv.status);
      const isOverdue = isOverdueInvoice(inv, todayStr);

      if (isPaid) {
        paidCount++;
        paidAmount += amt;
      } else if (isCancelled) {
        cancelledCount++;
        cancelledAmount += amt;
      } else if (isDraft) {
        draftCount++;
        draftAmount += amt;
      }

      if (isOpen) {
        openCount++;
        pendingAmount += amt;
      }

      if (isOverdue) {
        overdueCount++;
        overdueAmount += amt;
      }
    });

    // Piutang aktif berjalan (semua tagihan non-paid & non-cancelled yang belum lunas)
    const unpaidInvoices = filteredInvoices.filter(
      (inv) => !isPaidInvoice(inv.status) && !isCancelledInvoice(inv.status) && !isDraftInvoice(inv.status)
    );
    const receivablesAmount = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const receivablesCount = unpaidInvoices.length;

    return {
      totalAmount,
      totalCount: filteredInvoices.length,
      paidAmount,
      paidCount,
      pendingAmount,
      pendingCount: openCount,
      openCount,
      overdueAmount,
      overdueCount,
      draftAmount,
      draftCount,
      cancelledAmount,
      cancelledCount,
      receivablesAmount,
      receivablesCount,
    };
  }, [filteredInvoices]);

  // Payroll expense calculations
  const payrollStats = useMemo(() => {
    let totalNetSalary = 0;
    let totalBaseSalary = 0;
    let totalOvertime = 0;
    let totalHours = 0;

    filteredHostReportList.forEach((h: any) => {
      const net = Number(h.netSalary) || 0;
      const otPay = Number(h.calculatedOvertimePay ?? h.overtimePay ?? 0);
      // Gaji Pokok & Hadir: Akumulasi basic salary & kehadiran (net dikurangi lembur)
      const base = Number(h.baseSalary ?? (net - otPay));
      const hours = Number(
        h.totalLiveHours ??
        h.totalHours ??
        ((Number(h.totalHadir) || 0) * 4 + (Number(h.totalOvertimeHours) || 0))
      );

      totalNetSalary += net;
      totalBaseSalary += base;
      totalOvertime += otPay;
      totalHours += hours;
    });

    return {
      totalNetSalary,
      totalBaseSalary,
      totalOvertime,
      totalHours: Math.round(totalHours * 10) / 10,
      hostCount: filteredHostReportList.length,
    };
  }, [filteredHostReportList]);

  // Executive net balance & cashflow margin
  const netCashflow = invoiceStats.paidAmount - payrollStats.totalNetSalary;
  const netMarginPercent =
    invoiceStats.paidAmount > 0
      ? Math.round((netCashflow / invoiceStats.paidAmount) * 100)
      : 0;

  const formatIDR = (num: number) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn font-sans pb-12 w-full min-w-0" id="finance_dashboard_view">
      {/* ─── TOP EXECUTIVE BANNER ─── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden border border-indigo-900/50">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-indigo-300" />
                Liva Finance Ecosystem
              </span>
              <span className="text-xs text-indigo-200/70">• Arus Kas & Manajemen Keuangan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Finance Dashboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Ringkasan komprehensif pemasukan nota penagihan klien (Billing & Invoice), biaya kompensasi operasional host (Payroll), serta rasio margin laba bersih.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            <button
              type="button"
              onClick={() => onNavigateTab('invoice')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border border-indigo-400/30"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Buka Billing & Invoice</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('rekap_gaji')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all border border-white/15 backdrop-blur-xs flex items-center gap-2 cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Buka Payroll</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── CUT-OFF FILTER TOOLBAR (PERSIS SEPERTI FITUR INVOICE) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full min-w-0">
        {/* Left: Cut-off controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Semua Periode (All) */}
          <button
            type="button"
            onClick={() => setFilterMonth('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMonth === 'ALL' || !filterMonth
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Semua Periode (All)</span>
          </button>

          {/* Previous Month Navigation */}
          <button
            type="button"
            onClick={() => handleNavigateMonth(-1)}
            title="Periode Tutup Buku Sebelumnya"
            className="p-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer shadow-2xs transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Custom Pretty Period Dropdown */}
          <div ref={periodDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border transition-all shadow-2xs cursor-pointer ${
                filterMonth && filterMonth !== 'ALL'
                  ? 'bg-white border-indigo-400 ring-2 ring-indigo-50/70 text-indigo-950 font-bold'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-700 font-semibold'
              }`}
              title="Pilih periode tutup buku cut-off"
            >
              <span className="text-[11px] font-bold text-slate-400">Cut-off Tutup Buku:</span>

              <div className="flex items-center gap-1.5 text-xs">
                {selectedPeriod ? (
                  <>
                    <span className="font-bold text-slate-900">{selectedPeriod.monthName}</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.2 rounded-md hidden sm:inline border border-indigo-100">
                      {selectedPeriod.dateRangeLabel}
                    </span>
                    {selectedPeriod.isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Siklus Berjalan" />
                    )}
                  </>
                ) : (
                  <span className="text-slate-500 font-medium">Semua Bulan</span>
                )}
              </div>

              {filterMonth && filterMonth !== 'ALL' && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterMonth('ALL');
                    setIsPeriodDropdownOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      setFilterMonth('ALL');
                      setIsPeriodDropdownOpen(false);
                    }
                  }}
                  title="Kembali ke Semua Periode (All)"
                  className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors ml-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              )}

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isPeriodDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </button>

            {/* Dropdown Floating Menu */}
            {isPeriodDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200/90 ring-1 ring-black/5 animate-fadeIn">
                {/* Header inside popup */}
                <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-100 mb-1">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Periode Tutup Buku (Tgl {closingDay})
                    </span>
                    <span className="text-[9px] font-semibold text-indigo-600 block">
                      Patokan: Hari Jatuh Tempo (Due Date)
                    </span>
                  </div>
                  {filterMonth && filterMonth !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterMonth('ALL');
                        setIsPeriodDropdownOpen(false);
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                    >
                      Tampilkan Semua
                    </button>
                  )}
                </div>

                {/* Option: Semua Periode */}
                <button
                  type="button"
                  onClick={() => {
                    setFilterMonth('ALL');
                    setIsPeriodDropdownOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    !filterMonth || filterMonth === 'ALL'
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    <span className="text-xs">Semua Periode (All)</span>
                  </div>
                  {(!filterMonth || filterMonth === 'ALL') && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  )}
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Options list: Month items */}
                <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5 no-scrollbar">
                  {availableClosingPeriods.map((p) => {
                    const isSelected = filterMonth === p.closingMonth;
                    return (
                      <button
                        key={p.closingMonth}
                        type="button"
                        onClick={() => {
                          setFilterMonth(p.closingMonth);
                          setIsPeriodDropdownOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-indigo-50/90 text-indigo-950 font-bold border border-indigo-200/80 shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-50 font-medium border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              p.isCurrent
                                ? 'bg-emerald-500 ring-2 ring-emerald-200'
                                : isSelected
                                ? 'bg-indigo-600'
                                : 'bg-slate-300'
                            }`}
                          />
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">
                                {p.monthName}
                              </span>
                              {p.isCurrent && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                                  Berjalan
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {p.dateRangeLabel}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-600 shrink-0 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Next Month Navigation */}
          <button
            type="button"
            onClick={() => handleNavigateMonth(1)}
            title="Periode Tutup Buku Berikutnya"
            className="p-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer shadow-2xs transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Active Filter Indicator Badge */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>
              {selectedPeriod
                ? `Rentang: ${selectedPeriod.dateRangeLabel}`
                : 'Rentang: Semua Periode'}
            </span>
            <span className="text-slate-400 font-normal">
              ({filteredInvoices.length} dari {allInvoices.length} tagihan)
            </span>
          </div>
        </div>
      </div>

      {/* ─── 4 EXECUTIVE SUMMARY CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Pendapatan Lunas (Paid) */}
        <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Pemasukan Lunas (Paid)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-3xs group-hover:scale-105 transition-transform">
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatIDR(invoiceStats.paidAmount)}
            </div>
            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">Dari {invoiceStats.paidCount} invoice lunas</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Masuk Rekening
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Piutang Berjalan (Outstanding) */}
        <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
              Piutang Tagihan (Outstanding)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-3xs group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatIDR(invoiceStats.receivablesAmount)}
            </div>
            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">{invoiceStats.receivablesCount} invoice pending</span>
              {invoiceStats.overdueCount > 0 ? (
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {invoiceStats.overdueCount} Overdue
                </span>
              ) : (
                <span className="font-bold text-blue-600">Jatuh Tempo Aman</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran Payroll */}
        <div className="p-4 bg-white rounded-2xl border border-violet-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-600">
              Biaya Payroll (Host & Ops)
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center shadow-3xs group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatIDR(payrollStats.totalNetSalary)}
            </div>
            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">Kompensasi {payrollStats.hostCount} Host</span>
              <span className="font-bold text-violet-600 flex items-center gap-1">
                <Users className="w-3 h-3" /> Periode Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Estimasi Margin Bersih Operasional */}
        <div className={`p-4 bg-white rounded-2xl border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden ${
          netCashflow >= 0 ? 'border-indigo-100' : 'border-rose-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${
              netCashflow >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}>
              Estimasi Margin Kas Bersih
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-3xs group-hover:scale-105 transition-transform ${
              netCashflow >= 0 ? 'bg-indigo-50 border border-indigo-100 text-indigo-600' : 'bg-rose-50 border border-rose-100 text-rose-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-xl sm:text-2xl font-black tracking-tight ${
              netCashflow >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}>
              {formatIDR(netCashflow)}
            </div>
            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">Pemasukan - Payroll</span>
              <span className={`font-black px-1.5 py-0.2 rounded-md ${
                netCashflow >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {netMarginPercent > 0 ? `+${netMarginPercent}%` : `${netMarginPercent}%`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TWO MAIN PILLARS: BILLING & INVOICE VS PAYROLL ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pillar 1: Billing & Invoice Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Billing & Invoice</h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedPeriod ? `Siklus Tutup Buku ${selectedPeriod.monthName}` : 'Semua Periode Penagihan Klien'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('invoice')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Invoice</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Invoices Status Progress Distribution */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Distribusi Status Tagihan:</span>
                <span className="text-slate-500 font-semibold">{invoiceStats.totalCount} Nota Tagihan</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Lunas</span>
                  <span className="text-base font-black text-emerald-800">{invoiceStats.paidCount}</span>
                  <span className="text-[10px] text-emerald-600/90 block truncate">{formatIDR(invoiceStats.paidAmount)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">Open (Menunggu)</span>
                  <span className="text-base font-black text-blue-800">{invoiceStats.pendingCount}</span>
                  <span className="text-[10px] text-blue-600/90 block truncate">{formatIDR(invoiceStats.pendingAmount)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-700 uppercase block">Jatuh Tempo</span>
                  <span className="text-base font-black text-rose-800">{invoiceStats.overdueCount}</span>
                  <span className="text-[10px] text-rose-600/90 block truncate">{formatIDR(invoiceStats.overdueAmount)}</span>
                </div>
              </div>

              {/* Progress bar visual */}
              {invoiceStats.totalAmount > 0 && (
                <div className="pt-1">
                  <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (invoiceStats.paidAmount / invoiceStats.totalAmount) * 100)}%` }}
                      className="bg-emerald-500 h-full transition-all"
                      title={`Lunas: ${formatIDR(invoiceStats.paidAmount)}`}
                    />
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          (Math.max(0, invoiceStats.pendingAmount - invoiceStats.overdueAmount) /
                            invoiceStats.totalAmount) *
                            100
                        )}%`,
                      }}
                      className="bg-blue-500 h-full transition-all"
                      title={`Open: ${formatIDR(Math.max(0, invoiceStats.pendingAmount - invoiceStats.overdueAmount))}`}
                    />
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          (invoiceStats.overdueAmount / invoiceStats.totalAmount) * 100
                        )}%`,
                      }}
                      className="bg-rose-500 h-full transition-all"
                      title={`Jatuh Tempo: ${formatIDR(invoiceStats.overdueAmount)}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Akumulasi Tagihan Terpilih:</span>
            <span className="font-black text-slate-900">{formatIDR(invoiceStats.totalAmount)}</span>
          </div>
        </div>

        {/* Pillar 2: Payroll Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Payroll</h3>
                  <p className="text-[11px] text-slate-500">Perhitungan gaji & tunjangan host streamer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('rekap_gaji')}
                className="text-xs font-bold text-violet-600 hover:text-violet-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Payroll</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Payroll Key Highlights */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Rincian Biaya Kompensasi Host:</span>
                <span className="text-slate-500 font-semibold">{payrollStats.hostCount} Host Terdaftar</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Gaji Pokok & Hadir</span>
                  <span className="text-base font-black text-slate-900">{formatIDR(payrollStats.totalBaseSalary)}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Akumulasi basic salary</span>
                </div>
                <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-100">
                  <span className="text-[10px] font-bold text-violet-700 uppercase block">Total Lembur Host</span>
                  <span className="text-base font-black text-violet-900">{formatIDR(payrollStats.totalOvertime)}</span>
                  <span className="text-[10px] text-violet-600/90 mt-0.5 block">Kompensasi shift lembur</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Total Durasi Live Terhitung:</span>
                </div>
                <span className="font-black text-indigo-950 font-mono">
                  {Math.round(payrollStats.totalHours * 10) / 10} Jam
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Estimasi Beban Payroll:</span>
            <span className="font-black text-violet-900">{formatIDR(payrollStats.totalNetSalary)}</span>
          </div>
        </div>
      </div>

      {/* ─── RECENT INVOICES ACTIVITY PREVIEW ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              Transaksi & Tagihan Invoice {selectedPeriod ? `(${selectedPeriod.monthName})` : 'Terkini'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('invoice')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua ({filteredInvoices.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="font-bold text-slate-600">Tidak ada invoice pada periode cut-off ini.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {selectedPeriod
                ? `Tidak ditemukan invoice dengan jatuh tempo antara ${selectedPeriod.dateRangeLabel}.`
                : 'Belum ada invoice yang diterbitkan.'}
            </p>
            {filterMonth !== 'ALL' && (
              <button
                type="button"
                onClick={() => setFilterMonth('ALL')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:bg-slate-800"
              >
                <span>Tampilkan Semua Periode</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">No. Invoice</th>
                  <th className="py-2.5 px-3">Brand / PT</th>
                  <th className="py-2.5 px-3">Jatuh Tempo</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.slice(0, 8).map((inv) => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  const isPaid = isPaidInvoice(inv.status);
                  const isCancelled = isCancelledInvoice(inv.status);
                  const isDraft = isDraftInvoice(inv.status);
                  const isOpen = isOpenInvoice(inv.status);
                  const isOverdue = isOverdueInvoice(inv, todayStr);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        <div className="truncate max-w-xs">{inv.brandName}</div>
                        {inv.ptName && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{inv.ptName}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {inv.dueDate || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-2.5 h-2.5" /> LUNAS
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-2.5 h-2.5" /> JATUH TEMPO
                          </span>
                        ) : isOpen ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                            <Clock className="w-2.5 h-2.5" /> TERKIRIM (OPEN)
                          </span>
                        ) : isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                            DIBATALKAN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                            {inv.status || 'DRAFT'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-slate-900 font-mono">
                        {formatIDR(Number(inv.totalAmount) || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
