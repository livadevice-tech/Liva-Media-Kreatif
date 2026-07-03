export interface MappingColumnMap {
  date: string;
  gmv: string;
  items_sold: string;
  ctr: string;
  ctor: string;
  views: string;
  viewers: string;
  impressions: string;
  clicks: string;
  orders: string;
}

export interface MappingUploadRow {
  name: string;
  platform: string;
  gmv: number;
  items_sold: number;
  ctr: number;
  ctor: number;
  views: number;
  viewers: number;
  impressions: number;
  clicks: number;
  orders: number;
}

const parseIndex = (value: string) => {
  const idx = Number.parseInt(value, 10);
  return Number.isNaN(idx) ? null : idx;
};

export function sanitizeMappedNumber(value: unknown): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const cleanStr = value.replace(/[^0-9.,-]/g, "");
  let finalStr = cleanStr;

  if (cleanStr.includes(",") && cleanStr.includes(".")) {
    if (cleanStr.lastIndexOf(",") > cleanStr.lastIndexOf(".")) {
      finalStr = cleanStr.replace(/\./g, "").replace(/,/g, ".");
    } else {
      finalStr = cleanStr.replace(/,/g, "");
    }
  } else if (cleanStr.includes(",")) {
    const parts = cleanStr.split(",");
    if (parts[parts.length - 1].length <= 2) {
      finalStr = cleanStr.replace(/,/g, ".");
    } else {
      finalStr = cleanStr.replace(/,/g, "");
    }
  } else if (cleanStr.includes(".")) {
    const parts = cleanStr.split(".");
    if (parts.length > 2 || parts[parts.length - 1].length === 3) {
      finalStr = cleanStr.replace(/\./g, "");
    }
  }

  const parsed = Number.parseFloat(finalStr);
  return Number.isNaN(parsed) ? 0 : parsed;
}

const getMappedCell = (row: readonly unknown[], columnIndex: string) => {
  const idx = parseIndex(columnIndex);
  if (idx === null || idx < 0 || idx >= row.length) return undefined;
  return row[idx];
};

const getMappedName = (
  row: readonly unknown[],
  dateColumnIndex: string,
  fallbackName: string,
) => {
  const idx = parseIndex(dateColumnIndex);
  if (idx === null || idx < 0 || idx >= row.length) {
    return fallbackName;
  }

  const cell = row[idx];
  return cell ? String(cell) : fallbackName;
};

export function buildMappedUploadRows(
  rows: readonly unknown[][],
  columnMapping: MappingColumnMap,
  uploadPlatform: string,
): MappingUploadRow[] {
  return rows
    .map((row, index) => {
      const rowName = getMappedName(row, columnMapping.date, `Record ${index + 1}`);

      return {
        name: String(rowName).substring(0, 15),
        platform: uploadPlatform,
        gmv: sanitizeMappedNumber(getMappedCell(row, columnMapping.gmv)),
        items_sold: sanitizeMappedNumber(getMappedCell(row, columnMapping.items_sold)),
        ctr: sanitizeMappedNumber(getMappedCell(row, columnMapping.ctr)),
        ctor: sanitizeMappedNumber(getMappedCell(row, columnMapping.ctor)),
        views: sanitizeMappedNumber(getMappedCell(row, columnMapping.views)),
        viewers: sanitizeMappedNumber(getMappedCell(row, columnMapping.viewers)),
        impressions: sanitizeMappedNumber(getMappedCell(row, columnMapping.impressions)),
        clicks: sanitizeMappedNumber(getMappedCell(row, columnMapping.clicks)),
        orders: sanitizeMappedNumber(getMappedCell(row, columnMapping.orders)),
      };
    })
    .filter((row) => {
      const totalMetrics =
        row.gmv +
        row.items_sold +
        row.views +
        row.viewers +
        row.impressions +
        row.clicks +
        row.orders;
      if (totalMetrics === 0) return false;
      if (row.name.toLowerCase().includes("total")) return false;
      return true;
    });
}
