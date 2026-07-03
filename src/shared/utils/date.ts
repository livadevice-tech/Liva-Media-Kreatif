export const formatDateYYYYMMDD = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const formatDateUI = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;

    const hasTime = dateStr.includes("T") || dateStr.includes(":");
    const useUTC = dateStr.endsWith("Z");

    const day = String(useUTC ? d.getUTCDate() : d.getDate()).padStart(2, "0");
    const month = String((useUTC ? d.getUTCMonth() : d.getMonth()) + 1).padStart(
      2,
      "0",
    );
    const year = useUTC ? d.getUTCFullYear() : d.getFullYear();

    const hh = String(useUTC ? d.getUTCHours() : d.getHours()).padStart(2, "0");
    const mm = String(useUTC ? d.getUTCMinutes() : d.getMinutes()).padStart(
      2,
      "0",
    );
    const ss = String(useUTC ? d.getUTCSeconds() : d.getSeconds()).padStart(
      2,
      "0",
    );

    if (!hasTime || (hh === "00" && mm === "00" && ss === "00")) {
      return `${day}/${month}/${year}`;
    }

    return `${day}/${month}/${year} ${hh}:${mm}:${ss}`;
  } catch (e) {
    return dateStr;
  }
};

export const formatDateUILocal = (dateStr?: string) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatHumanDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;

  const correctedMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${correctedMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
