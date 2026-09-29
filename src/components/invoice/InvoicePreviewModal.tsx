import React, { useState } from 'react';
import { X, Printer, Download, MessageSquare, Copy, Check, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BrandInvoice, ClientBrand, LivaBankAccount, InvoiceCompanyProfile } from '../../types';
import { terbilang } from '../../shared/utils/terbilang';
import { formatDateUILocal as formatDateUI } from '../../shared/utils/date';

interface InvoicePreviewModalProps {
  invoice: BrandInvoice;
  brand: ClientBrand;
  bankAccount?: LivaBankAccount;
  companyProfile?: Partial<InvoiceCompanyProfile>;
  onClose: () => void;
  onPrint: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  brand,
  bankAccount,
  companyProfile,
  onClose,
  onPrint,
}) => {
  const [waCopied, setWaCopied] = useState(false);

  // Fallbacks matching user's official PDF
  const companyName = companyProfile?.companyName || "PT. Liva Media Kreatif";
  const companyAddress = companyProfile?.address || "Villa Bukit Tirtayasa Blok G2 No.1, Kelurahaan Campang Raya, Kecamatan Sukabumi, Kota Bandar Lampung, Provinsi Lampung";
  const companyEmail = companyProfile?.email || "livamediakreatif@gmail.com";
  const companyPhone = companyProfile?.phone || "+62 821-7788-9900";
  const companyWebsite = companyProfile?.website || "https://project.livaagency.com";
  const signeeCity = companyProfile?.city || "Bandar Lampung";
  const signeeName = companyProfile?.directorName || "Mufthi Ali";
  const signeeTitle = companyProfile?.directorTitle || "Direktur Utama PT Liva Media Kreatif";

  // Bank Info
  const bankName = invoice.bankInfo?.bankName || bankAccount?.bankName || "Maybank Syariah";
  const accountNo = invoice.bankInfo?.accountNo || bankAccount?.accountNo || "2721002897";
  const accountName = invoice.bankInfo?.accountName || bankAccount?.accountName || "PT. Liva Media Kreatif";

  // Recipient / Bill to
  const recipientPt = invoice.ptName || brand.companyName || brand.name;
  const recipientPic = invoice.picName || brand.picName || brand.name;
  const recipientAddress = invoice.address || brand.companyAddress || "Alamat penagihan belum diatur";
  const recipientPhone = invoice.picPhone || brand.picPhone || "-";
  const recipientEmail = invoice.email || brand.picEmail || "-";

  // Dates
  const invoiceDateStr = invoice.invoiceDate || invoice.issueDate;
  const formattedInvoiceDate = new Date(invoiceDateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalAmount = invoice.totalAmount || (invoice.sessionItems || []).reduce((sum, item) => sum + (item.cost * (item.qty || 1)), 0);
  const amountTerbilang = terbilang(totalAmount);

  // WhatsApp reminder message template
  const waMessage = `Halo ${recipientPic},
Berikut kami lampirkan tagihan resmi dari PT. Liva Media Kreatif:

📄 *No Invoice:* ${invoice.invoiceNumber}
🏢 *Ditujukan:* ${recipientPt}
📅 *Tanggal Tagihan:* ${formattedInvoiceDate}
⏰ *Jatuh Tempo:* ${formattedDueDate}
💰 *Total Tagihan:* Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}
(${amountTerbilang})

🏦 *Informasi Pembayaran (Transfer Bank):*
Bank: ${bankName}
No. Rekening: *${accountNo}*
Atas Nama: *${accountName}*

Mohon konfirmasi bukti transfer jika pembayaran telah dilakukan. Terima kasih atas kerjasama dan kepercayaan Anda kepada Liva Media Kreatif. 🙏`;

  const handleCopyWA = () => {
    navigator.clipboard.writeText(waMessage);
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-100 rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Top Action Bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Preview Dokumen Resmi
            </span>
            <span className="font-mono text-xs font-bold text-slate-700">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWA}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                waCopied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {waCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Pesan WA Tersalin</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Salin Pesan WA</span>
                </>
              )}
            </button>

            <button
              onClick={onPrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak / Unduh PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container Preview (100% Matching Uploaded PDF) */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 flex justify-center bg-slate-200/70 custom-scrollbar">
          <div
            className="bg-white text-slate-800 shadow-xl rounded-md w-full max-w-[760px] p-8 sm:p-10 font-sans flex flex-col justify-between border border-slate-300 relative text-left"
            style={{ minHeight: '1020px' }}
          >
            {/* Header section */}
            <div>
              <div className="flex justify-between items-start gap-4">
                {/* Left: Company Brand & Address */}
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    {/* Official Liva Logo */}
                    {companyProfile?.logoUrl ? (
                      <img src={companyProfile.logoUrl} alt="Logo" className="h-10 object-contain" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366f1] via-[#7c3aed] to-[#9333ea] flex items-center justify-center shadow-xs">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                        <div>
                          <div className="text-xl font-black tracking-tight text-slate-900 leading-none">
                            Liva
                          </div>
                          <div className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
                            Specialized Live Streaming
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xs font-black text-slate-900 mb-0.5">
                    {companyName}
                  </h3>
                  <p className="text-[10px] text-slate-500 max-w-sm leading-relaxed">
                    {companyAddress}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Email: <span className="text-slate-700">{companyEmail}</span> | WA: <span className="text-slate-700">{companyPhone}</span>
                  </p>
                  <p className="text-[10px] text-indigo-600 font-medium">
                    {companyWebsite}
                  </p>
                </div>

                {/* Right: Big INVOICE Header & Metadata */}
                <div className="text-right shrink-0">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-[#3b4898] leading-none mb-3">
                    INVOICE
                  </h1>
                  <div className="text-[11px] space-y-1 text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-400 mr-1.5">No:</span>
                      <span className="font-bold text-slate-900 font-mono">{invoice.invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400 mr-1.5">Tanggal:</span>
                      <span className="font-semibold text-slate-800">{formattedInvoiceDate}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400 mr-1.5">Jatuh Tempo:</span>
                      <span className="font-semibold text-slate-800">{formattedDueDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-slate-200 my-6" />

              {/* Two Column Bill To & Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Left: Bill To */}
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    DITUJUKAN KEPADA (BILL TO):
                  </div>
                  <div className="text-sm font-black text-slate-900 leading-snug">
                    {recipientPt}
                  </div>
                  {recipientPic && recipientPic !== recipientPt && (
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">
                      {recipientPic}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {recipientAddress}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {recipientPhone} {recipientEmail && recipientEmail !== '-' && `• ${recipientEmail}`}
                  </div>
                </div>

                {/* Right: Bank Info */}
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    INFORMASI PEMBAYARAN (TRANSFER BANK):
                  </div>
                  <div className="text-sm font-black text-slate-900 leading-snug">
                    {bankName}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">
                    No. Rek: <span className="font-mono font-black text-[#3b4898]">{accountNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    A/N: <span className="font-bold text-slate-800">{accountName}</span>
                  </div>
                </div>
              </div>

              {/* Table of Services / Items */}
              <div className="rounded-lg overflow-hidden border border-slate-200 mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0b132b] text-white text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3 text-center w-10">NO</th>
                      <th className="py-2.5 px-3">DESKRIPSI LAYANAN / ITEM</th>
                      <th className="py-2.5 px-3 text-center w-28">QTY</th>
                      <th className="py-2.5 px-3 text-right w-36">HARGA SATUAN</th>
                      <th className="py-2.5 px-3 text-right w-36">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {(invoice.sessionItems || []).map((item, idx) => {
                      const qty = item.qty || 1;
                      const unit = item.unit || "Sesi";
                      const itemTotal = item.cost * qty;
                      return (
                        <tr key={item.sessionId || idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                          <td className="py-3 px-3 font-bold text-slate-800">{item.description}</td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-600">
                            {qty} {unit}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                            Rp {new Intl.NumberFormat('id-ID').format(item.cost)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                            Rp {new Intl.NumberFormat('id-ID').format(itemTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Calculation & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mb-8">
                {/* Left: Notes & Terms */}
                <div className="border border-slate-200 rounded-xl bg-slate-50/60 p-4 text-[11px] text-slate-600 space-y-1.5">
                  <div className="font-black text-slate-800 text-xs mb-1">
                    Catatan & Syarat Ketentuan:
                  </div>
                  <div>1. Pembayaran dilakukan via transfer bank sesuai rekening di atas.</div>
                  <div>2. Pembayaran dilakukan sesuai Due Date invoice.</div>
                  <div>3. Harap konfirmasi bukti transfer via WhatsApp ke {companyPhone}.</div>
                </div>

                {/* Right: Subtotal, Grand Total, Terbilang */}
                <div className="space-y-2.5 text-right">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600 px-2">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-800">
                      Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-slate-900 border-y-2 border-slate-900 py-2 px-2">
                    <span className="tracking-wide">GRAND TOTAL:</span>
                    <span className="text-base text-slate-900">
                      Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}
                    </span>
                  </div>

                  {/* Terbilang Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Terbilang :
                    </div>
                    <div className="text-xs font-bold text-indigo-900 italic">
                      "{amountTerbilang}"
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Signatures & Footer */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-8">
                <div className="text-xs text-slate-500 italic max-w-xs">
                  Terima kasih atas kerjasama dan kepercayaan Anda kepada Liva.
                </div>

                {/* Authorized Signee */}
                <div className="text-center sm:text-right shrink-0">
                  <div className="text-xs text-slate-600 mb-1">
                    {signeeCity}, {formattedInvoiceDate}
                  </div>
                  <div className="text-xs font-bold text-slate-800 mb-2">
                    Hormat Kami, {companyName}
                  </div>

                  {/* Digital Stamp / Signature */}
                  <div className="h-16 flex items-center justify-end my-1">
                    {companyProfile?.signatureUrl ? (
                      <img src={companyProfile.signatureUrl} alt="Signature" className="max-h-16 object-contain" />
                    ) : (
                      <div className="relative inline-block border-2 border-dashed border-rose-500/70 rounded-lg px-4 py-1 text-center rotate-[-3deg] bg-rose-50/40 shadow-xs">
                        <div className="text-[12px] font-black text-rose-600 uppercase tracking-wider leading-none">
                          LIVA
                        </div>
                        <div className="text-[8px] font-bold text-rose-500 leading-none mt-0.5">
                          PT. LIVA MEDIA KREATIF
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-black text-slate-900">
                    {signeeName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {signeeTitle}
                  </div>
                </div>
              </div>

              {/* Bottom Official Legal Fine Print */}
              <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-3">
                Dokumen ini diterbitkan secara resmi oleh {companyName} dan berlaku sah sebagai bukti tagihan / penawaran kerjasama.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
