import { formatDateUILocal as formatDateUI } from "./date";

type InvoiceEmailSessionItem = {
  description?: string;
  qty?: number;
};

export type InvoiceQuotationInput = {
  brandName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  sessionItems?: InvoiceEmailSessionItem[];
  picName?: string;
  recipientName?: string;
  ptName?: string;
  email?: string;
  picEmail?: string;
};

export type InvoiceQuotationEmail = {
  to: string;
  subject: string;
  body: string;
};

export const getPlatformNameFromDescription = (description: string) => {
  const normalized = description.toLowerCase();

  if (normalized.includes("tiktok")) return "TikTok";
  if (normalized.includes("shopee")) return "Shopee";

  return "[NAMA PLATFORM]";
};

export const buildInvoiceQuotationEmail = (
  invoice: InvoiceQuotationInput,
): InvoiceQuotationEmail => {
  const totalShift = invoice.sessionItems?.reduce((sum, item) => {
    return sum + (Number(item.qty) || 0);
  }, 0) ?? 0;
  const totalAmountStr = new Intl.NumberFormat("id-ID").format(invoice.totalAmount);
  const description = invoice.sessionItems?.[0]?.description?.toLowerCase() || "";
  const platformName = getPlatformNameFromDescription(description);

  const emailSubject = `Quotation for ${platformName} Livestream - ${invoice.brandName}`;
  const emailBody = `Dear ${invoice.picName || invoice.recipientName || "[NAMA PIC]"},
We hope this email finds you well.

Please find attached our quotation for the ${platformName} Livestream Full Package program. Below is a brief summary of the proposed services:

${platformName} Livestream Full Package – 6 hours/day

Period: ${formatDateUI(invoice.issueDate)} - ${formatDateUI(invoice.dueDate)}
Monthly Fee: Qty: ${totalShift} shift
Total Amount: Rp${totalAmountStr}

We believe this livestream program will help maximize ${invoice.ptName || invoice.brandName} performance, visibility, and engagement through a consistent and strategic live commerce approach.

Should you require any further information, clarification, or adjustments, please do not hesitate to contact us. We look forward to the opportunity to collaborate with ${invoice.ptName || invoice.brandName}

Thank you for your time and consideration.

Best regards,
Mufhti Ali
PT. Liva Media Kreatif
+62 811-3016-161`;

  return {
    to: invoice.email || invoice.picEmail || "",
    subject: emailSubject,
    body: emailBody,
  };
};
