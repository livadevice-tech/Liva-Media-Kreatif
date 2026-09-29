import { ClientBrand } from "../../types";

export const buildNextInvoiceNumber = (
  clientBrands: ClientBrand[],
  currentDate = new Date(),
  formatStyle?: 'standard' | 'pdf',
) => {
  const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const romanMonth = romanMonths[currentMonth];
  const monthStr = String(currentMonth + 1).padStart(2, "0");

  let maxSeq = 0;
  let hasPdfFormat = false;

  clientBrands.forEach((brand) => {
    brand.invoices?.forEach((inv) => {
      if (!inv.invoiceNumber) return;

      const matchLiva = inv.invoiceNumber.match(/^INV\/LIVA\/\d{4}\/[IVXLCDM]+\/(\d+)/i);
      const matchLegacy = inv.invoiceNumber.match(/^INV\/(\d+)\//i);

      if (matchLiva) {
        hasPdfFormat = true;
      }

      const seqMatch = matchLiva ? matchLiva[1] : matchLegacy ? matchLegacy[1] : null;

      if (seqMatch) {
        const seq = parseInt(seqMatch, 10);
        const dateToCheck = inv.invoiceDate || inv.issueDate;
        if (dateToCheck && dateToCheck.startsWith(`${currentYear}-${monthStr}`)) {
          if (seq > maxSeq) {
            maxSeq = seq;
          }
        } else if (!dateToCheck && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
  });

  const seqStr = String(maxSeq + 1).padStart(3, "0");
  if (formatStyle === 'pdf' || (hasPdfFormat && formatStyle !== 'standard')) {
    return `INV/LIVA/${currentYear}/${romanMonth}/${seqStr}`;
  }
  return `INV/${seqStr}/LIVA/${romanMonth}/${currentYear}`;
};
