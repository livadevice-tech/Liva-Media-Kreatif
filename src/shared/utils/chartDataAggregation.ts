export type ChartGranularity = "daily" | "weekly" | "monthly";

type AnyChartPoint = {
  date: string; // expected format: yyyy-MM-dd or any parsable date string
  [key: string]: any;
};

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateLabel(date: Date, granularity: ChartGranularity): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];

  if (granularity === "daily") {
    return `${String(date.getDate()).padStart(2, "0")} ${months[date.getMonth()]}`;
  } else if (granularity === "weekly") {
    return `Mggu ${String(date.getDate()).padStart(2, "0")} ${months[date.getMonth()]}`;
  } else {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
}

/** Returns the ISO date string of the latest date in the dataset, or null if empty */
export function getLatestDateInChartData<T extends AnyChartPoint>(
  data: T[]
): string | null {
  if (!data || data.length === 0) return null;
  let latest: Date | null = null;
  let latestStr = "";
  for (const point of data) {
    const d = parseDate(point.date);
    if (d && (!latest || d > latest)) {
      latest = d;
      latestStr = point.date;
    }
  }
  return latestStr || null;
}

/** Slices `data` to only include points within the last `days` days from the latest date present */
export function filterChartDataByLatestDays<T extends AnyChartPoint>(
  data: T[],
  days: number
): T[] {
  const latestStr = getLatestDateInChartData(data);
  if (!latestStr) return data;

  const latestDate = parseDate(latestStr)!;
  const cutoffDate = new Date(latestDate);
  cutoffDate.setDate(cutoffDate.getDate() - days + 1);
  cutoffDate.setHours(0, 0, 0, 0);

  return data.filter((d) => {
    const dDate = parseDate(d.date);
    return dDate !== null && dDate >= cutoffDate;
  });
}

/** Returns monday of the week that `date` falls in */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns first day of the month that `date` falls in */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 
 * Aggregates chart data points by granularity.
 * For "daily", adds formatted displayDate.
 * For "weekly" and "monthly", groups by period start and sums the given metrics.
 */
export function aggregateChartData<T extends AnyChartPoint>(
  data: T[],
  granularity: ChartGranularity,
  metricsToSum: string[]
): T[] {
  if (!data || data.length === 0) return [];

  // Sort chronologically
  const sortedData = [...data].sort((a, b) => {
    const da = parseDate(a.date);
    const db = parseDate(b.date);
    if (!da || !db) return 0;
    return da.getTime() - db.getTime();
  });

  if (granularity === "daily") {
    return sortedData.map((d) => {
      const parsed = parseDate(d.date);
      return {
        ...d,
        displayDate: parsed ? formatDateLabel(parsed, "daily") : d.date,
      };
    });
  }

  const grouped = new Map<string, T>();

  for (const point of sortedData) {
    const parsedDate = parseDate(point.date);
    if (!parsedDate) continue;

    let periodStart: Date;
    if (granularity === "weekly") {
      periodStart = getWeekStart(parsedDate);
    } else {
      periodStart = getMonthStart(parsedDate);
    }

    const groupKey = toYMD(periodStart);
    const displayDate = formatDateLabel(periodStart, granularity);

    if (!grouped.has(groupKey)) {
      const newPoint = { ...point, date: groupKey, displayDate } as T;
      for (const metric of metricsToSum) {
        newPoint[metric as keyof T] = (Number(point[metric]) || 0) as any;
      }
      grouped.set(groupKey, newPoint);
    } else {
      const existing = grouped.get(groupKey)!;
      for (const metric of metricsToSum) {
        const cur = Number(existing[metric]) || 0;
        const add = Number(point[metric]) || 0;
        existing[metric as keyof T] = (cur + add) as any;
      }
    }
  }

  return Array.from(grouped.values()).sort((a, b) => {
    const da = parseDate(a.date);
    const db = parseDate(b.date);
    if (!da || !db) return 0;
    return da.getTime() - db.getTime();
  });
}
