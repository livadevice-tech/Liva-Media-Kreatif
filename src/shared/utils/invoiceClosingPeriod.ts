/**
 * src/shared/utils/invoiceClosingPeriod.ts
 * ========================================
 * Utilitas untuk mengelola siklus Tutup Buku Pendapatan (Revenue Cut-off).
 * Berdasarkan tanggal tutup buku (default tanggal 25 akhir bulan):
 * Contoh untuk closingDay = 25:
 * - Tutup Buku Oktober 2026 : 26 September 2026 s.d. 25 Oktober 2026
 * - Tutup Buku November 2026: 26 Oktober 2026 s.d. 25 November 2026
 * - Tutup Buku Desember 2026: 26 November 2026 s.d. 25 Desember 2026
 */

export interface InvoiceClosingPeriod {
  closingMonth: string; // "YYYY-MM", misal "2026-10"
  closingDay: number; // default 25
  startDate: string; // "YYYY-MM-DD", misal "2026-09-26"
  endDate: string; // "YYYY-MM-DD", misal "2026-10-25"
  monthName: string; // "Oktober 2026"
  label: string; // "Tutup Buku Oktober 2026"
  shortLabel: string; // "Okt 2026"
  dateRangeLabel: string; // "26 Sep - 25 Okt 2026"
  isCurrent: boolean;
}

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTH_SHORTS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Mendapatkan detail rentang tanggal tutup buku untuk bulan closing tertentu (YYYY-MM).
 */
export function getInvoiceClosingPeriod(
  closingMonth: string,
  closingDay: number = 25
): InvoiceClosingPeriod {
  const safeClosingDay = Math.max(1, Math.min(28, closingDay || 25));

  const [yearStr, monthStr] = closingMonth.split("-");
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || new Date().getMonth() + 1; // 1-12

  // Tanggal mulai: 1 hari setelah closingDay di bulan sebelumnya
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const startDay = safeClosingDay + 1;

  const startDate = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(
    startDay
  ).padStart(2, "0")}`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
    safeClosingDay
  ).padStart(2, "0")}`;

  const monthName = `${MONTH_NAMES_ID[month - 1]} ${year}`;
  const shortLabel = `${MONTH_SHORTS_ID[month - 1]} ${year}`;
  const label = `Tutup Buku ${monthName}`;
  const dateRangeLabel = `${startDay} ${MONTH_SHORTS_ID[prevMonth - 1]} - ${safeClosingDay} ${MONTH_SHORTS_ID[month - 1]} ${year}`;

  const todayStr = new Date().toISOString().substring(0, 10);
  const isCurrent = todayStr >= startDate && todayStr <= endDate;

  return {
    closingMonth,
    closingDay: safeClosingDay,
    startDate,
    endDate,
    monthName,
    label,
    shortLabel,
    dateRangeLabel,
    isCurrent,
  };
}

/**
 * Mengecek apakah suatu tanggal masuk ke dalam rentang periode tutup buku bulan tertentu.
 */
export function isDateInInvoiceClosingPeriod(
  dateStr: string | undefined | null,
  closingMonth: string,
  closingDay: number = 25
): boolean {
  if (!dateStr) return false;
  const d = dateStr.slice(0, 10);
  const period = getInvoiceClosingPeriod(closingMonth, closingDay);
  return d >= period.startDate && d <= period.endDate;
}

/**
 * Menentukan bulan tutup buku aktif untuk tanggal tertentu.
 * Jika tanggal > closingDay, maka sudah masuk ke periode tutup buku bulan berikutnya.
 */
export function determineClosingMonthForDate(
  dateObj: Date = new Date(),
  closingDay: number = 25
): string {
  const safeClosingDay = Math.max(1, Math.min(28, closingDay || 25));
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 1-12

  if (day <= safeClosingDay) {
    return `${year}-${String(month).padStart(2, "0")}`;
  } else {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
  }
}

/**
 * Menghasilkan daftar opsi periode tutup buku yang tersedia berdasarkan data invoice
 * ditambah periode bulan saat ini dan sekitarnya.
 */
export function getAvailableClosingMonths(
  invoiceDates: string[],
  closingDay: number = 25,
  referenceDate: Date = new Date()
): InvoiceClosingPeriod[] {
  const safeClosingDay = Math.max(1, Math.min(28, closingDay || 25));
  const monthsSet = new Set<string>();

  // Tambahkan bulan aktif dan 6 bulan sebelumnya serta 2 bulan ke depan
  const currentClosing = determineClosingMonthForDate(referenceDate, safeClosingDay);
  const [currY, currM] = currentClosing.split("-").map(Number);

  for (let offset = -6; offset <= 2; offset++) {
    const d = new Date(currY, currM - 1 + offset, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    monthsSet.add(`${y}-${String(m).padStart(2, "0")}`);
  }

  // Tambahkan semua bulan yang ada di invoiceDates
  invoiceDates.forEach((dStr) => {
    if (!dStr) return;
    const cleanD = dStr.slice(0, 10);
    const parts = cleanD.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
      const closingM = determineClosingMonthForDate(dObj, safeClosingDay);
      monthsSet.add(closingM);
    }
  });

  const sortedMonths = Array.from(monthsSet).sort().reverse();
  return sortedMonths.map((m) => getInvoiceClosingPeriod(m, safeClosingDay));
}
