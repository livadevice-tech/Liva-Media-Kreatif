import { normalizeDateYMD } from "./appUi";

export interface DateDatedItem {
  date?: string | null;
}

export function normalizeDateForRangeComparison(value: string) {
  return normalizeDateYMD(value);
}

export function isDateWithinInclusiveRange(
  value: string | null | undefined,
  startDate: string,
  endDate: string,
) {
  if (!value) return false;
  const normalizedValue = normalizeDateForRangeComparison(value);
  return normalizedValue >= startDate && normalizedValue <= endDate;
}

export function filterItemsWithinDateRange<T extends DateDatedItem>(
  items: readonly T[],
  startDate: string,
  endDate: string,
  includeItem?: (item: T) => boolean,
) {
  return items.filter((item) => {
    if (includeItem && !includeItem(item)) return false;
    return isDateWithinInclusiveRange(item.date, startDate, endDate);
  });
}
