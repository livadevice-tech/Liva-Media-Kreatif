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

/**
 * Generates an official unique e-Meterai signed filename.
 * Pattern: signed_<15_digits>_<13_hex>_<4-4-4-4-4-4-3_hex>
 * Example: signed_688779897203454_6aa11c4052202_494a-1106-3e8a-d845-79ac-71df-285
 */
export function generateSignedInvoiceFileName(): string {
  // 15 numeric digits (13-digit Date.now() + 2 random digits)
  const part1 = `${Date.now()}${Math.floor(10 + Math.random() * 90)}`;

  const hexChars = "0123456789abcdef";
  const genHex = (len: number) => {
    let s = "";
    for (let i = 0; i < len; i++) {
      s += hexChars[Math.floor(Math.random() * 16)];
    }
    return s;
  };

  // 13 lowercase hex characters
  const part2 = genHex(13);

  // e-Meterai serial / UUID format: 4-4-4-4-4-4-3 hex
  const part3 = `${genHex(4)}-${genHex(4)}-${genHex(4)}-${genHex(4)}-${genHex(4)}-${genHex(4)}-${genHex(3)}`;

  return `signed_${part1}_${part2}_${part3}`;
}

