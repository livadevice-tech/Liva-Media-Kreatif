import { padLocal } from "./dateFormatting";

export type PickerMonthType = "prev" | "current" | "next";

export interface PickerDay {
  day: number;
  monthType: PickerMonthType;
  dateString: string;
}

export const getPickerDays = (year: number, month: number): PickerDay[] => {
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday is 0
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days: PickerDay[] = [];

  // Previous fill-in
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    days.push({
      day: d,
      monthType: "prev",
      dateString: `${prevYear}-${padLocal(prevMonth + 1)}-${padLocal(d)}`,
    });
  }

  // Current month
  for (let d = 1; d <= totalDays; d++) {
    days.push({
      day: d,
      monthType: "current",
      dateString: `${year}-${padLocal(month + 1)}-${padLocal(d)}`,
    });
  }

  // Next fill-in
  const remainingCells = 42 - days.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    days.push({
      day: d,
      monthType: "next",
      dateString: `${nextYear}-${padLocal(nextMonth + 1)}-${padLocal(d)}`,
    });
  }

  return days;
};
