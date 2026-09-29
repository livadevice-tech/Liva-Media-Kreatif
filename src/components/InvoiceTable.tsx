import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { ClientBrand, BrandInvoice } from '../types';

interface InvoiceTableProps {
  allInvoices: (BrandInvoice & { brandId: string; brandName: string })[];
  upcomingBillings: ClientBrand[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterMonth: string;
  setFilterMonth: (m: string) => void;
  updateInvoiceStatus: (brandId: string, invId: string, newStatus: BrandInvoice["status"]) => void;
  setInvoiceEditor: (inv: BrandInvoice & { brandId: string }) => void;
  setInvoiceToDelete: (data: { brandId: string; id: string }) => void;
  handlePrint: (inv: BrandInvoice, brandName: string) => void;
  handleShowEmailCopy: (inv: BrandInvoice, brandName: string, picEmail?: string) => void;
  onPreviewInvoice?: (inv: BrandInvoice & { brandId: string; brandName: string }) => void;
  clientBrands: ClientBrand[];
  formatDateUI: (d?: string) => string;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  allInvoices,
  upcomingBillings,
  searchQuery,
  setSearchQuery,
  filterMonth,
  setFilterMonth,
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Draft' | 'Open Invoice' | 'Paid' | 'Overdue'>('ALL');

  const todayStr = new Date().toISOString().substring(0, 10);

  // Helper to check if an invoice is overdue
  const isOverdue = (inv: BrandInvoice) => {
    if (inv.status === 'Paid') return false;
    return inv.dueDate ? inv.dueDate < todayStr : false;
  };

  // Counts for tabs
  const counts = useMemo(() => {
    let draft = 0;
    let open = 0;
    let paid = 0;
    let overdue = 0;

    allInvoices.forEach((inv) => {
      if (inv.status === 'Paid') {
        paid++;
      } else if (isOverdue(inv) || inv.status === 'Overdue') {
        overdue++;
      } else if (inv.status === 'Open Invoice') {
        open++;
      } else {
        draft++;
      }
    });

    return { total: allInvoices.length, draft, open, paid, overdue };
  }, [allInvoices, todayStr]);

  // Financial summary
  const summary = useMemo(() => {
    const totalAmount = allInvoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
    const paidAmount = allInvoices
      .filter((i) => i.status === 'Paid')
      .reduce((acc, i) => acc + (i.totalAmount || 0), 0);
    const pendingAmount = allInvoices
      .filter((i) => i.status !== 'Paid')
      .reduce((acc, i) => acc + (i.totalAmount || 0), 0);
    const overdueAmount = allInvoices
      .filter((i) => i.status !== 'Paid' && (isOverdue(i) || i.status === 'Overdue'))
      .reduce((acc, i) => acc + (i.totalAmount || 0), 0);

    return { totalAmount, paidAmount, pendingAmount, overdueAmount };
  }, [allInvoices, todayStr]);

  // Filtered list
  const filteredInvoices = useMemo(() => {
    return allInvoices
      .filter((inv) => {
        // Status filter
        if (statusFilter === 'Draft') {
          if (inv.status !== 'Draft') return false;
        } else if (statusFilter === 'Open Invoice') {
          if (inv.status !== 'Open Invoice' || isOverdue(inv)) return false;
        } else if (statusFilter === 'Paid') {
          if (inv.status !== 'Paid') return false;
        } else if (statusFilter === 'Overdue') {
          if (inv.status === 'Paid' || (!isOverdue(inv) && inv.status !== 'Overdue')) return false;
        }

        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
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
    <div className="space-y-6 animate-fadeIn">
      {/* Upcoming Billings Banner */}
      {upcomingBillings.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 text-amber-600 p-3 rounded-xl shrink-0 mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-900">
                Jadwal Penagihan Rutin Tiba ({upcomingBillings.length} Klien)
              </h3>
              <p className="text-xs text-amber-700 font-medium mt-0.5 mb-3">
                Terdapat brand klien yang telah memasuki jadwal siklus penagihan invoice bulan ini.
              </p>
              <div className="flex flex-wrap gap-2">
                {upcomingBillings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xs"
                  >
                    <span className="font-bold text-slate-800 text-xs">
                      {b.companyName || b.name}
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                      Tgl {b.invoiceDate || '29'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Metrics Cards (4 Columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Total Tagihan
            </div>
            <div className="text-2xl font-black text-slate-900 leading-tight">
              {counts.total}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-xs font-bold text-slate-500 truncate">
            Rp {new Intl.NumberFormat('id-ID').format(summary.totalAmount)}
          </div>
        </div>

        {/* Paid / Lunas */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/30">
          <div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sudah Dibayar (Lunas)
            </div>
            <div className="text-2xl font-black text-emerald-700 leading-tight">
              {counts.paid}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-100 text-xs font-black text-emerald-800 truncate">
            Rp {new Intl.NumberFormat('id-ID').format(summary.paidAmount)}
          </div>
        </div>

        {/* Open / Terkirim */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white to-blue-50/30">
          <div>
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Menunggu Pembayaran
            </div>
            <div className="text-2xl font-black text-blue-700 leading-tight">
              {counts.open}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-blue-100 text-xs font-black text-blue-800 truncate">
            Rp {new Intl.NumberFormat('id-ID').format(summary.pendingAmount)}
          </div>
        </div>

        {/* Overdue / Jatuh Tempo */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/30">
          <div>
            <div className="text-[10px] font-black text-rose-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Jatuh Tempo (Overdue)
            </div>
            <div className="text-2xl font-black text-rose-700 leading-tight">
              {counts.overdue}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-100 text-xs font-black text-rose-800 truncate">
            Rp {new Intl.NumberFormat('id-ID').format(summary.overdueAmount)}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Status Filter Tabs */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Semua ({counts.total})
            </button>
            <button
              onClick={() => setStatusFilter('Draft')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'Draft'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Draft ({counts.draft})
            </button>
            <button
              onClick={() => setStatusFilter('Open Invoice')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'Open Invoice'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              Terkirim ({counts.open})
            </button>
            <button
              onClick={() => setStatusFilter('Paid')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'Paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              Lunas ({counts.paid})
            </button>
            <button
              onClick={() => setStatusFilter('Overdue')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'Overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              Jatuh Tempo ({counts.overdue})
            </button>
          </div>

          {/* Period and Search */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-indigo-400 font-bold text-slate-700 cursor-pointer"
            />
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari no invoice / brand / PT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-indigo-400 font-medium text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        {filteredInvoices.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-bold text-slate-700 text-sm">Tidak ada invoice pada filter ini.</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Coba ganti filter status atau klik tombol "Buat Invoice Baru" untuk membuat tagihan baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">
                    <button
                      onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                      className="flex items-center gap-1.5 hover:text-slate-800 cursor-pointer transition-colors outline-none"
                    >
                      <span>No. Invoice</span>
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortOrder === 'asc' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="py-3.5 px-5">Klien / Bill To</th>
                  <th className="py-3.5 px-5">Tanggal & Jatuh Tempo</th>
                  <th className="py-3.5 px-5 text-right">Nominal Tagihan</th>
                  <th className="py-3.5 px-5 text-center">Status Invoice</th>
                  <th className="py-3.5 px-5 text-center">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInvoices.map((inv) => {
                  const brand = clientBrands.find((b) => b.id === inv.brandId);
                  const isInvOverdue = isOverdue(inv);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Invoice Number */}
                      <td className="py-4 px-5">
                        <div className="font-mono font-black text-indigo-700 text-xs">
                          {inv.invoiceNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {inv.sessionItems?.length || 0} Item Layanan
                        </div>
                      </td>

                      {/* Client / Bill To */}
                      <td className="py-4 px-5">
                        <div className="font-black text-slate-900 text-xs leading-snug">
                          {inv.ptName || brand?.companyName || brand?.name}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate max-w-[220px]">
                          {inv.picName || brand?.picName || '-'}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-5">
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
                      <td className="py-4 px-5 text-right">
                        <div className="font-black text-slate-900 text-xs whitespace-nowrap">
                          Rp {new Intl.NumberFormat('id-ID').format(inv.totalAmount || 0)}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-5 text-center">
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
                      <td className="py-4 px-5 text-center">
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

                          {/* Print / Download */}
                          <button
                            onClick={() => handlePrint(inv, inv.brandName)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Cetak / Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>

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
    </div>
  );
};
