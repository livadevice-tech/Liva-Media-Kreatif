import { ClientBrand } from "../../types";

export const buildNextInvoiceNumber = (
  clientBrands: ClientBrand[],
  currentDate = new Date(),
) => {
  const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const romanMonth = romanMonths[currentMonth];
  const monthStr = String(currentMonth + 1).padStart(2, "0");

  let maxSeq = 0;
  clientBrands.forEach(brand => {
    brand.invoices?.forEach(inv => {
      if (!inv.invoiceNumber || !inv.invoiceNumber.startsWith("INV/")) return;

      const match = inv.invoiceNumber.match(/^INV\/(\d+)\//);
      if (!match) return;

      if (inv.issueDate && inv.issueDate.startsWith(`${currentYear}-${monthStr}`)) {
        const seq = parseInt(match[1]);
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
  });

  const seqStr = String(maxSeq + 1).padStart(3, "0");
  return `INV/${seqStr}/LIVA/${romanMonth}/${currentYear}`;
};
