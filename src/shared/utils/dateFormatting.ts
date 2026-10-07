export const padLocal = (n: number) => String(n).padStart(2, "0");

export const formatContractDate = (d?: string) => {
  if (!d) return "—";
  const cleaned = String(d).replace(/^Tgl\s*/i, "").trim();
  if (!cleaned) return "—";
  const datePart = cleaned.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    return `Tgl ${day || parts[2]}`;
  }
  return `Tgl ${cleaned}`;
};

export const normalizeDateStr = (d: string) => {
  if (!d) return "";
  if (
    d.indexOf("/") !== -1 ||
    (d.indexOf("-") !== -1 && d.split("-")[0].length <= 2)
  ) {
    const parts = d.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${String(parts[1]).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")}`;
      }
      const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      return `${y}-${String(parts[1]).padStart(2, "0")}-${String(parts[0]).padStart(2, "0")}`;
    }
  }
  if (d.indexOf("-") !== -1 && d.split("-")[0].length === 4) {
    const parts = d.split("-");
    if (parts.length === 3) {
      return `${parts[0]}-${String(parts[1]).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")}`;
    }
  }
  return d;
};

const SHORT_MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sept', 'Okt', 'Nov', 'Des'
];

export const extractDayNumber = (val?: string | number): number | null => {
  if (val === undefined || val === null || val === '') return null;
  const cleaned = String(val).replace(/^Tgl\s*/i, '').trim();
  if (cleaned.includes('-')) {
    const parts = cleaned.split('T')[0].split('-');
    if (parts.length === 3) {
      const d = parseInt(parts[2], 10);
      return Number.isNaN(d) ? null : d;
    }
  }
  const n = parseInt(cleaned, 10);
  return Number.isNaN(n) ? null : n;
};

export const resolveContractPeriodDates = (
  startRaw?: string,
  endRaw?: string,
  refDateStr?: string
): { startDate: string; endDate: string } => {
  const isFullDate = (s?: string) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s);

  if (isFullDate(startRaw) && isFullDate(endRaw)) {
    return {
      startDate: (startRaw as string).split('T')[0],
      endDate: (endRaw as string).split('T')[0],
    };
  }

  const ref = refDateStr ? new Date(refDateStr) : new Date();
  const refDate = Number.isNaN(ref.getTime()) ? new Date() : ref;

  const refYear = refDate.getFullYear();
  const refMonth = refDate.getMonth();

  const startDay = extractDayNumber(startRaw);
  const endDay = extractDayNumber(endRaw);

  if (!startDay && !endDay) {
    return {
      startDate: isFullDate(startRaw) ? (startRaw as string).split('T')[0] : '',
      endDate: isFullDate(endRaw) ? (endRaw as string).split('T')[0] : '',
    };
  }

  const sDay = startDay || endDay || 1;
  const eDay = endDay || startDay || 28;

  let startD: Date;
  let endD: Date;

  if (sDay > eDay) {
    endD = new Date(refYear, refMonth, eDay);
    startD = new Date(refYear, refMonth - 1, sDay);
  } else if (sDay === eDay) {
    endD = new Date(refYear, refMonth, eDay);
    startD = new Date(refYear, refMonth - 1, sDay);
  } else {
    endD = new Date(refYear, refMonth, eDay);
    startD = new Date(refYear, refMonth, sDay);
  }

  const toYMD = (d: Date) =>
    `${d.getFullYear()}-${padLocal(d.getMonth() + 1)}-${padLocal(d.getDate())}`;

  return {
    startDate: isFullDate(startRaw) ? (startRaw as string).split('T')[0] : toYMD(startD),
    endDate: isFullDate(endRaw) ? (endRaw as string).split('T')[0] : toYMD(endD),
  };
};

export const formatLivePeriod = (
  startRaw?: string,
  endRaw?: string,
  refDateStr?: string
): string => {
  const { startDate, endDate } = resolveContractPeriodDates(startRaw, endRaw, refDateStr);
  if (!startDate || !endDate) {
    if (startRaw || endRaw) {
      return `${startRaw || ''}${endRaw ? ` - ${endRaw}` : ''}`.trim();
    }
    return '';
  }

  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);

  if (!sy || !sm || !sd || !ey || !em || !ed) return '';

  const startMonth = SHORT_MONTHS_ID[sm - 1] || '';
  const endMonth = SHORT_MONTHS_ID[em - 1] || '';
  const startYear2d = String(sy).slice(-2);
  const endYear2d = String(ey).slice(-2);

  if (sy === ey) {
    if (sm === em) {
      return `${sd} - ${ed} ${endMonth} ${endYear2d}`;
    }
    return `${sd} ${startMonth} - ${ed} ${endMonth} ${endYear2d}`;
  }
  return `${sd} ${startMonth} ${startYear2d} - ${ed} ${endMonth} ${endYear2d}`;
};
