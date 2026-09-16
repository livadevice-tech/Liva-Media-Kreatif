import React, { useState, useEffect } from 'react';
import {
  Printer,
  Receipt,
  FileCheck2,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { InvoiceDocumentData } from '../../types/app';
import { appApi } from '../../services/appApi';
import { formatRupiah, formatIndonesianDate, angkaKeTerbilang } from './InvoiceQuotationGenerator';

interface PublicInvoiceViewProps {
  token: string;
}

export const PublicInvoiceView: React.FC<PublicInvoiceViewProps> = ({ token }) => {
  const [docData, setDocData] = useState<InvoiceDocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    appApi.getSettings<InvoiceDocumentData>(`public_invoice_${token}`)
      .then((data) => {
        if (!isMounted) return;
        if (data && typeof data === 'object' && data.documentNumber) {
          setDocData(data);
          document.title = `${data.type === 'invoice' ? 'Invoice' : 'Quotation'} - ${data.documentNumber}`;
        } else {
          setError('Dokumen tagihan atau penawaran tidak ditemukan atau tautan telah kedaluwarsa.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Gagal mengambil data invoice:', err);
        setError('Gagal memuat dokumen. Silakan periksa koneksi internet Anda.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handlePrint = () => {
    if (!docData) return;
    const isInvoice = docData.type === 'invoice';
    const titleType = isInvoice ? 'INVOICE' : 'QUOTATION';
    const cleanClient = docData.clientCompany.trim() || docData.clientName.trim() || 'Client';
    const cleanNumber = docData.documentNumber.replace(/[\/\\]/g, '-');
    const printDocTitle = `${titleType} - ${cleanNumber} - ${cleanClient}`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${printDocTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 12mm 12mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              color: #1e293b;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-size: 11.5px;
              line-height: 1.5;
            }

            .invoice-wrapper {
              width: 100%;
              max-width: 190mm;
              margin: 0 auto;
            }

            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            .header-table td {
              vertical-align: top;
            }

            .brand-logo-img {
              max-height: 48px;
              max-width: 140px;
              object-contain: contain;
              margin-bottom: 6px;
            }
            .brand-fallback {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: -0.5px;
              line-height: 1.1;
            }
            .company-name {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
            }
            .company-details {
              font-size: 10px;
              color: #64748b;
              line-height: 1.4;
              margin-top: 3px;
              max-width: 280px;
            }

            .doc-title-badge {
              text-align: right;
            }
            .doc-title {
              font-size: 26px;
              font-weight: 800;
              letter-spacing: -0.5px;
              color: ${isInvoice ? '#4f46e5' : '#0284c7'};
              margin: 0;
              text-transform: uppercase;
            }
            .doc-meta {
              font-size: 10.5px;
              color: #475569;
              margin-top: 6px;
            }
            .doc-meta strong {
              color: #0f172a;
            }

            .parties-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
              background-color: #f8fafc;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .parties-table td {
              padding: 12px 16px;
              vertical-align: top;
              width: 50%;
            }
            .box-heading {
              font-size: 9.5px;
              font-weight: 800;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin-bottom: 6px;
            }
            .client-target {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
            }
            .client-sub {
              font-size: 11px;
              color: #475569;
              margin-top: 2px;
            }

            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th {
              background-color: #0f172a;
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              padding: 9px 12px;
              text-align: left;
            }
            .items-table th.text-right {
              text-align: right;
            }
            .items-table th.text-center {
              text-align: center;
            }
            .items-table td {
              padding: 9px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 11px;
              color: #1e293b;
            }
            .items-table tr:nth-child(even) {
              background-color: #f8fafc;
            }

            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .summary-table td {
              vertical-align: top;
            }
            .payment-box {
              width: 55%;
              padding-right: 20px;
            }
            .calc-box {
              width: 45%;
            }
            .calc-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              font-size: 11px;
              color: #475569;
            }
            .calc-row.total-row {
              border-top: 2px solid #0f172a;
              margin-top: 6px;
              padding-top: 8px;
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
            }

            .terbilang-box {
              background: #f1f5f9;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 10px;
              font-style: italic;
              color: #334155;
              margin-top: 8px;
              border-left: 3px solid #4f46e5;
            }

            .bank-card {
              border: 1px dashed #cbd5e1;
              border-radius: 6px;
              padding: 10px 14px;
              background-color: #fafaf9;
              font-size: 10.5px;
              line-height: 1.45;
              color: #334155;
            }
            .bank-title {
              font-weight: 700;
              color: #0f172a;
              font-size: 11px;
              margin-bottom: 3px;
            }

            .signature-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
              page-break-inside: avoid;
            }
            .signature-table td {
              vertical-align: bottom;
              width: 50%;
            }
            .sign-box {
              position: relative;
              min-height: 80px;
              display: flex;
              align-items: center;
            }
            .signature-img {
              max-height: 70px;
              max-width: 140px;
              object-contain: contain;
            }
            .stamp-badge {
              display: inline-block;
              border: 1.5px solid #2563eb;
              color: #2563eb;
              padding: 2px 10px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              transform: rotate(-6deg);
              opacity: 0.85;
              margin-right: 12px;
            }

            .footer-note {
              margin-top: 28px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
              font-size: 9px;
              color: #94a3b8;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <!-- Header -->
            <table class="header-table">
              <tr>
                <td>
                  ${docData.logoUrl ? `
                    <img src="${docData.logoUrl}" class="brand-logo-img" alt="Logo" />
                  ` : `
                    <div class="brand-fallback">${docData.brandName || 'Liva'}</div>
                  `}
                  <div class="company-name">${docData.companyName}</div>
                  <div class="company-details">
                    ${docData.companyAddress}<br/>
                    Email: ${docData.companyEmail} | WA: ${docData.companyPhone}<br/>
                    ${docData.companyWebsite}
                  </div>
                </td>
                <td class="doc-title-badge">
                  <h1 class="doc-title">${isInvoice ? 'INVOICE' : 'QUOTATION'}</h1>
                  <div class="doc-meta">
                    <strong>No:</strong> ${docData.documentNumber}<br/>
                    <strong>Tanggal:</strong> ${formatIndonesianDate(docData.date)}<br/>
                    <strong>${isInvoice ? 'Jatuh Tempo' : 'Berlaku Hingga'}:</strong> ${formatIndonesianDate(docData.dueDate)}
                  </div>
                </td>
              </tr>
            </table>

            <!-- Client & Reference -->
            <table class="parties-table">
              <tr>
                <td>
                  <div class="box-heading">Ditujukan Kepada (${isInvoice ? 'Bill To' : 'Quotation For'}):</div>
                  <div class="client-target">${docData.clientName}</div>
                  <div class="client-sub"><strong>${docData.clientCompany}</strong></div>
                  <div class="client-sub">${docData.clientAddress}</div>
                  <div class="client-sub">${docData.clientPhone} • ${docData.clientEmail}</div>
                </td>
                <td>
                  <div class="box-heading">Status & Ketentuan:</div>
                  <div class="client-sub">
                    <strong>Status Dokumen:</strong> 
                    <span style="text-transform: uppercase; font-weight: bold; color: ${docData.status === 'paid' ? '#16a34a' : '#4f46e5'}">
                      ${docData.status}
                    </span>
                  </div>
                  <div class="client-sub" style="margin-top: 4px;">
                    <strong>Mata Uang:</strong> ${docData.currency} (Rupiah Indonesia)
                  </div>
                  <div class="client-sub" style="margin-top: 4px;">
                    <strong>Diterbitkan Oleh:</strong> ${docData.brandName} Specialist Team
                  </div>
                </td>
              </tr>
            </table>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%;" class="text-center">No</th>
                  <th style="width: 50%;">Deskripsi Layanan / Item</th>
                  <th style="width: 12%;" class="text-center">Qty</th>
                  <th style="width: 15%;" class="text-right">Harga Satuan</th>
                  <th style="width: 18%;" class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${docData.items.map((item, idx) => `
                  <tr>
                    <td class="text-center" style="color: #64748b;">${idx + 1}</td>
                    <td>
                      <div style="font-weight: 600; color: #0f172a;">${item.description}</div>
                      ${item.discountPercent ? `<div style="font-size: 9.5px; color: #16a34a;">Diskon item: ${item.discountPercent}%</div>` : ''}
                    </td>
                    <td class="text-center">${item.quantity} ${item.unit}</td>
                    <td class="text-right">${formatRupiah(item.price)}</td>
                    <td class="text-right" style="font-weight: 600;">${formatRupiah(item.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Calculation & Payment Info -->
            <table class="summary-table">
              <tr>
                <td class="payment-box">
                  <div class="bank-card">
                    <div class="bank-title">Informasi Pembayaran:</div>
                    <strong>Bank:</strong> ${docData.bankName}<br/>
                    <strong>No. Rekening:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 11px;">${docData.bankAccountNumber}</span><br/>
                    <strong>Atas Nama:</strong> ${docData.bankAccountHolder}
                    
                    ${docData.paymentTermsNotes ? `
                      <div style="margin-top: 8px; font-size: 9.5px; color: #64748b; white-space: pre-line;">
                        <strong>Catatan Syarat & Ketentuan:</strong><br/>
                        ${docData.paymentTermsNotes}
                      </div>
                    ` : ''}
                  </div>
                </td>
                <td class="calc-box">
                  <div class="calc-row">
                    <span>Subtotal:</span>
                    <span style="font-weight: 600;">${formatRupiah(docData.subtotal)}</span>
                  </div>
                  ${docData.discountRate > 0 ? `
                    <div class="calc-row" style="color: #16a34a;">
                      <span>Diskon (${docData.discountRate}%):</span>
                      <span>-${formatRupiah((docData.subtotal * docData.discountRate) / 100)}</span>
                    </div>
                  ` : ''}
                  ${docData.taxRate > 0 ? `
                    <div class="calc-row">
                      <span>PPN (${docData.taxRate}%):</span>
                      <span>+${formatRupiah(((docData.subtotal - (docData.subtotal * docData.discountRate) / 100) * docData.taxRate) / 100)}</span>
                    </div>
                  ` : ''}
                  <div class="calc-row total-row">
                    <span>GRAND TOTAL:</span>
                    <span>${formatRupiah(docData.total)}</span>
                  </div>

                  <div class="terbilang-box">
                    <strong>Terbilang:</strong><br/>
                    "${docData.terbilang || angkaKeTerbilang(docData.total)}"
                  </div>
                </td>
              </tr>
            </table>

            <!-- Signatures Section -->
            <table class="signature-table">
              <tr>
                <td>
                  <div style="font-size: 10px; color: #64748b; margin-bottom: 60px;">
                    Diterima & Disetujui Oleh,<br/>
                    <strong>${docData.clientCompany || docData.clientName}</strong>
                  </div>
                  <div style="border-bottom: 1px solid #94a3b8; width: 160px; margin-bottom: 4px;"></div>
                  <div style="font-size: 11px; font-weight: 700;">( .................................................. )</div>
                </td>
                <td style="text-align: right;">
                  <div style="font-size: 10.5px; color: #475569; margin-bottom: 4px;">
                    ${docData.signerCity}, ${formatIndonesianDate(docData.date)}
                  </div>
                  <div style="font-size: 10.5px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
                    Hormat Kami, ${docData.companyName}
                  </div>

                  <div class="sign-box" style="justify-content: flex-end;">
                    ${docData.includeStamp ? `
                      <span class="stamp-badge">
                        ${docData.brandName || 'LIVA'} OFFICIAL
                      </span>
                    ` : ''}

                    <div style="transform: scale(${docData.signatureScale / 100}); transform-origin: right center;">
                      ${docData.signatureUrl ? `
                        <img src="${docData.signatureUrl}" class="signature-img" alt="TTD" />
                      ` : `
                        <div style="height: 50px; width: 120px; border-bottom: 1px dashed #cbd5e1; display: inline-block;"></div>
                      `}
                    </div>
                  </div>

                  <div style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin-top: 4px;">
                    ${docData.signerName}
                  </div>
                  <div style="font-size: 10px; color: #64748b;">
                    ${docData.signerPosition}
                  </div>
                </td>
              </tr>
            </table>

            <div class="footer-note">
              Dokumen ini diterbitkan secara resmi oleh ${docData.companyName} dan berlaku sah sebagai bukti tagihan / penawaran kerjasama.
            </div>
          </div>
        </body>
      </html>
    `);

    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-bounce">
          <Receipt className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold tracking-wide">Memuat Dokumen Resmi...</div>
        <p className="text-xs text-slate-400 mt-1">Harap tunggu sebentar, sedang mengambil data dari server</p>
      </div>
    );
  }

  if (error || !docData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700/80 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl text-white">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-white mb-2">Dokumen Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {error || 'Tautan yang Anda gunakan mungkin sudah tidak aktif atau salah ketik. Hubungi pihak penerbit untuk link terbaru.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  const isInvoice = docData.type === 'invoice';

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col items-center py-6 px-4 sm:px-6">
      {/* Top Banner Toolbar */}
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase">
                {isInvoice ? 'Invoice Resmi' : 'Penawaran Harga Resmi (Quotation)'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {docData.documentNumber}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Diterbitkan oleh {docData.companyName} untuk {docData.clientName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* Main Document Sheet Container (A4 Look) */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl border border-slate-200 p-6 sm:p-10 font-sans text-xs">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-200 pb-6 mb-6 gap-4">
          <div>
            {docData.logoUrl ? (
              <img src={docData.logoUrl} alt="Logo" className="max-h-12 max-w-[150px] object-contain mb-2" />
            ) : (
              <div className="text-2xl font-black text-indigo-600 tracking-tight mb-1">
                {docData.brandName || 'Liva'}
              </div>
            )}
            <div className="font-bold text-sm text-slate-900">{docData.companyName}</div>
            <div className="text-[11px] text-slate-500 leading-relaxed mt-1 max-w-sm">
              {docData.companyAddress}<br/>
              Email: {docData.companyEmail} | WA: {docData.companyPhone}<br/>
              {docData.companyWebsite}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-600 uppercase">
              {docData.type}
            </h1>
            <div className="text-xs text-slate-600 mt-2 space-y-1 font-mono">
              <div><strong>No:</strong> {docData.documentNumber}</div>
              <div><strong>Tanggal:</strong> {formatIndonesianDate(docData.date)}</div>
              <div><strong>{isInvoice ? 'Jatuh Tempo' : 'Berlaku Hingga'}:</strong> {formatIndonesianDate(docData.dueDate)}</div>
            </div>
          </div>
        </div>

        {/* Parties Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {isInvoice ? 'Ditagihkan Kepada (Bill To):' : 'Penawaran Untuk:'}
            </div>
            <div className="font-bold text-slate-900 text-sm">{docData.clientName}</div>
            <div className="font-semibold text-slate-700">{docData.clientCompany}</div>
            <div className="text-slate-600 text-xs mt-1">{docData.clientAddress}</div>
            <div className="text-slate-600 text-xs">{docData.clientPhone} • {docData.clientEmail}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Status & Informasi:
            </div>
            <div>Status Dokumen: <span className="font-bold uppercase text-indigo-600">{docData.status}</span></div>
            <div>Mata Uang: <strong>{docData.currency} (Rupiah)</strong></div>
            <div className="text-slate-500 text-xs mt-1">
              Dokumen resmi diterbitkan untuk keperluan administrasi dan pencatatan transaksi.
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                <th className="p-3 text-center w-8">#</th>
                <th className="p-3">Deskripsi Layanan / Item</th>
                <th className="p-3 text-center w-20">Qty</th>
                <th className="p-3 text-right w-28">Harga Satuan</th>
                <th className="p-3 text-right w-32">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {docData.items.map((item, i) => (
                <tr key={item.id} className={i % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                  <td className="p-3 text-center text-slate-400">{i + 1}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-900">{item.description}</span>
                  </td>
                  <td className="p-3 text-center">{item.quantity} {item.unit}</td>
                  <td className="p-3 text-right font-mono">{formatRupiah(item.price)}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">{formatRupiah(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment and Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mb-6">
          <div className="sm:col-span-7">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs leading-relaxed">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Instruksi Pembayaran Transfer:</span>
              </div>
              <div>Bank: <strong>{docData.bankName}</strong></div>
              <div>No. Rekening: <strong className="font-mono text-indigo-600">{docData.bankAccountNumber}</strong></div>
              <div>Atas Nama: <strong>{docData.bankAccountHolder}</strong></div>
              {docData.paymentTermsNotes && (
                <div className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-200 whitespace-pre-line">
                  {docData.paymentTermsNotes}
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{formatRupiah(docData.subtotal)}</span>
            </div>
            {docData.discountRate > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon ({docData.discountRate}%):</span>
                <span className="font-mono">-{formatRupiah((docData.subtotal * docData.discountRate) / 100)}</span>
              </div>
            )}
            {docData.taxRate > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>PPN ({docData.taxRate}%):</span>
                <span className="font-mono">+{formatRupiah(((docData.subtotal - (docData.subtotal * docData.discountRate) / 100) * docData.taxRate) / 100)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t-2 border-slate-900">
              <span>TOTAL:</span>
              <span className="font-mono text-indigo-600 text-base">{formatRupiah(docData.total)}</span>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg text-[10px] italic text-slate-700 leading-tight">
              "{docData.terbilang || angkaKeTerbilang(docData.total)}"
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="flex items-end justify-between pt-6 border-t border-slate-200 text-xs">
          <div>
            <div className="text-slate-400 mb-12">Disetujui & Diterima Oleh:</div>
            <div className="font-bold text-slate-900">( ........................................ )</div>
            <div className="text-slate-500 text-[10px]">{docData.clientCompany || docData.clientName}</div>
          </div>

          <div className="text-right">
            <div className="text-slate-500 mb-1">
              {docData.signerCity}, {formatIndonesianDate(docData.date)}
            </div>
            <div className="font-bold text-slate-900">
              Hormat Kami, {docData.companyName}
            </div>

            <div className="relative h-20 flex items-center justify-end my-1">
              {docData.includeStamp && (
                <div className="border-2 border-indigo-600 text-indigo-600 px-2.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase -rotate-6 mr-3">
                  {docData.brandName || 'LIVA'} OFFICIAL
                </div>
              )}
              <div style={{ transform: `scale(${docData.signatureScale / 100})`, transformOrigin: 'right center' }}>
                {docData.signatureUrl ? (
                  <img src={docData.signatureUrl} alt="TTD" className="max-h-16 max-w-[130px] object-contain" />
                ) : (
                  <div className="w-24 border-b border-dashed border-slate-300 h-8"></div>
                )}
              </div>
            </div>

            <div className="font-extrabold text-slate-900">{docData.signerName}</div>
            <div className="text-slate-500 text-[11px]">{docData.signerPosition}</div>
          </div>
        </div>

      </div>
    </div>
  );
};
