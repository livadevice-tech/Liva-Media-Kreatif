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
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  X,
  Plus,
  MessageSquare
} from 'lucide-react';
import { InvoiceDocumentData, InvoiceDocStatus } from '../../types/app';
import { formatRupiah, formatIndonesianDate } from './InvoiceQuotationGenerator';

interface InvoiceHistoryViewProps {
  invoices: InvoiceDocumentData[];
  onUpdateStatus: (id: string, newStatus: InvoiceDocStatus) => void;
  onEditInvoice: (invoice: InvoiceDocumentData) => void;
  onDeleteInvoice: (id: string) => void;
  onPrintInvoice: (invoice: InvoiceDocumentData) => void;
  onOpenPublicLink?: (token?: string) => void;
  onCreateNew?: () => void;
}

type EmailTemplateType = 'new_invoice' | 'payment_reminder' | 'payment_received' | 'quotation_offer';

export const InvoiceHistoryView: React.FC<InvoiceHistoryViewProps> = ({
  invoices,
  onUpdateStatus,
  onEditInvoice,
  onDeleteInvoice,
  onPrintInvoice,
  onOpenPublicLink,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Email Generator State
  const [selectedInvoiceForEmail, setSelectedInvoiceForEmail] = useState<InvoiceDocumentData | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplateType>('new_invoice');
  const [copiedEmail, setCopiedEmail] = useState(false);

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
    
    let amountToPay = inv.total;
    let paymentDesc = 'Total Pembayaran';
    if (inv.paymentTermType === 'dp') {
      amountToPay = inv.dpAmount || Math.round(inv.total * 0.5);
      paymentDesc = `DP (${inv.dpPercent || 50}%)`;
    } else if (inv.paymentTermType === 'final') {
      amountToPay = inv.finalAmount || Math.max(0, inv.total - (inv.paidDpAmount || 0));
      paymentDesc = 'Pelunasan Final';
    }

    const amountFormatted = formatRupiah(amountToPay);
    const totalProjectFormatted = formatRupiah(inv.total);

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
      subject = `[INVOICE] ${docNum} - ${inv.clientCompany || inv.clientName} | ${companyName}`;
      body = `Halo ${clientName},

Berikut kami lampirkan dokumen Invoice resmi nomor ${docNum} untuk tagihan kerjasama dengan rincian sebagai berikut:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 RINCIAN DOKUMEN:
• No. Dokumen     : ${docNum}
• Tanggal Terbit  : ${dateFormatted}
• Jatuh Tempo     : ${dueDateFormatted}
• Keterangan      : ${paymentDesc}
• Nominal Tagihan : ${amountFormatted} ${inv.paymentTermType !== 'full' ? `(dari Total Project: ${totalProjectFormatted})` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 REKENING PEMBAYARAN:
${bankDetailsText}
${publicUrl ? `\n🌐 LINK ONLINE:\n${publicUrl}\n` : ''}
Mohon konfirmasikan bukti transfer balasan ke email ini atau WhatsApp Finance (${inv.companyPhone || '+62 821-7788-9900'}) setelah transfer dilakukan.

Terima kasih atas kerjasamanya.

Salam,
${companyName}`;

    } else if (template === 'payment_reminder') {
      subject = `[PENGINGAT TEMPO] Invoice ${docNum} - ${inv.clientCompany || inv.clientName}`;
      body = `Yth. ${clientName},

Pengingat ramah untuk Invoice nomor ${docNum} yang jatuh tempo pada tanggal ${dueDateFormatted}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 DETAIL:
• Nomor Invoice   : ${docNum}
• Jatuh Tempo     : ${dueDateFormatted}
• Nominal Tagihan : ${amountFormatted} (${paymentDesc})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pembayaran dapat ditransfer ke:
${bankDetailsText}
${publicUrl ? `\nDokumen online: ${publicUrl}\n` : ''}
Jika sudah melakukan transfer, silakan abaikan pesan ini dan kirimkan bukti pembayarannya.

Terima kasih.

Salam,
${companyName}`;

    } else if (template === 'payment_received') {
      subject = `[LUNAS] Konfirmasi Penerimaan Pembayaran Invoice ${docNum}`;
      body = `Halo ${clientName},

Terima kasih, pembayaran untuk Invoice ${docNum} sebesar ${amountFormatted} telah kami terima dengan baik.

Status dokumen telah diperbarui menjadi: [LUNAS / PAID].
${publicUrl ? `\nCek invoice online: ${publicUrl}\n` : ''}
Terima kasih banyak atas kerjasamanya.

Salam hangat,
${companyName}`;

    } else if (template === 'quotation_offer') {
      subject = `[PENAWARAN] Quotation ${docNum} - ${inv.clientCompany || inv.clientName} | ${companyName}`;
      body = `Halo ${clientName},

Berikut kami sampaikan proposal penawaran harga resmi (Quotation) nomor ${docNum}:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETAIL PENAWARAN:
• No. Dokumen     : ${docNum}
• Tanggal         : ${dateFormatted}
• Berlaku Hingga  : ${dueDateFormatted}
• Total Investasi : ${totalProjectFormatted}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${publicUrl ? `\n🌐 LINK PROPOSAL ONLINE:\n${publicUrl}\n` : ''}
Rincian item layanan tertera lengkap pada dokumen. Apabila ada pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.

Salam,
${inv.signerName || 'Tim Liva'}
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
    <div className="space-y-4">
      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor dokumen atau klien..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Tipe */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white outline-none cursor-pointer"
          >
            <option value="all">Semua Tipe</option>
            <option value="invoice">Invoice</option>
            <option value="quotation">Quotation</option>
          </select>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white outline-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="sent">Terkirim</option>
            <option value="paid">Lunas</option>
            <option value="draft">Draft</option>
            <option value="overdue">Jatuh Tempo</option>
            <option value="accepted">Disetujui</option>
            <option value="cancelled">Batal</option>
          </select>

          {onCreateNew && (
            <button
              type="button"
              onClick={onCreateNew}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* TABLE DATA */}
      {filteredInvoices.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="text-xs font-bold text-slate-700">
            {invoices.length === 0 ? 'Belum ada invoice yang tersimpan' : 'Tidak ada dokumen yang sesuai filter'}
          </div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            {invoices.length === 0 
              ? 'Invoice yang dibuat, dicetak, atau dibagikan akan otomatis tercatat di sini.' 
              : 'Silakan ubah filter atau kata kunci pencarian.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold text-[10.5px] uppercase tracking-wider">
                  <th className="py-3 px-4">No. Dokumen</th>
                  <th className="py-3 px-4">Klien / Brand</th>
                  <th className="py-3 px-4">Tanggal & Jatuh Tempo</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const docId = inv.id || inv.documentNumber;
                  const isInvoice = inv.type === 'invoice';

                  let billAmount = inv.total;
                  let termLabel = 'Full';
                  if (inv.paymentTermType === 'dp') {
                    billAmount = inv.dpAmount || Math.round(inv.total * 0.5);
                    termLabel = `DP ${inv.dpPercent || 50}%`;
                  } else if (inv.paymentTermType === 'final') {
                    billAmount = inv.finalAmount || Math.max(0, inv.total - (inv.paidDpAmount || 0));
                    termLabel = 'Pelunasan';
                  }

                  return (
                    <tr key={docId} className="hover:bg-slate-50/70 transition-colors">
                      {/* NOMOR & TIPE */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
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
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Link online</span>
                          </div>
                        )}
                      </td>

                      {/* KLIEN */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {inv.clientCompany || inv.clientName}
                        </div>
                        {inv.clientCompany && inv.clientName && (
                          <div className="text-[11px] text-slate-500">
                            PIC: {inv.clientName}
                          </div>
                        )}
                      </td>

                      {/* TANGGAL */}
                      <td className="py-3 px-4 align-top">
                        <div className="text-slate-700">
                          {formatIndonesianDate(inv.date)}
                        </div>
                        <div className="text-[10.5px] text-slate-400 mt-0.5">
                          Tempo: {formatIndonesianDate(inv.dueDate)}
                        </div>
                      </td>

                      {/* NOMINAL */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-bold text-slate-900">
                          {formatRupiah(billAmount)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {termLabel} {inv.paymentTermType !== 'full' ? `(Tot: ${formatRupiah(inv.total)})` : ''}
                        </div>
                      </td>

                      {/* STATUS DROPDOWN */}
                      <td className="py-3 px-4 align-top">
                        <select
                          value={inv.status}
                          onChange={(e) => onUpdateStatus(docId, e.target.value as InvoiceDocStatus)}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200 bg-white hover:border-slate-300 focus:border-indigo-500 outline-none cursor-pointer"
                        >
                          <option value="sent">📤 Terkirim</option>
                          <option value="paid">✅ Lunas</option>
                          <option value="draft">⏳ Draft</option>
                          <option value="overdue">⚠️ Jatuh Tempo</option>
                          <option value="accepted">🤝 Disetujui</option>
                          <option value="cancelled">❌ Batal</option>
                        </select>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-4 align-top text-center">
                        <div className="inline-flex items-center gap-1">
                          {/* EDIT ULANG */}
                          <button
                            type="button"
                            onClick={() => onEditInvoice(inv)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10.5px] rounded-lg border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer"
                            title="Edit Ulang"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {/* BODY EMAIL */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoiceForEmail(inv);
                              setEmailTemplate(inv.type === 'quotation' ? 'quotation_offer' : (inv.status === 'paid' ? 'payment_received' : 'new_invoice'));
                            }}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Template Email / WA"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* CETAK */}
                          <button
                            type="button"
                            onClick={() => onPrintInvoice(inv)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Cetak PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* LINK ONLINE */}
                          {inv.publicToken && onOpenPublicLink && (
                            <button
                              type="button"
                              onClick={() => onOpenPublicLink(inv.publicToken)}
                              className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                              title="Buka Link Online"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* HAPUS */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Hapus invoice ${inv.documentNumber}?`)) {
                                onDeleteInvoice(docId);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
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

      {/* MODAL GENERATOR BODY EMAIL */}
      {selectedInvoiceForEmail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white">
                  Format Email: {selectedInvoiceForEmail.documentNumber}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoiceForEmail(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {/* Template Tabs */}
              <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setEmailTemplate('new_invoice')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    emailTemplate === 'new_invoice' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tagihan Baru
                </button>
                <button
                  type="button"
                  onClick={() => setEmailTemplate('payment_reminder')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    emailTemplate === 'payment_reminder' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengingat
                </button>
                <button
                  type="button"
                  onClick={() => setEmailTemplate('payment_received')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    emailTemplate === 'payment_received' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lunas
                </button>
                <button
                  type="button"
                  onClick={() => setEmailTemplate('quotation_offer')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    emailTemplate === 'quotation_offer' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Penawaran
                </button>
              </div>

              {(() => {
                const { subject, body } = generateEmailContent(selectedInvoiceForEmail, emailTemplate);
                return (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-500">Subjek</label>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(subject);
                            alert('Subjek disalin');
                          }}
                          className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                        >
                          Salin
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={subject}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-500">Isi Pesan</label>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(subject, body)}
                          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedEmail ? 'Tersalin' : 'Salin Semua'}</span>
                        </button>
                      </div>
                      <textarea
                        readOnly
                        rows={10}
                        value={body}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono leading-relaxed outline-none focus:bg-white focus:border-indigo-500 select-all"
                      />
                    </div>

                    {selectedInvoiceForEmail.clientPhone && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <span className="text-emerald-800 text-[11px] font-medium">
                          Kirim ke WhatsApp: <strong>{selectedInvoiceForEmail.clientPhone}</strong>
                        </span>
                        <a
                          href={`https://wa.me/${selectedInvoiceForEmail.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(body)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          <span>Buka WA</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForEmail(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const { subject, body } = generateEmailContent(selectedInvoiceForEmail, emailTemplate);
                  handleCopyEmail(subject, body);
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
