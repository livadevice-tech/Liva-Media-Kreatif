export const padLocal = (n: number) => String(n).padStart(2, "0");

export const formatContractDate = (d?: string) => {
  if (!d) return "—";
  const datePart = d.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
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
