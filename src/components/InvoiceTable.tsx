import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Search,
  Edit2,
  Trash2,
  Download,
  Mail,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  Building2,
  Phone,
  X,
  ShieldCheck,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { ClientBrand, BrandInvoice } from '../types';
import { formatContractDate, formatLivePeriod } from '../shared/utils/dateFormatting';
import { InvoiceSettings } from './invoice/InvoiceSettingsPanel';
import {
  getInvoiceClosingPeriod,
  determineClosingMonthForDate,
  getAvailableClosingMonths,
  InvoiceClosingPeriod,
} from '../shared/utils/invoiceClosingPeriod';

export type InvoiceStatusFilter = 'ALL' | 'OVERDUE' | 'OPEN' | 'DRAFT' | 'PAID' | 'CANCELLED';

const STATUS_FILTER_OPTIONS: {
  key: InvoiceStatusFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorActive: string;
  badgeActive: string;
  badgeInactive: string;
}[] = [
  {
    key: 'ALL',
    label: 'Semua Status',
    icon: FileText,
    colorActive: 'bg-slate-900 text-white shadow-xs',
    badgeActive: 'bg-slate-800 text-slate-200',
    badgeInactive: 'bg-slate-100 text-slate-700',
  },
  {
    key: 'OVERDUE',
    label: 'Jatuh Tempo (Overdue)',
    icon: AlertTriangle,
    colorActive: 'bg-rose-600 text-white shadow-xs',
    badgeActive: 'bg-rose-700 text-rose-100',
    badgeInactive: 'bg-rose-100 text-rose-800',
  },
  {
    key: 'OPEN',
    label: 'Terkirim (Open)',
    icon: Send,
    colorActive: 'bg-blue-600 text-white shadow-xs',
    badgeActive: 'bg-blue-700 text-blue-100',
    badgeInactive: 'bg-blue-100 text-blue-800',
  },
  {
    key: 'DRAFT',
    label: 'Draft',
    icon: Clock,
    colorActive: 'bg-slate-700 text-white shadow-xs',
    badgeActive: 'bg-slate-800 text-slate-200',
    badgeInactive: 'bg-slate-100 text-slate-700',
  },
  {
    key: 'PAID',
    label: 'Lunas (Paid)',
    icon: CheckCircle2,
    colorActive: 'bg-emerald-600 text-white shadow-xs',
    badgeActive: 'bg-emerald-700 text-emerald-100',
    badgeInactive: 'bg-emerald-100 text-emerald-800',
  },
  {
    key: 'CANCELLED',
    label: 'Dibatalkan',
    icon: X,
    colorActive: 'bg-zinc-700 text-white shadow-xs',
    badgeActive: 'bg-zinc-800 text-zinc-200',
    badgeInactive: 'bg-zinc-100 text-zinc-600',
  },
];

interface InvoiceTableProps {
  allInvoices: (BrandInvoice & { brandId: string; brandName: string })[];
  rawAllInvoices?: (BrandInvoice & { brandId: string; brandName: string })[];
  upcomingBillings: ClientBrand[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterMonth: string;
  setFilterMonth: (m: string) => void;
  invoiceSettings?: InvoiceSettings;
  onSaveSettings?: (settings: InvoiceSettings) => void;
  updateInvoiceStatus: (brandId: string, invId: string, newStatus: BrandInvoice["status"]) => void;
  setInvoiceEditor: (inv: BrandInvoice & { brandId: string }) => void;
  setInvoiceToDelete: (data: { brandId: string; id: string }) => void;
  handlePrint: (inv: BrandInvoice, brandName: string, options?: { withMeterai?: boolean }) => void;
  handleShowEmailCopy: (inv: BrandInvoice, brandName: string, picEmail?: string) => void;
  onPreviewInvoice?: (inv: BrandInvoice & { brandId: string; brandName: string }) => void;
  clientBrands: ClientBrand[];
  formatDateUI: (d?: string) => string;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  allInvoices,
  rawAllInvoices,
  upcomingBillings,
  searchQuery,
  setSearchQuery,
  filterMonth,
  setFilterMonth,
  invoiceSettings,
  onSaveSettings,
  updateInvoiceStatus,
  setInvoiceEditor,
  setInvoiceToDelete,
  handlePrint,
  handleShowEmailCopy,
  onPreviewInvoice,
  clientBrands,
  formatDateUI,
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('ALL');
  const [downloadMenuOpenId, setDownloadMenuOpenId] = useState<string | null>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Quick Tutup Buku settings state
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const closingDay = invoiceSettings?.closingDay ?? 25;
  const useClosingCutoff = invoiceSettings?.useClosingCutoff !== false;
  const [tempClosingDay, setTempClosingDay] = useState(closingDay);
  const [tempUseClosingCutoff, setTempUseClosingCutoff] = useState(useClosingCutoff);

  useEffect(() => {
    setTempClosingDay(invoiceSettings?.closingDay ?? 25);
    setTempUseClosingCutoff(invoiceSettings?.useClosingCutoff !== false);
  }, [invoiceSettings, isQuickSettingsOpen]);

  // Custom Tutup Buku dropdown open state
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(event.target as Node)
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

  // Available closing periods for dropdown
  const availableClosingPeriods = useMemo(() => {
    const dates = (rawAllInvoices || allInvoices)
      .map((inv) => inv.issueDate || inv.dueDate || '')
      .filter(Boolean);
    return getAvailableClosingMonths(dates, closingDay);
  }, [rawAllInvoices, allInvoices, closingDay]);

  // Selected closing period details
  const selectedPeriod = useMemo(() => {
    if (!filterMonth || filterMonth === 'ALL') return null;
    return (
      availableClosingPeriods.find((p) => p.closingMonth === filterMonth) ||
      getInvoiceClosingPeriod(filterMonth, closingDay)
    );
  }, [filterMonth, availableClosingPeriods, closingDay]);

  // Navigate month
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

  const handleSaveQuickSettings = () => {
    if (onSaveSettings) {
      onSaveSettings({
        logoUrl: invoiceSettings?.logoUrl || '',
        signatureUrl: invoiceSettings?.signatureUrl || '',
        signatureName: invoiceSettings?.signatureName || '',
        accountNo: invoiceSettings?.accountNo || '',
        accountName: invoiceSettings?.accountName || '',
        bankName: invoiceSettings?.bankName || '',
        ...invoiceSettings,
        useClosingCutoff: tempUseClosingCutoff,
        closingDay: tempClosingDay,
      });
    }
    setIsQuickSettingsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setDownloadMenuOpenId(null);
      }
    };
    if (downloadMenuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [downloadMenuOpenId]);

  const todayStr = new Date().toISOString().substring(0, 10);

  // Helper to check if an invoice is overdue
  const isOverdue = (inv: BrandInvoice) => {
    if (inv.status === 'Paid' || inv.status === 'Cancelled') return false;
    return inv.dueDate ? inv.dueDate < todayStr : false;
  };

  // Counts for summary cards & status filter pills
  const statusCounts = useMemo(() => {
    let draft = 0;
    let open = 0;
    let paid = 0;
    let overdue = 0;
    let cancelled = 0;

    allInvoices.forEach((inv) => {
      if (inv.status === 'Paid') {
        paid++;
      } else if (inv.status === 'Cancelled') {
        cancelled++;
      } else if (inv.status === 'Draft') {
        draft++;
      }

      if (inv.status !== 'Paid' && inv.status !== 'Cancelled') {
        if (inv.status === 'Overdue' || isOverdue(inv)) {
          overdue++;
        }
      }

      if (inv.status === 'Open Invoice') {
        open++;
      }
    });

    return {
      ALL: allInvoices.length,
      OVERDUE: overdue,
      OPEN: open,
      DRAFT: draft,
      PAID: paid,
      CANCELLED: cancelled,
    };
  }, [allInvoices, todayStr]);

  // Backward compatibility alias for KPI cards
  const counts = useMemo(() => {
    return {
      total: statusCounts.ALL,
      draft: statusCounts.DRAFT,
      open: statusCounts.OPEN,
      paid: statusCounts.PAID,
      overdue: statusCounts.OVERDUE,
    };
  }, [statusCounts]);

  // Financial summary
  const summary = useMemo(() => {
    const totalAmount = allInvoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
    const paidAmount = allInvoices
      .filter((i) => i.status === 'Paid')
      .reduce((acc, i) => acc + (i.totalAmount || 0), 0);
    const pendingAmount = allInvoices
      .filter((i) => i.status === 'Open Invoice')
      .reduce((acc, i) => acc + (i.totalAmount || 0), 0);
    const overdueAmount = allInvoices
      .filter((i) => i.status !== 'Paid' && i.status !== 'Cancelled' && (isOverdue(i) || i.status === 'Overdue'))
      .reduce((acc, i) => acc + (i.totalAmount || 0), 0);

    return { totalAmount, paidAmount, pendingAmount, overdueAmount };
  }, [allInvoices, todayStr]);

  // Filtered list (status, search & sort)
  const filteredInvoices = useMemo(() => {
    return allInvoices
      .filter((inv) => {
        // Status filter
        if (statusFilter === 'OVERDUE') {
          const isInvOverdue = inv.status === 'Overdue' || (inv.status !== 'Paid' && inv.status !== 'Cancelled' && isOverdue(inv));
          if (!isInvOverdue) return false;
        } else if (statusFilter === 'OPEN') {
          if (inv.status !== 'Open Invoice') return false;
        } else if (statusFilter === 'DRAFT') {
          if (inv.status !== 'Draft') return false;
        } else if (statusFilter === 'PAID') {
          if (inv.status !== 'Paid') return false;
        } else if (statusFilter === 'CANCELLED') {
          if (inv.status !== 'Cancelled') return false;
        }

        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase().trim();
          const matchNum = inv.invoiceNumber?.toLowerCase().includes(q);
          const matchBrand = inv.brandName?.toLowerCase().includes(q);
          const matchPt = inv.ptName?.toLowerCase().includes(q);
          const matchPic = inv.picName?.toLowerCase().includes(q);
          const matchRecipient = inv.recipientName?.toLowerCase().includes(q);
          if (!matchNum && !matchBrand && !matchPt && !matchPic && !matchRecipient) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        return sortOrder === 'asc'
          ? a.invoiceNumber.localeCompare(b.invoiceNumber)
          : b.invoiceNumber.localeCompare(a.invoiceNumber);
      });
  }, [allInvoices, statusFilter, searchQuery, sortOrder, todayStr]);

  return (
    <div className="space-y-3.5 animate-fadeIn w-full min-w-0">
      {/* KPI Metrics Cards (4 Columns - Clean, Compact & Interactive Filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full min-w-0">
        {/* Total Invoices */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-3 sm:p-3.5 rounded-xl border shadow-2xs relative overflow-hidden flex flex-col justify-between min-w-0 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'ALL'
              ? 'bg-slate-50 border-slate-900 ring-2 ring-slate-900/10'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
          title="Klik untuk tampilkan semua invoice"
        >
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between gap-1.5 truncate">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Total Tagihan
              </span>
              {statusFilter === 'ALL' && (
                <span className="text-[9px] bg-slate-900 text-white font-black px-1.5 py-0.2 rounded shrink-0">
                  Aktif
                </span>
              )}
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {counts.total}
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-100 text-xs font-bold text-slate-500 truncate">
            Rp {new Intl.NumberFormat('id-ID').format(summary.totalAmount)}
          </div>
        </div>

        {/* Paid / Lunas */}
        <div
          onClick={() => setStatusFilter((prev) => (prev === 'PAID' ? 'ALL' : 'PAID'))}
          className={`p-3 sm:p-3.5 rounded-xl border shadow-2xs relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/20 min-w-0 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'PAID'
              ? 'bg-emerald-50/50 border-emerald-600 ring-2 ring-emerald-500/20'
              : 'border-emerald-200/80 hover:border-emerald-300'
          }`}
          title="Klik untuk filter invoice lunas (Paid)"
        >
          <div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1 flex items-center justify-between gap-1.5 truncate">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Sudah Dibayar (Lunas)
              </span>
              {statusFilter === 'PAID' && (
                <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded shrink-0">
                  Aktif
                </span>
              )}
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-700 leading-tight">
              {counts.paid}
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-emerald-100 text-xs font-black text-emerald-800 truncate">
            Rp {new Intl.NumberFormat('id-ID').format(summary.paidAmount)}
          </div>
        </div>

        {/* Open / Terkirim */}
        <div
          onClick={() => setStatusFilter((prev) => (prev === 'OPEN' ? 'ALL' : 'OPEN'))}
          className={`p-3 sm:p-3.5 rounded-xl border shadow-2xs relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white to-blue-50/20 min-w-0 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'OPEN'
              ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-500/20'
              : 'border-blue-200/80 hover:border-blue-300'
          }`}
          title="Klik untuk filter invoice terkirim (Open Invoice)"
        >
          <div>
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1 flex items-center justify-between gap-1.5 truncate">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Menunggu Pembayaran
              </span>
              {statusFilter === 'OPEN' && (
                <span className="text-[9px] bg-blue-600 text-white font-black px-1.5 py-0.2 rounded shrink-0">
                  Aktif
                </span>
              )}
            </div>
            <div className="text-lg sm:text-xl font-black text-blue-700 leading-tight">
              {counts.open}
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-blue-100 text-xs font-black text-blue-800 truncate">
            Rp {new Intl.NumberFormat('id-ID').format(summary.pendingAmount)}
          </div>
        </div>

        {/* Overdue / Jatuh Tempo */}
        <div
          onClick={() => setStatusFilter((prev) => (prev === 'OVERDUE' ? 'ALL' : 'OVERDUE'))}
          className={`p-3 sm:p-3.5 rounded-xl border shadow-2xs relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/20 min-w-0 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'OVERDUE'
              ? 'bg-rose-50/50 border-rose-600 ring-2 ring-rose-500/20'
              : 'border-rose-200/80 hover:border-rose-300'
          }`}
          title="Klik untuk filter invoice jatuh tempo (Overdue)"
        >
          <div>
            <div className="text-[10px] font-black text-rose-600 uppercase tracking-wider mb-1 flex items-center justify-between gap-1.5 truncate">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Jatuh Tempo (Overdue)
              </span>
              {statusFilter === 'OVERDUE' && (
                <span className="text-[9px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded shrink-0">
                  Aktif
                </span>
              )}
            </div>
            <div className="text-lg sm:text-xl font-black text-rose-700 leading-tight">
              {counts.overdue}
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-rose-100 text-xs font-black text-rose-800 truncate">
            Rp {new Intl.NumberFormat('id-ID').format(summary.overdueAmount)}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden w-full min-w-0">
        {/* Table Toolbar Row 1: Filter Bulan & Pencarian */}
        <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full min-w-0">
          {/* Month / Tutup Buku Period Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterMonth('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMonth === 'ALL' || !filterMonth
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Semua Periode (All)
            </button>

            {/* Previous Period Button */}
            {useClosingCutoff && (
              <button
                type="button"
                onClick={() => handleNavigateMonth(-1)}
                title="Periode Tutup Buku Sebelumnya"
                className="p-1.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer shadow-2xs transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Custom Pretty Period Dropdown */}
            {useClosingCutoff ? (
              <div ref={periodDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border transition-all shadow-2xs cursor-pointer ${
                    filterMonth && filterMonth !== 'ALL'
                      ? 'bg-white border-indigo-400 ring-2 ring-indigo-50/70 text-indigo-950 font-bold'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-700 font-semibold'
                  }`}
                  title="Pilih periode tutup buku"
                >
                  <span className="text-[11px] font-bold text-slate-400">Tutup Buku:</span>

                  <div className="flex items-center gap-1.5 text-xs">
                    {selectedPeriod ? (
                      <>
                        <span className="font-bold text-slate-900">{selectedPeriod.monthName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.2 rounded-md hidden sm:inline">
                          {selectedPeriod.dateRangeLabel}
                        </span>
                        {selectedPeriod.isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Siklus Berjalan" />
                        )}
                      </>
                    ) : (
                      <span className="text-slate-500 font-medium">Pilih Periode</span>
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

                {/* Floating Custom Dropdown Popup */}
                {isPeriodDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200/90 ring-1 ring-black/5 animate-fadeIn">
                    {/* Header inside popup */}
                    <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-100 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Periode Tutup Buku (Tgl {closingDay})
                      </span>
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

                    {/* Options list: Simple & Pretty Month items */}
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
            ) : (
              <div
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border transition-all shadow-2xs ${
                  filterMonth && filterMonth !== 'ALL'
                    ? 'bg-white border-indigo-400 ring-2 ring-indigo-50'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Pilih Bulan:</span>
                <input
                  type="month"
                  value={filterMonth === 'ALL' ? '' : filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value || 'ALL')}
                  className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                  title="Pilih bulan kalender standar"
                />
                {filterMonth && filterMonth !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setFilterMonth('ALL')}
                    title="Kembali ke Semua Bulan (All)"
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Next Period Button */}
            {useClosingCutoff && (
              <button
                type="button"
                onClick={() => handleNavigateMonth(1)}
                title="Periode Tutup Buku Berikutnya"
                className="p-1.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer shadow-2xs transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick Settings Button */}
            <button
              type="button"
              onClick={() => setIsQuickSettingsOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              title={`Tanggal tutup buku: Tgl ${closingDay} setiap bulan. Klik untuk ubah setting.`}
            >
              <Settings className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tutup Buku Tgl {closingDay}</span>
            </button>

            <span className="text-[11px] font-semibold text-slate-400 ml-1 hidden lg:inline">
              {filteredInvoices.length !== allInvoices.length
                ? `(${filteredInvoices.length} dari ${allInvoices.length} tagihan)`
                : `(${allInvoices.length} tagihan)`}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari no invoice / brand / PT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-7 py-1.5 border border-slate-200/80 rounded-lg text-xs bg-white focus:outline-none focus:border-indigo-400 font-medium text-slate-700 placeholder-slate-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Table Toolbar Row 2: Status Filter Pills (Overdue, Terkirim, Draft, Lunas, Dibatalkan, Semua) */}
        <div className="px-3.5 py-2 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2 w-full min-w-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Status:</span>
            </div>

            {STATUS_FILTER_OPTIONS.map((opt) => {
              const count = statusCounts[opt.key];
              const isActive = statusFilter === opt.key;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setStatusFilter(opt.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? `${opt.colorActive} shadow-xs`
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{opt.label}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                      isActive ? opt.badgeActive : opt.badgeInactive
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Reset Button if not ALL */}
          {statusFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer shrink-0"
              title="Reset filter status ke Semua"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Status</span>
            </button>
          )}
        </div>

        {/* Invoice Table */}
        {filteredInvoices.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-500 flex flex-col items-center justify-center w-full">
            <FileText className="w-10 h-10 text-slate-300 mb-2.5" />
            <p className="font-bold text-slate-700 text-sm">
              Tidak ada invoice yang sesuai kriteria filter.
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {statusFilter !== 'ALL'
                ? `Tidak ditemukan invoice dengan status "${STATUS_FILTER_OPTIONS.find((o) => o.key === statusFilter)?.label}".`
                : 'Coba pilih "Semua Bulan (All)", periksa kata kunci pencarian, atau klik tombol "Buat Invoice Baru".'}
            </p>
            {(statusFilter !== 'ALL' || searchQuery || (filterMonth && filterMonth !== 'ALL')) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {statusFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Tampilkan Semua Status
                  </button>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Hapus Pencarian
                  </button>
                )}
                {filterMonth && filterMonth !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setFilterMonth('ALL')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Tampilkan Semua Bulan
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-h-[260px]">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">
                    <button
                      onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                      className="flex items-center gap-1.5 hover:text-slate-800 cursor-pointer transition-colors outline-none"
                    >
                      <span>No. Invoice</span>
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortOrder === 'asc' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="py-2.5 px-4">Klien / Bill To</th>
                  <th className="py-2.5 px-4">Tanggal & Jatuh Tempo</th>
                  <th className="py-2.5 px-4 text-right">Nominal Tagihan</th>
                  <th className="py-2.5 px-4 text-center">Status Invoice</th>
                  <th className="py-2.5 px-4 text-center">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInvoices.map((inv, idx) => {
                  const brand = clientBrands.find((b) => b.id === inv.brandId || b.name?.toLowerCase() === inv.brandName?.toLowerCase());
                  const isInvOverdue = isOverdue(inv);
                  const isNearBottom = idx >= Math.max(0, filteredInvoices.length - 2) && filteredInvoices.length > 2;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Invoice Number */}
                      <td className="py-2.5 sm:py-3 px-4">
                        <div className="font-mono font-black text-indigo-700 text-xs">
                          {inv.invoiceNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {inv.sessionItems?.length || 0} Item Layanan
                        </div>
                      </td>

                      {/* Client / Bill To */}
                      <td className="py-2.5 sm:py-3 px-4">
                        <div className="font-black text-slate-900 text-xs leading-snug">
                          {inv.ptName || brand?.companyName || brand?.name}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate max-w-[220px]">
                          {inv.picName || brand?.picName || brand?.name || '-'}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {(() => {
                            const displayDueDate = (() => {
                              if (!inv.dueDate) {
                                if (brand?.invoiceDate) return `Tgl ${brand.invoiceDate}`;
                                return '-';
                              }
                              const trimmed = String(inv.dueDate).trim();
                              if (/^\d{1,2}$/.test(trimmed)) {
                                return `Tgl ${trimmed}`;
                              }
                              return formatDateUI(inv.dueDate);
                            })();

                            return (
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs ${
                                  isInvOverdue
                                    ? 'text-rose-800 bg-rose-50/90 border border-rose-200/80'
                                    : 'text-amber-800 bg-amber-50/90 border border-amber-200/80'
                                }`}
                                title="Jatuh Tempo Pembayaran (Due Date)"
                              >
                                <Clock className={`w-2.5 h-2.5 shrink-0 ${isInvOverdue ? 'text-rose-600' : 'text-amber-600'}`} />
                                Due Date: {displayDueDate}
                              </span>
                            );
                          })()}
                          {(() => {
                            const pStart = inv.livePeriodStart || brand?.contractStartDate;
                            const pEnd = inv.livePeriodEnd || brand?.contractEndDate;
                            const formattedPeriod = formatLivePeriod(pStart, pEnd, inv.invoiceDate || inv.issueDate);
                            if (!formattedPeriod) return null;
                            return (
                              <span
                                className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-700 bg-indigo-50/90 border border-indigo-200/80 px-2 py-0.5 rounded-md shadow-2xs"
                                title="Periode Siklus Invoice"
                              >
                                <Calendar className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                                Periode: {formattedPeriod}
                              </span>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-2.5 sm:py-3 px-4">
                        <div className="text-[11px] font-semibold text-slate-700">
                          {formatDateUI(inv.invoiceDate || inv.issueDate)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <span>Due:</span>
                          <span className={isInvOverdue ? 'text-rose-600 font-bold' : ''}>
                            {formatDateUI(inv.dueDate)}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-2.5 sm:py-3 px-4 text-right">
                        <div className="font-black text-slate-900 text-xs whitespace-nowrap">
                          Rp {new Intl.NumberFormat('id-ID').format(inv.totalAmount || 0)}
                        </div>
                        {inv.paymentType === 'dp' && (
                          <div className="mt-1 flex justify-end">
                            <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              DP {inv.dpPercent ? `${inv.dpPercent}%` : ''}
                            </span>
                          </div>
                        )}
                        {inv.paymentType === 'pelunasan' && (
                          <div className="mt-1 flex justify-end">
                            <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Pelunasan
                            </span>
                          </div>
                        )}
                        {inv.subtotalProject && inv.paymentType && inv.paymentType !== 'full' && (
                          <div className="text-[9px] text-slate-400 font-semibold mt-0.5 whitespace-nowrap">
                            Total: Rp {new Intl.NumberFormat('id-ID').format(inv.subtotalProject)}
                          </div>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-2.5 sm:py-3 px-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          <select
                            value={inv.status}
                            onChange={(e) =>
                              updateInvoiceStatus(
                                inv.brandId,
                                inv.id,
                                e.target.value as BrandInvoice["status"],
                              )
                            }
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg border outline-none cursor-pointer text-center appearance-none transition-all ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : isInvOverdue || inv.status === 'Overdue'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : inv.status === 'Open Invoice'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <option value="Draft">DRAFT</option>
                            <option value="Open Invoice">TERKIRIM (OPEN)</option>
                            <option value="Paid">LUNAS (PAID)</option>
                            <option value="Overdue">JATUH TEMPO</option>
                            <option value="Cancelled">DIBATALKAN</option>
                          </select>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2.5 sm:py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Preview PDF */}
                          {onPreviewInvoice && (
                            <button
                              onClick={() => onPreviewInvoice(inv)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Preview PDF Resmi"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {/* Print / Download Options */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDownloadMenuOpenId((prev) => (prev === inv.id ? null : inv.id));
                              }}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                downloadMenuOpenId === inv.id
                                  ? 'text-emerald-700 bg-emerald-100 ring-2 ring-emerald-300'
                                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title="Pilihan Download PDF (Dengan / Tanpa Materai)"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {downloadMenuOpenId === inv.id && (
                              <div
                                ref={downloadMenuRef}
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute right-0 ${
                                  isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                } w-64 bg-white rounded-xl shadow-2xl border border-slate-200/90 py-1.5 z-50 text-left animate-fadeIn ring-1 ring-black/5`}
                              >
                                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Pilih Jenis Download
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setDownloadMenuOpenId(null)}
                                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Option 1: Tanpa Materai */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handlePrint(inv, inv.brandName, { withMeterai: false });
                                    setDownloadMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer group/item"
                                >
                                  <div className="p-1 rounded-lg bg-slate-100 text-slate-600 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-600 mt-0.5 shrink-0 transition-colors">
                                    <FileText className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-slate-800 group-hover/item:text-emerald-700 transition-colors">
                                      Download Tanpa Materai
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                                      Format standar: {inv.brandName} - {inv.invoiceNumber}
                                    </div>
                                  </div>
                                </button>

                                {/* Option 2: Dengan Materai */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handlePrint(inv, inv.brandName, { withMeterai: true });
                                    setDownloadMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-rose-50/70 flex items-start gap-2.5 transition-colors cursor-pointer group/item border-t border-slate-100/80"
                                >
                                  <div className="p-1 rounded-lg bg-rose-50 text-rose-600 group-hover/item:bg-rose-100 mt-0.5 shrink-0 transition-colors">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-rose-700 group-hover/item:text-rose-800 flex items-center gap-1.5 transition-colors">
                                      <span>Download Dengan Materai</span>
                                      <span className="text-[8px] font-black uppercase px-1 py-0.5 bg-rose-600 text-white rounded">
                                        Signed
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-rose-500/80 font-medium leading-tight mt-0.5 truncate" title="Format: signed_688779897203454_6aa11c4052202_...">
                                      Nama unik: signed_6887...pdf
                                    </div>
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Email copy */}
                          <button
                            onClick={() => handleShowEmailCopy(inv, inv.brandName, brand?.picEmail)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Format Email Tagihan"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => setInvoiceEditor({ ...inv, brandId: inv.brandId })}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Invoice"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setInvoiceToDelete({ brandId: inv.brandId, id: inv.id })}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          QUICK TUTUP BUKU SETTINGS MODAL
      ════════════════════════════════════════════ */}
      {isQuickSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Setting Tutup Buku Pendapatan</h3>
                  <p className="text-xs text-indigo-200/80">
                    Konfigurasi cut-off akhir bulan untuk omset nota
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickSettingsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Toggle Cutoff Mode */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="text-xs font-black text-slate-800">
                    Aktifkan Siklus Tutup Buku
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Kelompokkan omset bulanan berdasarkan tanggal cut-off.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTempUseClosingCutoff(!tempUseClosingCutoff)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    tempUseClosingCutoff ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Closing Day Stepper & Presets */}
              {tempUseClosingCutoff && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-700">
                      Tanggal Cut-off Setiap Bulan:
                    </label>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                      Tanggal {tempClosingDay}
                    </span>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTempClosingDay((prev) => Math.max(1, prev - 1))}
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-lg flex items-center justify-center cursor-pointer transition-colors"
                      title="Kurangi 1 hari"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={28}
                      value={tempClosingDay}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setTempClosingDay(Math.max(1, Math.min(28, val)));
                        }
                      }}
                      className="flex-1 text-center font-black text-lg text-slate-900 border border-slate-300 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setTempClosingDay((prev) => Math.min(28, prev + 1))}
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-lg flex items-center justify-center cursor-pointer transition-colors"
                      title="Tambah 1 hari"
                    >
                      +
                    </button>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">Preset:</span>
                    <button
                      type="button"
                      onClick={() => setTempClosingDay(25)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        tempClosingDay === 25
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Tgl 25 (Standar Liva)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempClosingDay(20)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        tempClosingDay === 20
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Tgl 20
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempClosingDay(28)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        tempClosingDay === 28
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Tgl 28 (Akhir Bulan)
                    </button>
                  </div>

                  {/* Simulation Box */}
                  <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5 space-y-1.5 mt-2">
                    <div className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      <span>Simulasi Siklus Berjalan:</span>
                    </div>
                    {(() => {
                      const simPeriod = getInvoiceClosingPeriod(
                        determineClosingMonthForDate(new Date(), tempClosingDay),
                        tempClosingDay
                      );
                      return (
                        <div className="text-xs text-indigo-900 space-y-1">
                          <div>
                            • <span className="font-bold">{simPeriod.label}:</span>{' '}
                            <span className="font-black text-indigo-700 underline decoration-indigo-300">
                              {simPeriod.startDate} s.d. {simPeriod.endDate}
                            </span>
                          </div>
                          <div className="text-[11px] text-indigo-700/90 leading-relaxed">
                            Invoice yang diterbitkan pada rentang di atas otomatis dihitung ke omset {simPeriod.monthName}.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsQuickSettingsOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-white cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveQuickSettings}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
