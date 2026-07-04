import type { ReportingRawRow } from "../types/reporting";

export type ShopeeRawTab = "day" | "shift" | "dayOfWeek" | "raw";

export type ReportingUploadPreviewGroupRow = {
  label: string;
  penonton: number;
  gmv: number;
  products_sold: number;
  orders: number;
  duration?: number;
};

function getShopeeGroupKey(
  row: ReportingRawRow,
  shopeeRawTab: Exclude<ShopeeRawTab, "raw">,
  shifts: readonly string[],
): string {
  const dtStr = String(row.dateTime || row.date || "");
  const dPart = dtStr.includes("T") ? dtStr.split("T")[0] : dtStr.split(" ")[0];
  const timeMatch = dtStr.match(/\d{1,2}:\d{2}/);
  const timeVal = timeMatch ? timeMatch[0] : "00:00";

  if (shopeeRawTab === "day") {
    const dSplit = dPart.split("-");
    if (dSplit.length === 3) {
      return `${dSplit[0]}-${dSplit[1]}-${dSplit[2]}`;
    }
    return dPart;
  }

  if (shopeeRawTab === "shift") {
    let key = "Lainnya";
    if (timeMatch) {
      const [hStr, mStr] = timeVal.split(":");
      const mins = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
      for (const shift of shifts) {
        const match = shift.match(
          /(\d{1,2})[\.:](\d{2})\s*-\s*(\d{1,2})[\.:](\d{2})/,
        );
        if (!match) continue;

        const start = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        const end = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
        if (end < start) {
          if (mins >= start || mins <= end) {
            key = shift;
            break;
          }
        } else if (mins >= start && mins <= end) {
          key = shift;
          break;
        }
      }
    }
    return key;
  }

  const dSplit = dPart.split("-");
  if (dSplit.length !== 3) {
    return "Unknown";
  }

  const dateObj = new Date(`${dSplit[2]}-${dSplit[1]}-${dSplit[0]}`);
  if (Number.isNaN(dateObj.getTime())) {
    return "Unknown";
  }

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[dateObj.getDay()] ?? "Unknown";
}

export function buildReportingUploadPreviewGroups(
  reportingRawData: readonly ReportingRawRow[],
  shopeeRawTab: Exclude<ShopeeRawTab, "raw">,
  shifts: readonly string[],
  rawDateSortAsc: boolean,
): ReportingUploadPreviewGroupRow[] {
  const groups: Record<string, ReportingUploadPreviewGroupRow> = {};

  for (const row of reportingRawData) {
    const key = getShopeeGroupKey(row, shopeeRawTab, shifts);

    if (!groups[key]) {
      groups[key] = {
        label: key,
        penonton: 0,
        gmv: 0,
        products_sold: 0,
        orders: 0,
      };
    }

    groups[key].penonton += row.penonton || 0;
    groups[key].duration = (groups[key].duration || 0) + (row.duration || 0);
    groups[key].gmv += row.gmv || 0;
    groups[key].products_sold += row.products_sold || 0;
    groups[key].orders += row.orders || 0;
  }

  return Object.values(groups).sort((a, b) => {
    const labelA = a.label || "";
    const labelB = b.label || "";
    if (labelA < labelB) return rawDateSortAsc ? -1 : 1;
    if (labelA > labelB) return rawDateSortAsc ? 1 : -1;
    return 0;
  });
}
