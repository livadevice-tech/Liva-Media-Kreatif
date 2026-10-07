import React, { useState } from 'react';
import { X, Printer, Download, MessageSquare, Copy, Check, ShieldCheck, CheckCircle2, Sliders } from 'lucide-react';
import { BrandInvoice, ClientBrand, LivaBankAccount, InvoiceCompanyProfile } from '../../types';
import { terbilang } from '../../shared/utils/terbilang';
import { formatDateUILocal as formatDateUI } from '../../shared/utils/date';
import { formatContractDate } from '../../shared/utils/dateFormatting';

interface InvoicePreviewModalProps {
  invoice: BrandInvoice;
  brand: ClientBrand;
  bankAccount?: LivaBankAccount;
  companyProfile?: Partial<InvoiceCompanyProfile>;
  onClose: () => void;
  onPrint: () => void;
  onUpdateSignatureSize?: (size: number) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  brand,
  bankAccount,
  companyProfile,
  onClose,
  onPrint,
  onUpdateSignatureSize,
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
  const signatureHeight = companyProfile?.signatureSize || 65;

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
  const formattedInvoiceDate = new Date(invoiceDateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const subtotalProject = invoice.subtotalProject || (invoice.sessionItems || []).reduce((sum, item) => sum + (item.cost * (item.qty || 1)), 0);
  const paymentType = invoice.paymentType || 'full';
  const dpPercent = invoice.dpPercent ?? 50;
  const dpAmount = invoice.dpAmount !== undefined ? invoice.dpAmount : Math.round(subtotalProject * (dpPercent / 100));

  let totalAmount = invoice.totalAmount;
  if (!totalAmount) {
    if (paymentType === 'dp') {
      totalAmount = dpAmount;
    } else if (paymentType === 'pelunasan') {
      totalAmount = Math.max(0, subtotalProject - dpAmount);
    } else {
      totalAmount = subtotalProject;
    }
  }

  const remainingAmount = Math.max(0, subtotalProject - (invoice.dpAmount ?? dpAmount));
  const amountTerbilang = terbilang(totalAmount);

  const effectiveLivePeriodStart = invoice.livePeriodStart || brand?.contractStartDate || "";
  const effectiveLivePeriodEnd = invoice.livePeriodEnd || brand?.contractEndDate || "";
  const livePeriod = effectiveLivePeriodStart && effectiveLivePeriodEnd
    ? `${formatContractDate(effectiveLivePeriodStart)} – ${formatContractDate(effectiveLivePeriodEnd)}`
    : "";

  // WhatsApp reminder message template
  const waMessage = `Dear ${recipientPic || recipientPt},
Here is the official invoice from PT. Liva Media Kreatif:

📄 *Invoice No:* ${invoice.invoiceNumber}
🏢 *Billed To:* ${recipientPt}
📅 *Invoice Date:* ${formattedInvoiceDate}
⏰ *Due Date:* ${formattedDueDate}
${livePeriod ? `📺 *Periode Live:* ${livePeriod}\n` : ''}${paymentType !== 'full' ? `📊 *Total Project:* Rp ${new Intl.NumberFormat('id-ID').format(subtotalProject)}\n` : ''}💰 *${paymentType === 'dp' ? `Tagihan DP (${dpPercent}%):` : paymentType === 'pelunasan' ? 'Final Payment (Pelunasan):' : 'Total Amount:'}* Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}
(${amountTerbilang})
${paymentType === 'dp' ? `📌 *Sisa Pembayaran:* Rp ${new Intl.NumberFormat('id-ID').format(remainingAmount)}\n` : ''}
🏦 *Payment Information (Bank Transfer):*
Bank: ${bankName}
Account Number: *${accountNo}*
Account Name: *${accountName}*

Please kindly confirm the proof of transfer once payment is completed. Thank you for your business and trust in Liva Media Kreatif. 🙏`;

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
            {/* Quick Signature Size Adjustment */}
            {companyProfile?.signatureUrl && onUpdateSignatureSize && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">Ukuran TTD:</span>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="5"
                  value={companyProfile.signatureSize || 65}
                  onChange={(e) => onUpdateSignatureSize(Number(e.target.value))}
                  className="w-20 accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                  title="Geser untuk mengatur tinggi tanda tangan di PDF"
                />
                <span className="font-mono font-bold text-indigo-700 text-[11px] min-w-[34px] text-right">
                  {companyProfile.signatureSize || 65}px
                </span>
              </div>
            )}

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
                      <span className="font-semibold text-slate-400 mr-1.5">Date:</span>
                      <span className="font-semibold text-slate-800">{formattedInvoiceDate}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400 mr-1.5">Due Date:</span>
                      <span className="font-semibold text-slate-800">{formattedDueDate}</span>
                    </div>
                    {livePeriod && (
                      <div className="pt-0.5">
                        <span className="font-semibold text-slate-400 mr-1.5">Periode Live:</span>
                        <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5">
                          {livePeriod}
                        </span>
                      </div>
                    )}
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
                    BILLED TO:
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
                    PAYMENT INFORMATION (BANK TRANSFER):
                  </div>
                  <div className="text-sm font-black text-slate-900 leading-snug">
                    {bankName}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">
                    Account No: <span className="font-mono font-black text-[#3b4898]">{accountNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Account Name: <span className="font-bold text-slate-800">{accountName}</span>
                  </div>
                </div>
              </div>

              {/* Table of Services / Items */}
              <div className="rounded-lg overflow-hidden border border-slate-200 mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0b132b] text-white text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3 text-center w-10">NO</th>
                      <th className="py-2.5 px-3">DESCRIPTION</th>
                      <th className="py-2.5 px-3 text-center w-28">QTY</th>
                      <th className="py-2.5 px-3 text-right w-36">UNIT PRICE</th>
                      <th className="py-2.5 px-3 text-right w-36">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {(invoice.sessionItems || []).map((item, idx) => {
                      const qty = item.qty || 1;
                      const rawUnit = item.unit || "Sesi";
                      const displayUnit = rawUnit.toLowerCase() === "sesi"
                        ? (qty > 1 ? "Sessions" : "Session")
                        : rawUnit.toLowerCase() === "bulan"
                        ? (qty > 1 ? "Months" : "Month")
                        : rawUnit;
                      const itemTotal = item.cost * qty;
                      return (
                        <tr key={item.sessionId || idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 text-center text-slate-500 font-semibold align-top">{idx + 1}</td>
                          <td className="py-3 px-3 font-bold text-slate-800 whitespace-pre-line leading-relaxed align-top">{item.description}</td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-600 align-top">
                            {qty} {displayUnit}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-700 whitespace-nowrap align-top">
                            Rp {new Intl.NumberFormat('id-ID').format(item.cost)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap align-top">
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
                    Terms & Conditions:
                  </div>
                  <div>1. Payment shall be made via bank transfer to the account listed above.</div>
                  <div>2. Payment is due according to the invoice Due Date.</div>
                  <div>3. Please confirm proof of payment via WhatsApp to {companyPhone}.</div>
                </div>

                {/* Right: Subtotal, Grand Total, Terbilang */}
                <div className="space-y-1.5 text-right font-sans">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-700">
                      Rp {new Intl.NumberFormat('id-ID').format(subtotalProject)}
                    </span>
                  </div>

                  {/* Solid dark line */}
                  <div className="w-full border-t-2 border-[#0b132b] my-1" />

                  <div className="flex justify-between items-center text-sm font-black text-slate-900 px-1">
                    <span>TOTAL PROJECT:</span>
                    <span className="text-base font-black text-slate-900">
                      Rp {new Intl.NumberFormat('id-ID').format(subtotalProject)}
                    </span>
                  </div>

                  {paymentType === 'dp' && (
                    <>
                      {/* Dashed purple line */}
                      <div className="w-full border-t border-dashed border-[#4f46e5] my-1.5" />
                      <div className="flex justify-between items-center text-sm font-black text-[#4f46e5] px-1">
                        <span>TAGIHAN DP ({dpPercent}%):</span>
                        <span className="text-base font-black">
                          Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-medium text-slate-500 px-1 pt-0.5">
                        <span>Sisa Pembayaran:</span>
                        <span className="text-slate-600 font-semibold">
                          Rp {new Intl.NumberFormat('id-ID').format(remainingAmount)}
                        </span>
                      </div>
                    </>
                  )}

                  {paymentType === 'pelunasan' && (
                    <>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1 pt-0.5">
                        <span>DP Telah Dibayar:</span>
                        <span className="text-[#059669] font-bold">
                          -Rp {new Intl.NumberFormat('id-ID').format(dpAmount)}
                        </span>
                      </div>
                      {/* Dashed green line */}
                      <div className="w-full border-t border-dashed border-[#059669] my-1.5" />
                      <div className="flex justify-between items-center text-sm font-black text-[#059669] px-1">
                        <span>FINAL PAYMENT (PELUNASAN):</span>
                        <span className="text-base font-black">
                          Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}
                        </span>
                      </div>
                    </>
                  )}

                  {paymentType === 'full' && (
                    <div className="w-full border-b border-slate-200 mb-1" />
                  )}

                  {/* Terbilang Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-left mt-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      AMOUNT IN WORDS :
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
                  Thank you for your business and trust in Liva.
                </div>

                {/* Authorized Signee */}
                <div className="text-center sm:text-right shrink-0">
                  <div className="text-xs text-slate-600 mb-1">
                    {signeeCity}, {formattedInvoiceDate}
                  </div>
                  <div className="text-xs font-bold text-slate-800 mb-2">
                    Sincerely, {companyName}
                  </div>

                  {/* Digital Stamp / Signature */}
                  <div className="flex items-center justify-end my-1" style={{ minHeight: `${signatureHeight}px` }}>
                    {companyProfile?.signatureUrl ? (
                      <img
                        src={companyProfile.signatureUrl}
                        alt="Signature"
                        style={{ height: `${signatureHeight}px`, maxHeight: `${signatureHeight}px`, maxWidth: '280px' }}
                        className="object-contain"
                      />
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
                This document is officially issued by {companyName} and is valid as an invoice and business agreement.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
