import { parseISO, startOfWeek, startOfMonth, format, isValid, compareAsc } from "date-fns";
import { id } from "date-fns/locale";

type AnyChartPoint = {
  date: string; // expected format: yyyy-MM-dd
  [key: string]: any;
};

export type ChartGranularity = "daily" | "weekly" | "monthly";

export function getLatestDateInChartData<T extends AnyChartPoint>(data: T[]): string | null {
  if (!data || data.length === 0) return null;
  const validDates = data
    .map((d) => parseISO(d.date))
    .filter((d) => isValid(d))
    .sort(compareAsc);
  if (validDates.length === 0) return null;
  return format(validDates[validDates.length - 1], "yyyy-MM-dd");
}

export function filterChartDataByLatestDays<T extends AnyChartPoint>(data: T[], days: number): T[] {
    const latestStr = getLatestDateInChartData(data);
    if (!latestStr) return data;
    
    const latestDate = parseISO(latestStr);
    const cutoffDate = new Date(latestDate);
    cutoffDate.setDate(cutoffDate.getDate() - days + 1);
    
    return data.filter(d => {
        const dDate = parseISO(d.date);
        return isValid(dDate) && dDate >= cutoffDate;
    });
}

export function aggregateChartData<T extends AnyChartPoint>(
  data: T[],
  granularity: ChartGranularity,
  metricsToSum: string[]
): T[] {
  if (!data || data.length === 0) return [];

  // Sort data chronologically first
  const sortedData = [...data].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    if (!isValid(dateA) || !isValid(dateB)) return 0;
    return compareAsc(dateA, dateB);
  });

  if (granularity === "daily") {
    return sortedData.map(d => {
       const parsed = parseISO(d.date);
       return {
         ...d,
         displayDate: isValid(parsed) ? format(parsed, "dd MMM", { locale: id }) : d.date
       };
    });
  }

  const grouped = new Map<string, T>();

  sortedData.forEach((point) => {
    const parsedDate = parseISO(point.date);
    if (!isValid(parsedDate)) return;

    let groupKey = "";
    let displayDate = "";

    if (granularity === "weekly") {
      const weekStart = startOfWeek(parsedDate, { weekStartsOn: 1 }); // Monday start
      groupKey = format(weekStart, "yyyy-MM-dd");
      displayDate = `Minggu ${format(weekStart, "dd MMM", { locale: id })}`;
    } else if (granularity === "monthly") {
      const monthStart = startOfMonth(parsedDate);
      groupKey = format(monthStart, "yyyy-MM-dd");
      displayDate = format(monthStart, "MMM yyyy", { locale: id });
    }

    if (!grouped.has(groupKey)) {
      // Initialize new group
      const newPoint = { ...point, date: groupKey, displayDate } as T;
      metricsToSum.forEach((metric) => {
        newPoint[metric as keyof T] = (Number(point[metric]) || 0) as any;
      });
      grouped.set(groupKey, newPoint);
    } else {
      // Aggregate existing group
      const existing = grouped.get(groupKey)!;
      metricsToSum.forEach((metric) => {
        const currentVal = Number(existing[metric]) || 0;
        const addVal = Number(point[metric]) || 0;
        existing[metric as keyof T] = (currentVal + addVal) as any;
      });
    }
  });

  return Array.from(grouped.values()).sort((a, b) => {
     return compareAsc(parseISO(a.date), parseISO(b.date));
  });
}
