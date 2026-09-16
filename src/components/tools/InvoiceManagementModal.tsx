import React, { useState } from 'react';
import {
  FileText,
  Mail,
  Edit3,
  Trash2,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Search,
  Filter,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  Sparkles,
  X,
  CreditCard,
  User,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { InvoiceDocumentData, InvoiceDocStatus } from '../../types/app';
import { formatRupiah, formatIndonesianDate } from './InvoiceQuotationGenerator';

interface InvoiceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceDocumentData[];
  onUpdateStatus: (id: string, newStatus: InvoiceDocStatus) => void;
  onEditInvoice: (invoice: InvoiceDocumentData) => void;
  onDeleteInvoice: (id: string) => void;
  onPrintInvoice: (invoice: InvoiceDocumentData) => void;
  onOpenPublicLink?: (token?: string) => void;
}

type EmailTemplateType = 'new_invoice' | 'payment_reminder' | 'payment_received' | 'quotation_offer';

export const InvoiceManagementModal: React.FC<InvoiceManagementModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onUpdateStatus,
  onEditInvoice,
  onDeleteInvoice,
  onPrintInvoice,
  onOpenPublicLink,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Email Generator State
  const [selectedInvoiceForEmail, setSelectedInvoiceForEmail] = useState<InvoiceDocumentData | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplateType>('new_invoice');
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      (inv.documentNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.clientCompany || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Generate Email Content helper
  const generateEmailContent = (inv: InvoiceDocumentData, template: EmailTemplateType) => {
    const clientName = inv.clientName || 'Bapak/Ibu';
    const companyName = inv.companyName || 'PT Liva Media Kreatif';
    const docNum = inv.documentNumber;
    const dueDateFormatted = formatIndonesianDate(inv.dueDate);
    const dateFormatted = formatIndonesianDate(inv.date);
    
    // Hitung tagihan yang harus dibayar
    let amountToPay = inv.total;
    let paymentDesc = 'Total Pembayaran';
    if (inv.paymentTermType === 'dp') {
      amountToPay = inv.dpAmount || Math.round(inv.total * 0.5);
      paymentDesc = `Uang Muka (DP ${inv.dpPercent || 50}%)`;
    } else if (inv.paymentTermType === 'final') {
      amountToPay = inv.finalAmount || Math.max(0, inv.total - (inv.paidDpAmount || 0));
      paymentDesc = 'Pelunasan Akhir (Final Payment)';
    }

    const amountFormatted = formatRupiah(amountToPay);
    const totalProjectFormatted = formatRupiah(inv.total);

    // Filter bank accounts that are selected
    const activeBanks = (inv.bankAccounts && inv.bankAccounts.length > 0)
      ? inv.bankAccounts.filter(b => b.isSelected !== false)
      : [{
          bankName: inv.bankName || 'BCA',
          accountNumber: inv.bankAccountNumber || '8905 1234 56',
          accountHolder: inv.bankAccountHolder || companyName
        }];

    const bankDetailsText = activeBanks.map(b => `• ${b.bankName}: ${b.accountNumber} a/n ${b.accountHolder}`).join('\n');
    const publicUrl = inv.publicToken 
      ? `${window.location.origin}/?inv_token=${inv.publicToken}` 
      : '';

    let subject = '';
    let body = '';

    if (template === 'new_invoice') {
      subject = `[INVOICE] Tagihan ${docNum} - ${inv.clientCompany || inv.clientName} | ${companyName}`;
      body = `Halo ${clientName},

Semoga pesan ini menjumpai Anda dalam keadaan sehat dan sukses.

Bersama pesan ini, kami lampirkan dokumen Invoice resmi nomor ${docNum} untuk tagihan kerjasama dengan rincian sebagai berikut:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 RINCIAN INVOICE
• No. Dokumen     : ${docNum}
• Tanggal Terbit  : ${dateFormatted}
• Jatuh Tempo     : ${dueDateFormatted}
• Jenis Tagihan   : ${paymentDesc}
• Nominal Tagihan : ${amountFormatted} ${inv.paymentTermType !== 'full' ? `(dari Total Project: ${totalProjectFormatted})` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 METODE PEMBAYARAN:
Pembayaran dapat ditransfer ke rekening resmi kami:
${bankDetailsText}
${publicUrl ? `\n🌐 LIHAT & CETAK ONLINE:\nAnda dapat melihat serta mengunduh berkas invoice melalui tautan berikut:\n${publicUrl}\n` : ''}
Mohon kesediaannya mengirimkan bukti transfer balasan ke email ini atau melalui WhatsApp Finance (${inv.companyPhone || '+62 821-7788-9900'}) setelah pembayaran selesai dilakukan.

Atas kerjasama dan kepercayaan yang baik, kami ucapkan terima kasih.

Salam hangat,
Finance Team
${companyName}
${inv.companyWebsite || 'https://project.livaagency.com'}`;

    } else if (template === 'payment_reminder') {
      subject = `[PENGINGAT JATUH TEMPO] Invoice ${docNum} - ${inv.clientCompany || inv.clientName}`;
      body = `Yth. ${clientName},

Kami ingin menginformasikan pengingat ramah terkait Invoice nomor ${docNum} yang akan/telah jatuh tempo pada tanggal ${dueDateFormatted}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 DETAIL PEMBAYARAN:
• Nomor Invoice   : ${docNum}
• Jatuh Tempo     : ${dueDateFormatted}
• Nominal Tagihan : ${amountFormatted} (${paymentDesc})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pembayaran dapat disalurkan melalui transfer ke rekening berikut:
${bankDetailsText}
${publicUrl ? `\nDokumen online: ${publicUrl}\n` : ''}
Apabila pembayaran telah dilakukan sebelum pesan ini diterima, silakan abaikan pengingat ini dan konfirmasikan bukti transfer kepada kami.

Terima kasih atas perhatian dan kerjasamanya.

Hormat kami,
${companyName}`;

    } else if (template === 'payment_received') {
      subject = `[LUNAS] Konfirmasi Penerimaan Pembayaran Invoice ${docNum} - ${companyName}`;
      body = `Halo ${clientName},

Terima kasih banyak! Pembayaran untuk Invoice nomor ${docNum} sebesar ${amountFormatted} telah kami terima dengan baik.

Status dokumen Anda kini telah diperbarui menjadi: [LUNAS / PAID].
${publicUrl ? `\nAnda dapat mengecek status terkini invoice secara online di tautan:\n${publicUrl}\n` : ''}
Kami sangat mengapresiasi kemitraan dan kerjasama yang terjalin dengan baik ini. Semoga proyek ini berjalan lancar dan memberikan hasil yang maksimal.

Salam sukses,
${companyName}`;

    } else if (template === 'quotation_offer') {
      subject = `[PENAWARAN KERJASAMA] Quotation ${docNum} - ${inv.clientCompany || inv.clientName} | ${companyName}`;
      body = `Halo ${clientName},

Terima kasih atas diskusi dan ketertarikan Anda untuk berkolaborasi bersama ${companyName}.

Sesuai kebutuhan yang telah dibahas, berikut kami sampaikan proposal penawaran harga resmi (Quotation) dengan nomor ${docNum}:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETAIL PENAWARAN:
• No. Penawaran   : ${docNum}
• Tanggal         : ${dateFormatted}
• Berlaku Hingga  : ${dueDateFormatted}
• Estimasi Investasi : ${totalProjectFormatted}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${publicUrl ? `\n🌐 LIHAT PROPOSAL & RINCIAN ONLINE:\n${publicUrl}\n` : ''}
Rincian scope pekerjaan dan item layanan tertera lengkap pada dokumen penawaran. Jika ada bagian yang perlu disesuaikan atau didiskusikan lebih lanjut, jangan ragu untuk menghubungi kami.

Kami berharap dapat segera bekerjasama dan berkontribusi untuk pertumbuhan bisnis Anda.

Salam hangat,
${inv.signerName || 'Tim Liva'}
${inv.signerPosition || 'Business Development'}
${companyName}`;
    }

    return { subject, body };
  };

  const handleCopyEmail = (subject: string, body: string) => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Manajemen Dokumen Invoice & Quotation
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                  {invoices.length} Tersimpan
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kelola status pembayaran, edit ulang dokumen yang pernah dibuat, atau buat template body email resmi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS BAR: SEARCH & FILTERS */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nomor invoice, nama klien, perusahaan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Jenis Dokumen */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">Semua Tipe (Invoice & Quo)</option>
              <option value="invoice">Khusus Invoice</option>
              <option value="quotation">Khusus Quotation</option>
            </select>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Terkirim</option>
              <option value="paid">Lunas (Paid)</option>
              <option value="overdue">Jatuh Tempo</option>
              <option value="accepted">Disetujui</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* MODAL BODY: INVOICE TABLE */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {invoices.length === 0 ? 'Belum Ada Riwayat Invoice' : 'Tidak Ada Dokumen yang Cocok'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {invoices.length === 0 
                  ? 'Setiap kali Anda mencetak PDF, membuat link publik, atau menekan tombol "Simpan Dokumen", berkas invoice akan otomatis tersimpan di sini.'
                  : 'Coba ubah kata kunci pencarian atau bersihkan filter status.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Dokumen</th>
                      <th className="py-3 px-4">Klien / Perusahaan</th>
                      <th className="py-3 px-4">Tanggal & Jatuh Tempo</th>
                      <th className="py-3 px-4">Nominal Tagihan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvoices.map((inv) => {
                      const docId = inv.id || inv.documentNumber;
                      const isInvoice = inv.type === 'invoice';
                      
                      // Kalkulasi nominal yang relevan
                      let billAmount = inv.total;
                      let termBadge = 'Full';
                      if (inv.paymentTermType === 'dp') {
                        billAmount = inv.dpAmount || Math.round(inv.total * 0.5);
                        termBadge = `DP ${inv.dpPercent || 50}%`;
                      } else if (inv.paymentTermType === 'final') {
                        billAmount = inv.finalAmount || Math.max(0, inv.total - (inv.paidDpAmount || 0));
                        termBadge = 'Final';
                      }

                      return (
                        <tr key={docId} className="hover:bg-slate-50/80 transition-colors group">
                          {/* DOKUMEN NUMBER & TYPE */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                isInvoice ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                              }`}>
                                {inv.type}
                              </span>
                              <span className="font-mono font-bold text-slate-900">
                                {inv.documentNumber}
                              </span>
                            </div>
                            {inv.publicToken && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>Link online aktif</span>
                              </div>
                            )}
                          </td>

                          {/* KLIEN */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{inv.clientCompany || inv.clientName}</span>
                            </div>
                            {inv.clientCompany && inv.clientName && (
                              <div className="text-[11px] text-slate-500 ml-5">
                                PIC: {inv.clientName}
                              </div>
                            )}
                            {inv.clientPhone && (
                              <div className="text-[10px] text-slate-400 ml-5">
                                {inv.clientPhone}
                              </div>
                            )}
                          </td>

                          {/* TANGGAL & DUE DATE */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="text-slate-700 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formatIndonesianDate(inv.date)}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>Tempo: {formatIndonesianDate(inv.dueDate)}</span>
                            </div>
                          </td>

                          {/* NOMINAL & TIPE TAGIHAN */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-bold text-slate-900">
                              {formatRupiah(billAmount)}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9.5px] font-semibold">
                                {termBadge}
                              </span>
                              {inv.paymentTermType !== 'full' && (
                                <span className="text-[10px] text-slate-400">
                                  dari {formatRupiah(inv.total)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* STATUS DROPDOWN */}
                          <td className="py-3.5 px-4 align-top">
                            <select
                              value={inv.status}
                              onChange={(e) => onUpdateStatus(docId, e.target.value as InvoiceDocStatus)}
                              className="px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:border-slate-300 focus:border-indigo-500 outline-none cursor-pointer shadow-2xs"
                            >
                              <option value="draft">⏳ Draft</option>
                              <option value="sent">📤 Terkirim (Sent)</option>
                              <option value="paid">✅ Lunas (Paid)</option>
                              <option value="overdue">⚠️ Jatuh Tempo</option>
                              <option value="accepted">🤝 Disetujui</option>
                              <option value="cancelled">❌ Dibatalkan</option>
                            </select>
                          </td>

                          {/* ACTIONS */}
                          <td className="py-3.5 px-4 align-top text-center">
                            <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                              {/* EDIT ULANG */}
                              <button
                                type="button"
                                onClick={() => {
                                  onEditInvoice(inv);
                                  onClose();
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                                title="Muat invoice ini ke form generator untuk diedit ulang"
                              >
                                <Edit3 className="w-3 h-3 text-indigo-600" />
                                <span>Edit Ulang</span>
                              </button>

                              {/* GENERATE EMAIL BODY */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInvoiceForEmail(inv);
                                  setEmailTemplate(inv.type === 'quotation' ? 'quotation_offer' : (inv.status === 'paid' ? 'payment_received' : 'new_invoice'));
                                }}
                                className="p-1.5 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                title="Generate Body Email & WhatsApp Siap Kirim"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>

                              {/* CETAK / DOWNLOAD PDF */}
                              <button
                                type="button"
                                onClick={() => onPrintInvoice(inv)}
                                className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                title="Cetak / Unduh PDF Dokumen Ini"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* BUKA LINK PUBLIK */}
                              {inv.publicToken && onOpenPublicLink && (
                                <button
                                  type="button"
                                  onClick={() => onOpenPublicLink(inv.publicToken)}
                                  className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                                  title="Buka Tautan Online Klien"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* HAPUS */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Hapus invoice ${inv.documentNumber} dari riwayat?`)) {
                                    onDeleteInvoice(docId);
                                  }
                                }}
                                className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Dokumen dari Riwayat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Data invoice tersimpan otomatis dan dapat diekspor, diupdate statusnya, serta diedit kapan pun.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* SUB-MODAL: GENERATOR BODY EMAIL */}
      {selectedInvoiceForEmail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Generator Body Email & Pesan Resmi
                  </h4>
                  <p className="text-[11px] text-blue-100">
                    Dokumen: {selectedInvoiceForEmail.documentNumber} ({selectedInvoiceForEmail.clientCompany || selectedInvoiceForEmail.clientName})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoiceForEmail(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Pilihan Template Email */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">
                  Pilih Template Pesan / Email
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailTemplate('new_invoice')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      emailTemplate === 'new_invoice'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div>Tagihan Baru</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">Kirim invoice awal</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailTemplate('payment_reminder')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      emailTemplate === 'payment_reminder'
                        ? 'border-amber-600 bg-amber-50/70 text-amber-800 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div>Pengingat Tempo</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">Follow up jatuh tempo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailTemplate('payment_received')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      emailTemplate === 'payment_received'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div>Konfirmasi Lunas</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">Bukti terima uang</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailTemplate('quotation_offer')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      emailTemplate === 'quotation_offer'
                        ? 'border-sky-600 bg-sky-50/70 text-sky-800 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div>Penawaran (Quo)</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">Pengantar proposal</div>
                  </button>
                </div>
              </div>

              {/* Text Area Preview */}
              {(() => {
                const { subject, body } = generateEmailContent(selectedInvoiceForEmail, emailTemplate);
                return (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600">
                          Subjek Email
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(subject);
                            alert('Subjek berhasil disalin!');
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Salin Subjek</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={subject}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600">
                          Isi Body Email / Pesan WhatsApp
                        </label>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(subject, body)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          {copiedEmail ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Tersalin ke Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Lengkap (Subjek & Body)</span>
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        readOnly
                        rows={12}
                        value={body}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 font-mono leading-relaxed outline-none focus:bg-white focus:border-indigo-500 select-all"
                      />
                    </div>

                    {/* WhatsApp Quick Link */}
                    {selectedInvoiceForEmail.clientPhone && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-800 text-xs">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          <span>
                            Kirim langsung via WhatsApp ke <strong>{selectedInvoiceForEmail.clientPhone}</strong>
                          </span>
                        </div>
                        <a
                          href={`https://wa.me/${selectedInvoiceForEmail.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(body)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
                        >
                          <span>Buka WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForEmail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const { subject, body } = generateEmailContent(selectedInvoiceForEmail, emailTemplate);
                  handleCopyEmail(subject, body);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Pesan Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
