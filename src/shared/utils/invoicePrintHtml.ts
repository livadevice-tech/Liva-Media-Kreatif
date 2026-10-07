import { BrandInvoice, ClientBrand, LivaBankAccount, InvoiceCompanyProfile } from '../../types';
import { terbilang } from './terbilang';

export function generateInvoicePrintHtml(params: {
  invoice: BrandInvoice;
  brand?: ClientBrand;
  bankAccount?: LivaBankAccount;
  companyProfile?: Partial<InvoiceCompanyProfile>;
}): string {
  const { invoice, brand, bankAccount, companyProfile } = params;

  const companyName = companyProfile?.companyName || "PT. Liva Media Kreatif";
  const companyAddress = companyProfile?.address || "Villa Bukit Tirtayasa Blok G2 No.1, Kelurahaan Campang Raya, Kecamatan Sukabumi, Kota Bandar Lampung, Provinsi Lampung";
  const companyEmail = companyProfile?.email || "livamediakreatif@gmail.com";
  const companyPhone = companyProfile?.phone || "+62 821-7788-9900";
  const companyWebsite = companyProfile?.website || "https://project.livaagency.com";
  const signeeCity = companyProfile?.city || "Bandar Lampung";
  const signeeName = companyProfile?.directorName || "Mufthi Ali";
  const signeeTitle = companyProfile?.directorTitle || "Direktur Utama PT Liva Media Kreatif";

  const bankName = invoice.bankInfo?.bankName || bankAccount?.bankName || "Maybank Syariah";
  const accountNo = invoice.bankInfo?.accountNo || bankAccount?.accountNo || "2721002897";
  const accountName = invoice.bankInfo?.accountName || bankAccount?.accountName || "PT. Liva Media Kreatif";

  const recipientPt = invoice.ptName || brand?.companyName || brand?.name || "Client";
  const recipientPic = invoice.picName || brand?.picName || "";
  const recipientAddress = invoice.address || brand?.companyAddress || "-";
  const recipientPhone = invoice.picPhone || brand?.picPhone || "-";
  const recipientEmail = invoice.email || brand?.picEmail || "-";

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

  const logoHtml = companyProfile?.logoUrl
    ? `<img src="${companyProfile.logoUrl}" style="height: 48px; object-fit: contain; margin-bottom: 8px;" />`
    : `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #6366f1 0%, #9333ea 100%); display: flex; align-items: center; justify-content: center; color: white;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
        <div>
          <div style="font-size: 22px; font-weight: 900; line-height: 1; color: #0f172a; letter-spacing: -0.5px;">Liva</div>
          <div style="font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">specialized live streaming</div>
        </div>
      </div>
    `;

  const signatureHeight = companyProfile?.signatureSize || 65;
  const stampHtml = companyProfile?.signatureUrl
    ? `<img src="${companyProfile.signatureUrl}" style="height: ${signatureHeight}px; max-height: ${signatureHeight}px; max-width: 280px; object-fit: contain; margin: 4px 0;" />`
    : `
      <div style="display: inline-block; border: 2px dashed #f43f5e; border-radius: 8px; padding: 4px 14px; transform: rotate(-3deg); background: rgba(244, 63, 94, 0.05); margin: 6px 0;">
        <div style="font-size: 13px; font-weight: 900; color: #e11d48; line-height: 1; text-transform: uppercase; letter-spacing: 1px;">LIVA</div>
        <div style="font-size: 8px; font-weight: 800; color: #f43f5e; line-height: 1; margin-top: 2px;">PT. LIVA MEDIA KREATIF</div>
      </div>
    `;

  const cleanBrandName = (brand?.name || recipientPt || "Brand").replace(/[\/\\:*?"<>|]/g, '-').trim();
  const cleanInvoiceNo = (invoice.invoiceNumber || 'Invoice').replace(/[\/\\:*?"<>|]/g, '-').trim();
  const documentTitle = `${cleanBrandName} - ${cleanInvoiceNo}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${documentTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          @media print {
            @page {
              size: A4 portrait;
              margin: 0mm !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0 !important;
            padding: 12mm 15mm 12mm 15mm !important;
            color: #0f172a;
            background: #ffffff;
            font-size: 11px;
            line-height: 1.45;
          }
          .header-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .company-info {
            max-width: 380px;
          }
          .company-name {
            font-size: 13px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 2px;
          }
          .company-addr {
            font-size: 9.5px;
            color: #475569;
            line-height: 1.4;
          }
          .company-contact {
            font-size: 9.5px;
            color: #475569;
            margin-top: 3px;
          }
          .company-web {
            font-size: 9.5px;
            color: #4f46e5;
            font-weight: 600;
          }
          .invoice-title-block {
            text-align: right;
          }
          .invoice-main-title {
            font-size: 28px;
            font-weight: 900;
            color: #3b4898;
            letter-spacing: 0.5px;
            margin: 0 0 10px 0;
            line-height: 1;
          }
          .meta-table {
            font-size: 10.5px;
            text-align: right;
          }
          .meta-label {
            color: #64748b;
            font-weight: 600;
            padding-right: 8px;
          }
          .meta-val {
            font-weight: 700;
            color: #0f172a;
          }
          .divider {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 18px 0;
          }
          .two-col-info {
            display: flex;
            justify-content: space-between;
            gap: 25px;
            margin-bottom: 20px;
          }
          .info-box {
            flex: 1;
          }
          .info-header {
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748b;
            margin-bottom: 4px;
          }
          .info-title {
            font-size: 13px;
            font-weight: 800;
            color: #0f172a;
          }
          .info-sub {
            font-size: 11px;
            font-weight: 600;
            color: #334155;
            margin-top: 2px;
          }
          .info-text {
            font-size: 10px;
            color: #475569;
            line-height: 1.4;
            margin-top: 3px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .items-table th {
            background-color: #0b132b;
            color: #ffffff;
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 9px 12px;
            text-align: left;
          }
          .items-table th.center { text-align: center; }
          .items-table th.right { text-align: right; }
          .items-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 10.5px;
            color: #1e293b;
            vertical-align: top;
          }
          .items-table td.center { text-align: center; color: #64748b; font-weight: 600; vertical-align: top; }
          .items-table td.right { text-align: right; vertical-align: top; }
          .items-table td.desc { font-weight: 700; color: #0f172a; white-space: pre-line; line-height: 1.4; vertical-align: top; }
          .bottom-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 25px;
            margin-bottom: 24px;
          }
          .terms-card {
            flex: 1.1;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 14px;
            background-color: #f8fafc;
            font-size: 9.5px;
            color: #334155;
          }
          .terms-title {
            font-weight: 800;
            font-size: 10px;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .calc-block {
            flex: 0.9;
            text-align: right;
            font-family: inherit;
          }
          .subtotal-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            padding: 0 4px;
            margin-bottom: 5px;
          }
          .solid-line {
            border: none;
            border-top: 2px solid #0f172a;
            margin: 5px 0 6px 0;
          }
          .project-total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2px 4px;
            font-size: 12.5px;
            font-weight: 900;
            color: #0f172a;
          }
          .dp-paid-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            padding: 2px 4px;
          }
          .dp-paid-val {
            color: #059669;
            font-weight: 700;
          }
          .dashed-green-line {
            border: none;
            border-top: 1.5px dashed #059669;
            margin: 6px 0;
          }
          .final-payment-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            font-weight: 900;
            color: #059669;
            padding: 2px 4px;
          }
          .dashed-purple-line {
            border: none;
            border-top: 1.5px dashed #4f46e5;
            margin: 6px 0;
          }
          .dp-bill-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            font-weight: 900;
            color: #4f46e5;
            padding: 2px 4px;
          }
          .remaining-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            padding: 2px 4px;
          }
          .grand-total-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
            padding: 8px 4px;
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 8px;
          }
          .terbilang-box {
            background-color: #f1f5f9;
            border-left: 3px solid #4f46e5;
            border-radius: 4px;
            padding: 6px 10px;
            text-align: left;
            margin-top: 8px;
          }
          .terbilang-label {
            font-size: 8.5px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
          }
          .terbilang-val {
            font-size: 10.5px;
            font-style: italic;
            font-weight: 700;
            color: #1e1b4b;
            margin-top: 2px;
          }
          .sign-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 20px;
          }
          .sign-left {
            font-size: 10px;
            font-style: italic;
            color: #64748b;
            max-width: 280px;
          }
          .sign-right {
            text-align: right;
          }
          .sign-date { font-size: 10.5px; color: #475569; margin-bottom: 2px; }
          .sign-company { font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
          .sign-name { font-size: 12px; font-weight: 800; color: #0f172a; }
          .sign-title { font-size: 9.5px; color: #64748b; }
          .footer-disclaimer {
            text-align: center;
            font-size: 8.5px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 10px;
            margin-top: 25px;
          }
        </style>
      </head>
      <body>
        <!-- Header Grid -->
        <div class="header-grid">
          <div class="company-info">
            ${logoHtml}
            <div class="company-name">${companyName}</div>
            <div class="company-addr">${companyAddress}</div>
            <div class="company-contact">Email: ${companyEmail} | WA: ${companyPhone}</div>
            <div class="company-web">${companyWebsite}</div>
          </div>

          <div class="invoice-title-block">
            <h1 class="invoice-main-title">INVOICE</h1>
            <table class="meta-table" align="right">
              <tr>
                <td class="meta-label">No:</td>
                <td class="meta-val" style="font-family: monospace;">${invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td class="meta-label">Date:</td>
                <td class="meta-val">${formattedInvoiceDate}</td>
              </tr>
              <tr>
                <td class="meta-label">Due Date:</td>
                <td class="meta-val">${formattedDueDate}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Bill To & Bank Details -->
        <div class="two-col-info">
          <div class="info-box">
            <div class="info-header">BILLED TO:</div>
            <div class="info-title">${recipientPt}</div>
            ${recipientPic && recipientPic !== recipientPt ? `<div class="info-sub">${recipientPic}</div>` : ''}
            <div class="info-text">${recipientAddress}</div>
            <div class="info-text" style="color: #64748b;">
              ${recipientPhone} ${recipientEmail && recipientEmail !== '-' ? `• ${recipientEmail}` : ''}
            </div>
          </div>

          <div class="info-box">
            <div class="info-header">PAYMENT INFORMATION (BANK TRANSFER):</div>
            <div class="info-title">${bankName}</div>
            <div class="info-sub">
              Account No: <span style="color: #3b4898; font-weight: 900; font-family: monospace;">${accountNo}</span>
            </div>
            <div class="info-text">
              Account Name: <strong>${accountName}</strong>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th class="center" style="width: 40px;">NO</th>
              <th>DESCRIPTION</th>
              <th class="center" style="width: 100px;">QTY</th>
              <th class="right" style="width: 130px;">UNIT PRICE</th>
              <th class="right" style="width: 140px;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.sessionItems || []).map((item, idx) => {
              const qty = item.qty || 1;
              const rawUnit = item.unit || "Sesi";
              const displayUnit = rawUnit.toLowerCase() === "sesi"
                ? (qty > 1 ? "Sessions" : "Session")
                : rawUnit.toLowerCase() === "bulan"
                ? (qty > 1 ? "Months" : "Month")
                : rawUnit;
              const lineTotal = item.cost * qty;
              return `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td class="desc">${item.description}</td>
                  <td class="center">${qty} ${displayUnit}</td>
                  <td class="right">Rp ${new Intl.NumberFormat('id-ID').format(item.cost)}</td>
                  <td class="right" style="font-weight: 700;">Rp ${new Intl.NumberFormat('id-ID').format(lineTotal)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Bottom Grid: Terms & Totals -->
        <div class="bottom-grid">
          <div class="terms-card">
            <div class="terms-title">Terms & Conditions:</div>
            <div>1. Payment shall be made via bank transfer to the account listed above.</div>
            <div>2. Payment is due according to the invoice Due Date.</div>
            <div>3. Please confirm proof of payment via WhatsApp to ${companyPhone}.</div>
          </div>

          <div class="calc-block">
            <div class="subtotal-row">
              <span>Subtotal:</span>
              <span style="color: #334155; font-weight: 700;">Rp ${new Intl.NumberFormat('id-ID').format(subtotalProject)}</span>
            </div>

            <hr class="solid-line" />

            <div class="project-total-row">
              <span>TOTAL PROJECT:</span>
              <span>Rp ${new Intl.NumberFormat('id-ID').format(subtotalProject)}</span>
            </div>

            ${paymentType === 'dp' ? `
              <hr class="dashed-purple-line" />
              <div class="dp-bill-row">
                <span>TAGIHAN DP (${dpPercent}%):</span>
                <span>Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
              </div>
              <div class="remaining-row">
                <span>Sisa Pembayaran:</span>
                <span style="color: #475569; font-weight: 600;">Rp ${new Intl.NumberFormat('id-ID').format(remainingAmount)}</span>
              </div>
            ` : ''}

            ${paymentType === 'pelunasan' ? `
              <div class="dp-paid-row">
                <span>DP Telah Dibayar:</span>
                <span class="dp-paid-val">-Rp ${new Intl.NumberFormat('id-ID').format(dpAmount)}</span>
              </div>
              <hr class="dashed-green-line" />
              <div class="final-payment-row">
                <span>FINAL PAYMENT (PELUNASAN):</span>
                <span>Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
              </div>
            ` : ''}

            ${paymentType === 'full' ? `
              <div style="border-bottom: 1px solid #cbd5e1; margin: 4px 0 6px 0;"></div>
            ` : ''}

            <div class="terbilang-box">
              <div class="terbilang-label">AMOUNT IN WORDS :</div>
              <div class="terbilang-val">"${amountTerbilang}"</div>
            </div>
          </div>
        </div>

        <!-- Signatures Section -->
        <div class="sign-section">
          <div class="sign-left">
            Thank you for your business and trust in Liva.
          </div>

          <div class="sign-right">
            <div class="sign-date">${signeeCity}, ${formattedInvoiceDate}</div>
            <div class="sign-company">Sincerely, ${companyName}</div>
            <div>${stampHtml}</div>
            <div class="sign-name">${signeeName}</div>
            <div class="sign-title">${signeeTitle}</div>
          </div>
        </div>

        <div class="footer-disclaimer">
          This document is officially issued by ${companyName} and is valid as an invoice and business agreement.
        </div>
      </body>
    </html>
  `;
}
