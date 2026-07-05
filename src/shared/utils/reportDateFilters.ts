import { isPlatformMatch, normalizeDateYMD } from "./appUi";
import { formatDateYYYYMMDD } from "./date";
import type { ReportLogLike } from "./reportTable";

type DateFilterType = "latest" | "all" | "month" | "custom" | "weekly";

type BooleanSetter = (value: boolean) => void;
type StringSetter = (value: string) => void;
type FilterSetter = (value: "latest" | "all" | "month" | "custom") => void;

interface GetAvailableReportDatesArgs {
  logs: readonly { date?: string; platform?: string }[];
  platformFilter?: string;
}

interface ShiftAvailableReportDateArgs extends GetAvailableReportDatesArgs {
  currentDate: string;
  direction: -1 | 1;
}

interface ApplyDateFilterSelectionArgs {
  value: "latest" | "all" | "month" | "custom";
  setFilterType: FilterSetter;
  setMonthOpen: BooleanSetter;
  setCalendarOpen: BooleanSetter;
  setTempStartDate: StringSetter;
  setTempEndDate: StringSetter;
  currentStartDate: string;
  currentEndDate: string;
}

interface GetReportPeriodLabelArgs {
  dateFilterType: DateFilterType;
  latestDateLabel: string;
  targetLatestDate: string;
  customStartDate: string;
}

interface ShiftReportPeriodByOneDayArgs {
  direction: -1 | 1;
  dateFilterType: "latest" | "all" | "month" | "custom";
  targetLatestDate: string;
  customStartDate: string;
  setDateFilterType: FilterSetter;
  setCustomStartDate: StringSetter;
  setCustomEndDate: StringSetter;
}

export function applyDateFilterSelection({
  value,
  setFilterType,
  setMonthOpen,
  setCalendarOpen,
  setTempStartDate,
  setTempEndDate,
  currentStartDate,
  currentEndDate,
}: ApplyDateFilterSelectionArgs) {
  setFilterType(value);
  if (value === "all" || value === "latest") {
    setCalendarOpen(false);
    setMonthOpen(false);
  } else if (value === "month") {
    setMonthOpen(true);
    setCalendarOpen(false);
  } else if (value === "custom") {
    setCalendarOpen(true);
    setMonthOpen(false);
    setTempStartDate(currentStartDate || formatDateYYYYMMDD(new Date()));
    setTempEndDate(currentEndDate || formatDateYYYYMMDD(new Date()));
  }
}

export function getAvailableReportDates({
  logs,
  platformFilter,
}: GetAvailableReportDatesArgs) {
  return Array.from(
    new Set(
      logs
        .filter((log) => isPlatformMatch(log.platform, platformFilter || ""))
        .map((log) => normalizeDateYMD(log.date || ""))
        .filter(Boolean) as string[],
    ),
  ).sort();
}

export function getLatestAvailableReportDate(
  args: GetAvailableReportDatesArgs,
) {
  const availableDates = getAvailableReportDates(args);
  return availableDates[availableDates.length - 1] || "";
}

export function shiftAvailableReportDate({
  logs,
  platformFilter,
  currentDate,
  direction,
}: ShiftAvailableReportDateArgs) {
  const availableDates = getAvailableReportDates({ logs, platformFilter });
  if (availableDates.length === 0) {
    return "";
  }

  const currentIndex = currentDate
    ? availableDates.indexOf(currentDate)
    : availableDates.length - 1;
  const baseIndex = currentIndex >= 0 ? currentIndex : availableDates.length - 1;
  const nextIndex = Math.min(
    Math.max(baseIndex + direction, 0),
    availableDates.length - 1,
  );
  return availableDates[nextIndex];
}

export function getReportPeriodLabel({
  dateFilterType,
  latestDateLabel,
  targetLatestDate,
  customStartDate,
}: GetReportPeriodLabelArgs) {
  if (dateFilterType === "month" || dateFilterType === "all") {
    return latestDateLabel || "Semua Waktu";
  }

  let curD = new Date();
  if (dateFilterType === "latest" && targetLatestDate) {
    curD = new Date(targetLatestDate);
  } else if (dateFilterType === "custom" && customStartDate) {
    curD = new Date(customStartDate);
  }

  return curD.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function shiftReportPeriodByOneDay({
  direction,
  dateFilterType,
  targetLatestDate,
  customStartDate,
  setDateFilterType,
  setCustomStartDate,
  setCustomEndDate,
}: ShiftReportPeriodByOneDayArgs) {
  let pd = new Date();
  if (dateFilterType === "latest" && targetLatestDate) {
    pd = new Date(targetLatestDate);
  } else if (dateFilterType === "custom" && customStartDate) {
    pd = new Date(customStartDate);
  }

  pd.setDate(pd.getDate() + direction);
  const newD = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, "0")}-${String(pd.getDate()).padStart(2, "0")}`;
  setDateFilterType("custom");
  setCustomStartDate(newD);
  setCustomEndDate(newD);
}
