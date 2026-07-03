import { formatDateYYYYMMDD } from "./date";

type DateFilterType = "latest" | "all" | "month" | "custom" | "weekly";

type BooleanSetter = (value: boolean) => void;
type StringSetter = (value: string) => void;
type FilterSetter = (value: "latest" | "all" | "month" | "custom") => void;

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
