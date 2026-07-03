import { getCutoffMonthForDate, normalizeDateYMD } from "./appUi";

type ReportingLikeLog = {
  date?: string;
  timestamp?: string;
  gmv?: number;
  orders?: number;
  products_sold?: number;
  clicks?: number;
  penonton?: number;
  impressions?: number;
};

export type LogDateMatchOptions = {
  timeFilter: "Semua" | "Harian" | "Mingguan" | "Bulanan";
  referenceDate: string;
  useCutOff: boolean;
  cutOffStartDay?: number | null;
  cutOffEndDay?: number | null;
};

export const getLogDateInput = (log: {
  date?: string;
  timestamp?: string;
}) =>
  log.date || (typeof log.timestamp === "string" ? log.timestamp.split(" ")[0] : "");

export const isLogDateMatching = (
  rawLogDateStr: string,
  options: LogDateMatchOptions,
) => {
  if (options.timeFilter === "Semua") return true;

  const logDateStr = normalizeDateYMD(rawLogDateStr);
  if (!logDateStr) return false;

  const [logY, logM, logD] = logDateStr.split("-").map(Number);
  if (!logY || !logM || !logD) return false;

  const [refY, refM, refD] = options.referenceDate.split("-").map(Number);
  if (!refY || !refM || !refD) return true;

  if (options.timeFilter === "Harian") {
    return logDateStr === options.referenceDate;
  }

  if (options.timeFilter === "Mingguan") {
    const logUtc = Date.UTC(logY, logM - 1, logD);
    const refUtc = Date.UTC(refY, refM - 1, refD);
    const diffDays = (refUtc - logUtc) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 7;
  }

  if (options.timeFilter === "Bulanan") {
    if (options.useCutOff) {
      const startDay = options.cutOffStartDay ?? 16;
      const endDay = options.cutOffEndDay ?? 15;

      let startPeriodY = refY;
      let startPeriodM = refM;
      let endPeriodY = refY;
      let endPeriodM = refM;

      if (refD >= startDay) {
        endPeriodM += 1;
        if (endPeriodM > 12) {
          endPeriodM = 1;
          endPeriodY += 1;
        }
      } else {
        startPeriodM -= 1;
        if (startPeriodM < 1) {
          startPeriodM = 12;
          startPeriodY -= 1;
        }
      }

      const startStr = `${startPeriodY}-${String(startPeriodM).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`;
      const endStr = `${endPeriodY}-${String(endPeriodM).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

      return logDateStr >= startStr && logDateStr <= endStr;
    }

    return logY === refY && logM === refM;
  }

  return true;
};

export const buildAvailableCutoffMonths = (
  logs: readonly { date?: string; timestamp?: string }[],
  referenceDate: string,
  now = new Date(),
) => {
  const months = new Set<string>();

  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const currentDay = now.getDate();
  let activeMonth = currentMonthIdx + 1;
  let activeYear = currentYear;
  if (currentDay >= 16) {
    activeMonth += 1;
    if (activeMonth > 12) {
      activeMonth = 1;
      activeYear += 1;
    }
  }
  months.add(`${activeYear}-${String(activeMonth).padStart(2, "0")}`);

  if (referenceDate) {
    const parts = referenceDate.split("-");
    const rY = parseInt(parts[0], 10);
    const rM = parseInt(parts[1], 10);
    const rD = parseInt(parts[2], 10);
    if (rY && rM && rD) {
      let targetM = rM;
      let targetY = rY;
      if (rD >= 16) {
        targetM += 1;
        if (targetM > 12) {
          targetM = 1;
          targetY += 1;
        }
      }
      months.add(`${targetY}-${String(targetM).padStart(2, "0")}`);
    }
  }

  logs.forEach((item) => {
    const rawDate = getLogDateInput(item);
    if (!rawDate) return;
    const cut = getCutoffMonthForDate(rawDate);
    if (cut) {
      months.add(cut);
    }
  });

  return Array.from(months).sort().reverse();
};

export const formatCutoffPeriodOptionLabel = (value: string) => {
  const [yearStr, monthStr] = value.split("-");
  const yr = Number(yearStr);
  const m = Number(monthStr);
  if (!yr || !m) return value;

  const monthNames = [
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

  let prevM = m - 1;
  if (prevM === 0) {
    prevM = 12;
  }

  return ` 25 ${monthNames[m - 1]} ${yr} (16 ${monthNames[prevM - 1]} - 15 ${monthNames[m - 1]}) `;
};

export const formatCutoffPeriodNote = (
  value: string,
  startDay = 16,
  endDay = 15,
) => {
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const m = Number(monthStr);
  if (!year || !m) return "";

  const monthNames = [
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

  let prevM = m - 1;
  let prevYear = year;
  if (prevM === 0) {
    prevM = 12;
    prevYear -= 1;
  }

  return `${startDay} ${monthNames[prevM - 1]} ${prevYear} s/d ${endDay} ${monthNames[m - 1]} ${year}`;
};

export const getIndonesianMonthLabel = (monthStr: string) => {
  if (!monthStr) return "";
  const [, month] = monthStr.split("-");
  const monthNames = [
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
  return monthNames[parseInt(month, 10) - 1] || "";
};

export const getMonthOffset = (baseYYYYMM: string, offset: number) => {
  const [y, m] = baseYYYYMM.split("-").map(Number);
  const d = new Date(y, m - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function buildDailyChart(
  filteredDb: readonly ReportingLikeLog[],
  startDate: string,
  endDate: string,
) {
  const group: Record<
    string,
    {
      date: string;
      gmv: number;
      orders: number;
      itemsSold: number;
      clicks: number;
      penonton: number;
    }
  > = {};

  filteredDb.forEach((log) => {
    if (!log?.date) return;
    const d = normalizeDateYMD(log.date);
    if (d >= startDate && d <= endDate) {
      if (!group[d]) {
        group[d] = {
          date: d,
          gmv: 0,
          orders: 0,
          itemsSold: 0,
          clicks: 0,
          penonton: 0,
        };
      }
      group[d].gmv += log.gmv || 0;
      group[d].orders += log.orders || 0;
      group[d].itemsSold += log.products_sold || 0;
      group[d].clicks += log.clicks || 0;
      group[d].penonton += log.penonton || log.impressions || 0;
    }
  });

  return Object.values(group).sort((a, b) => a.date.localeCompare(b.date));
}

export function buildMonthlyChart(
  monthsArray: string[],
  filteredDb: readonly ReportingLikeLog[],
) {
  const group: Record<
    string,
    {
      date: string;
      labelMonth: string;
      gmv: number;
      orders: number;
      itemsSold: number;
      clicks: number;
      penonton: number;
    }
  > = {};

  monthsArray.forEach((m) => {
    group[m] = {
      date: getIndonesianMonthLabel(m),
      labelMonth: m,
      gmv: 0,
      orders: 0,
      itemsSold: 0,
      clicks: 0,
      penonton: 0,
    };
  });

  filteredDb.forEach((log) => {
    if (!log?.date) return;
    const mLabel = log.date.substring(0, 7);
    if (group[mLabel]) {
      group[mLabel].gmv += log.gmv || 0;
      group[mLabel].orders += log.orders || 0;
      group[mLabel].itemsSold += log.products_sold || 0;
      group[mLabel].clicks += log.clicks || 0;
      group[mLabel].penonton += log.penonton || log.impressions || 0;
    }
  });

  return Object.values(group).sort((a, b) => a.labelMonth.localeCompare(b.labelMonth));
}
