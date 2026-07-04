import * as XLSX from "xlsx";

import { getShiftFromHour } from "./appUi";
import type { ReportingRawRow, SkuRawRow } from "../types/reporting";

type WorksheetRows = readonly unknown[][];

export async function readFirstWorksheetRowsFromFile(
  file: File,
): Promise<WorksheetRows> {
  const data = new Uint8Array(await file.arrayBuffer());
  const workbook = XLSX.read(data, { type: "array", raw: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) return [];

  return XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
  }) as unknown[][];
}

const normalizeHeaderText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeText = (value: unknown) => normalizeHeaderText(value);

const parseExcelDateCode = (value: number, shouldSwapExcelDates: boolean) => {
  const dateObj = XLSX.SSF.parse_date_code(value) as
    | { y: number; m: number; d: number; H: number; M: number }
    | null;

  if (!dateObj) return "";

  const y = dateObj.y;
  let m = dateObj.m;
  let d = dateObj.d;

  if (shouldSwapExcelDates) {
    const temp = m;
    m = d;
    d = temp;
  }

  const mStr = String(m).padStart(2, "0");
  const dStr = String(d).padStart(2, "0");
  const hh = String(dateObj.H).padStart(2, "0");
  const mm = String(dateObj.M).padStart(2, "0");

  return `${y}-${mStr}-${dStr} ${hh}:${mm}`;
};

const parseDateString = (value: string, isMonthFirst: boolean) => {
  let formattedDate = value.trim();

  if (
    formattedDate.indexOf("/") !== -1 ||
    (formattedDate.indexOf("-") !== -1 && formattedDate.split("-")[0].length <= 2)
  ) {
    const dtSplitRegex = formattedDate.split(" ")[0].split(/[\/\-]/);
    if (dtSplitRegex.length === 3) {
      const timeMatchList = formattedDate.match(/\d{1,2}:\d{2}(:\d{2})?/);
      const tmPart = timeMatchList ? timeMatchList[0] : "";
      let y =
        dtSplitRegex[2].length === 2 ? `20${dtSplitRegex[2]}` : dtSplitRegex[2];

      let m: string;
      let d: string;
      if (isMonthFirst) {
        m = String(dtSplitRegex[0]).padStart(2, "0");
        d = String(dtSplitRegex[1]).padStart(2, "0");
      } else {
        m = String(dtSplitRegex[1]).padStart(2, "0");
        d = String(dtSplitRegex[0]).padStart(2, "0");
      }

      if (dtSplitRegex[0].length === 4) {
        y = dtSplitRegex[0];
        if (isMonthFirst) {
          m = String(dtSplitRegex[1]).padStart(2, "0");
          d = String(dtSplitRegex[2]).padStart(2, "0");
        } else {
          m = String(dtSplitRegex[1]).padStart(2, "0");
          d = String(dtSplitRegex[2]).padStart(2, "0");
        }
      }

      formattedDate = `${y}-${m}-${d} ${tmPart}`.trim();
    }
  }

  return formattedDate;
};

const parseSkuNumber = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === "number") return value;

  let s = String(value)
    .trim()
    .replace(/Rp|rp|IDR|idr|\s/g, "");

  if (s.indexOf(",") === -1 && s.indexOf(".") !== -1 && s.split(".").length > 2) {
    s = s.replace(/\./g, "");
  } else if (s.indexOf(",") !== -1 && s.indexOf(".") !== -1) {
    if (s.indexOf(",") < s.indexOf(".")) {
      s = s.replace(/,/g, "");
    } else {
      s = s.replace(/\./g, "").replace(/,/g, ".");
    }
  } else if (s.indexOf(",") !== -1 && s.indexOf(".") === -1) {
    s = s.replace(/,/g, ".");
  } else if (
    s.indexOf(".") !== -1 &&
    s.split(".").length === 2 &&
    s.split(".")[1].length === 3
  ) {
    s = s.replace(/\./g, "");
  }

  return Number(s.replace(/[^0-9.-]+/g, ""));
};

const parseIndonesianNumber = (value: unknown): number => {
  if (value === undefined || value === null || value === "-" || value === "")
    return 0;
  if (typeof value === "number") return value;

  let str = String(value)
    .replace(/rp/gi, "")
    .replace(/\s/g, "")
    .trim()
    .toLowerCase();

  let multiplier = 1;
  if (str.endsWith("k") || str.endsWith("rb") || str.endsWith("ribu")) {
    multiplier = 1000;
    str = str.replace(/(k|rb|ribu)$/, "");
  } else if (str.endsWith("m") || str.endsWith("jt") || str.endsWith("juta")) {
    multiplier = 1000000;
    str = str.replace(/(m|jt|juta)$/, "");
  } else if (str.endsWith("b") || str.endsWith("miliar")) {
    multiplier = 1000000000;
    str = str.replace(/(b|miliar)$/, "");
  }

  const isNegative = str.includes("-");

  if (str.includes(".") && str.includes(",")) {
    const lastComma = str.lastIndexOf(",");
    const lastDot = str.lastIndexOf(".");
    if (lastComma > lastDot) {
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  } else if (str.includes(",")) {
    if (str.indexOf(",") !== str.lastIndexOf(",")) {
      str = str.replace(/,/g, "");
    } else if (/,\d{3}$/.test(str)) {
      str = str.replace(/,/g, "");
    } else {
      str = str.replace(",", ".");
    }
  } else if (str.includes(".")) {
    if (str.indexOf(".") !== str.lastIndexOf(".")) {
      str = str.replace(/\./g, "");
    } else if (/\.\d{3}$/.test(str)) {
      str = str.replace(/\./g, "");
    }
  }

  str = str.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(str) * (isNegative ? -1 : 1);
  return (Number.isNaN(parsed) ? 0 : parsed) * multiplier;
};

const findHeaderRow = (
  jsonData: WorksheetRows,
  predicate: (row: readonly unknown[]) => boolean,
  maxScanRows = 50,
) => {
  for (let r = 0; r < Math.min(jsonData.length, maxScanRows); r++) {
    const row = jsonData[r];
    if (row && predicate(row)) return r;
  }
  return 0;
};

const detectFallbackDate = (jsonData: WorksheetRows, headerRowIdx: number, fileName: string) => {
  let globalDateFallback = "";

  for (let r = 0; r < headerRowIdx; r++) {
    const row = jsonData[r];
    if (!row) continue;
    for (let i = 0; i < row.length; i++) {
      const cellStr = String(row[i] || "");
      const matchYMD = cellStr.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
      if (matchYMD) {
        globalDateFallback = `${matchYMD[1]}-${matchYMD[2]}-${matchYMD[3]}`;
        break;
      }
      const matchDMY = cellStr.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      if (matchDMY) {
        globalDateFallback = `${matchDMY[3]}-${matchDMY[2]}-${matchDMY[1]}`;
        break;
      }
    }
    if (globalDateFallback) break;
  }

  if (!globalDateFallback) {
    const fnMatchYMD = fileName.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
    if (fnMatchYMD) {
      globalDateFallback = `${fnMatchYMD[1]}-${fnMatchYMD[2]}-${fnMatchYMD[3]}`;
    } else {
      const fnMatchYM = fileName.match(/(\d{4})[\/\-](\d{2})/);
      if (fnMatchYM) globalDateFallback = `${fnMatchYM[1]}-${fnMatchYM[2]}-01`;
    }
  }

  return globalDateFallback;
};

const getDateLikeValue = (headers: string[], row: readonly unknown[]) => {
  for (let idx = 0; idx < headers.length; idx++) {
    const h = headers[idx];
    if (
      h.includes("tanggal") ||
      h.includes("waktu") ||
      h.includes("date") ||
      h.includes("start time") ||
      h.includes("start") ||
      h.includes("time") ||
      h.includes("periode")
    ) {
      return row[idx];
    }
  }
  return undefined;
};

const getHeaderIndex = (headers: string[], aliases: string[]) => {
  const normalizedHeaders = headers.map(normalizeHeaderText);
  const normalizedAliases = aliases.map(normalizeHeaderText);

  for (const alias of normalizedAliases) {
    const idx = normalizedHeaders.findIndex((h) => h === alias);
    if (idx !== -1) return idx;
  }
  for (const alias of normalizedAliases) {
    const idx = normalizedHeaders.findIndex((h) => h.includes(alias));
    if (idx !== -1) return idx;
  }
  return -1;
};

export function parseSkuUploadRows(
  jsonData: WorksheetRows,
  fileName: string,
): SkuRawRow[] {
  if (jsonData.length < 2) return [];

  const headerRowIdx = findHeaderRow(jsonData, (row) =>
    row.some(
      (cell) =>
        typeof cell === "string" &&
        (cell.toLowerCase().includes("sku") ||
          cell.toLowerCase().includes("produk") ||
          cell.toLowerCase().includes("product") ||
          cell.toLowerCase().includes("item") ||
          cell.toLowerCase().includes("judul")),
    ),
  );

  const globalDateFallback = detectFallbackDate(jsonData, headerRowIdx, fileName);
  const headers = Array.from(jsonData[headerRowIdx] || []).map(normalizeText);

  let isMonthFirst = false;
  let shouldSwapExcelDates = false;
  let definiteMatchFound = false;

  for (let r = headerRowIdx + 1; r < jsonData.length; r++) {
    const row = jsonData[r];
    if (!row || row.length === 0) continue;
    const rawStart = getDateLikeValue(headers, row);

    if (rawStart && typeof rawStart === "number") {
      const dateObj = XLSX.SSF.parse_date_code(rawStart) as { d: number; m: number } | null;
      if (!dateObj) continue;
      if (dateObj.d > 12) {
        shouldSwapExcelDates = false;
        definiteMatchFound = true;
      } else if (dateObj.m > 12) {
        shouldSwapExcelDates = true;
        definiteMatchFound = true;
      }
    } else if (rawStart && typeof rawStart === "string") {
      const allMatches = rawStart.match(/\b(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})\b/g);
      if (allMatches) {
        for (const matchStr of allMatches) {
          const dtSplit = matchStr.split(/[\/\-]/);
          if (dtSplit.length !== 3) continue;

          let firstStr = dtSplit[0];
          let secondStr = dtSplit[1];
          if (dtSplit[0].length === 4) {
            firstStr = dtSplit[1];
            secondStr = dtSplit[2];
          }

          const first = parseInt(firstStr, 10);
          const second = parseInt(secondStr, 10);
          if (!Number.isNaN(first) && !Number.isNaN(second)) {
            if (first > 12) {
              isMonthFirst = false;
              shouldSwapExcelDates = false;
              definiteMatchFound = true;
            } else if (second > 12) {
              isMonthFirst = true;
              shouldSwapExcelDates = true;
              definiteMatchFound = true;
            }
          }
        }
      }
    }
  }

  if (!definiteMatchFound) {
    isMonthFirst = false;
    shouldSwapExcelDates = false;
  }

  const parsedData: SkuRawRow[] = [];

  for (let i = headerRowIdx + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    let sku = "";
    let productName = "";
    let sold = 0;
    let revenue = 0;
    let date = "";

    headers.forEach((header, idx) => {
      const val = row[idx];
      if (!val) return;

      if (
        header.includes("nama produk") ||
        header.includes("product name") ||
        header.includes("judul produk") ||
        header.includes("item name") ||
        header.includes("nama item") ||
        header === "produk" ||
        header === "product" ||
        header.includes("product list") ||
        header.includes("title")
      ) {
        productName = String(val);
      } else if (
        header.includes("sku") ||
        header.includes("induk") ||
        header.includes("product id") ||
        header.includes("item id")
      ) {
        sku = String(val);
      } else if (
        header.includes("produk terjual(pesanan dibayar)") ||
        header.includes("produk terjual (pesanan dibayar)") ||
        header.includes("jumlah terjual") ||
        header.includes("items sold") ||
        header.includes("produk terjual(pesanan dibuat)") ||
        header.includes("attributed items sold") ||
        header.includes("barang terjual") ||
        header.includes("units sold")
      ) {
        sold = parseSkuNumber(val);
      } else if (
        header.includes("penjualan(pesanan dibayar)") ||
        header.includes("penjualan (pesanan dibayar)") ||
        header.includes("revenue") ||
        header.includes("gmv") ||
        header.includes("penjualan(pesanan dibuat)") ||
        header.includes("penjualan (idr)") ||
        header.includes("attributed gmv") ||
        header.includes("pendapatan") ||
        header.includes("sales")
      ) {
        revenue = parseSkuNumber(val);
      } else if (
        header.includes("tanggal") ||
        header.includes("waktu") ||
        header.includes("date") ||
        header.includes("start time") ||
        header.includes("start") ||
        header.includes("time") ||
        header.includes("periode")
      ) {
        if (typeof val === "number") {
          date = parseExcelDateCode(val, shouldSwapExcelDates).split(" ")[0];
        } else {
          date = parseDateString(String(val), isMonthFirst).split(" ")[0];
        }
      } else if (
        header.includes("pesanan dibayar") ||
        header.includes("orders paid") ||
        header.includes("pesanan(pesanan dibuat)")
      ) {
        if (sold === 0) sold = parseSkuNumber(val);
      } else if (header.includes("sales") || header.includes("penjualan")) {
        if (revenue === 0) revenue = parseSkuNumber(val);
      }
    });

    if (productName || sku) {
      parsedData.push({
        id: `sku_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sku: sku || "N/A",
        productName: productName || "Unnamed Product",
        sold,
        revenue,
        date: date || globalDateFallback || new Date().toISOString().split("T")[0],
      });
    }
  }

  return parsedData;
}

export function parseReportingUploadRows(
  jsonData: WorksheetRows,
  shifts: readonly string[],
): ReportingRawRow[] {
  if (jsonData.length < 2) return [];

  const headerRowIdx = findHeaderRow(jsonData, (row) =>
    row.some((cell) => {
      if (typeof cell !== "string") return false;
      const cLower = cell.toLowerCase().trim();
      if (
        cLower === "interaksi" ||
        cLower === "promosi" ||
        cLower === "konversi" ||
        cLower === "data utama"
      ) {
        const nonEmpStrCols = row.filter(
          (c) => typeof c === "string" && c.trim().length > 0,
        ).length;
        if (nonEmpStrCols < 8) return false;
      }
      return (
        cLower.includes("streaming") ||
        cLower.includes("mulai") ||
        cLower.includes("gmv") ||
        cLower.includes("user id") ||
        cLower === "penonton" ||
        cLower === "penonton aktif" ||
        cLower === "suka" ||
        cLower === "komentar" ||
        cLower.includes("pembeli(pesanan")
      );
    }),
  );

  const headers = Array.from(jsonData[headerRowIdx] || []).map(normalizeText);
  const findColIdx = (aliases: string[]) => getHeaderIndex(headers, aliases);

  const titleIdx = findColIdx([
    "nama livestream",
    "livestream name",
    "live room title",
    "judul ruang live",
    "judul",
    "livestream",
    "streaming",
    "live",
    "nama_brand",
    "brand",
  ]);
  const startIdx = findColIdx([
    "start time",
    "waktu mulai",
    "tanggal",
    "date",
    "waktu",
    "mulai",
    "start",
    "periode data",
    "periode",
  ]);
  const endIdx = findColIdx([
    "end time",
    "waktu selesai",
    "selesai",
    "finish time",
    "end",
    "periode akhir",
  ]);
  const durationIdx = headers.findIndex((h) => {
    if (!h) return false;
    const matchesDuration =
      h.includes("durasi") ||
      h.includes("duration") ||
      h.includes("lama") ||
      h.includes("waktu streaming");
    const looksLikeAvgViewDuration =
      h.includes("avg") || h.includes("average") || h.includes("viewing");
    return matchesDuration && !looksLikeAvgViewDuration;
  });
  const gmvIdx = findColIdx([
    "penjualan(pesanan siap dikirim)",
    "penjualan(pesanan dibuat)",
    "sales(orders paid)",
    "sales(orders created)",
    "penjualan",
    "attributed gmv",
    "gmv",
    "perolehan",
    "omset",
    "revenue",
    "pendapatan",
    "gross profit",
    "gross revenue",
    "total sales",
  ]);
  const productIdx = findColIdx([
    "produk terjual(pesanan siap dikirim)",
    "produk terjual(pesanan dibuat)",
    "items sold(orders paid)",
    "items sold(orders created)",
    "produk terjual",
    "attributed items sold",
    "unit terjual",
    "produk",
    "product",
    "terjual",
    "item",
    "items sold",
    "items",
  ]);
  const buyerIdx = findColIdx([
    "pembeli(pesanan siap dikirim)",
    "pembeli(pesanan dibuat)",
    "pembeli",
    "buyers(orders paid)",
    "buyers(orders created)",
    "buyers",
    "customers",
    "customer",
    "buyer",
    "pelanggan",
  ]);
  const aovIdx = findColIdx([
    "avg. price",
    "sales per buyer(orders paid)",
    "sales per buyer(orders created)",
    "sales per buyer",
    "aov",
    "average order value",
    "rata-rata",
    "order value",
  ]);
  const viewsIdx = findColIdx(["views", "view"]);
  const impressionsIdx = findColIdx([
    "dilihat",
    "total viewers",
    "live impressions",
    "tayangan live",
    "impression",
    "tayangan",
    "visitor",
    "traffic",
    "pemirsa",
    "exposure",
    "viewers",
  ]);
  const penontonIdx = findColIdx(["penonton", "unique viewers", "viewer"]);
  const liveVisitsIdx = findColIdx([
    "penonton aktif",
    "max concurrent viewers",
    "viewers(max concurrent)",
    "viewers(max co-current)",
    "highest ccu",
    "penonton serentak tertinggi",
    "live visits",
    "kunjungan live",
    "engaged viewers",
    "active viewers",
  ]);
  const productImpressionsIdx = findColIdx([
    "tayangan produk",
    "product views",
    "product impression",
    "product impressions",
  ]);
  const avgViewDurationIdx = findColIdx([
    "rata-rata durasi ditonton",
    "durasi ditonton",
    "durasi rata-rata menonton",
    "avg. watch duration",
    "average watch time",
    "watch duration",
    "avg view",
    "average view",
    "rata-rata menonton",
    "rata rata menonton",
    "waktu menonton",
    "rata-rata view",
    "avg. viewing duration",
    "avg viewing duration",
    "viewing duration",
  ]);
  const clicksIdx = findColIdx([
    "tambah ke keranjang",
    "add to cart",
    "keranjang",
    "product clicks",
    "klik produk",
    "clicks",
    "click",
    "klik",
    "kunjungan",
    "detail",
    "buka",
  ]);
  const ordersIdx = findColIdx([
    "pesanan(pesanan siap dikirim)",
    "pesanan(pesanan dibuat)",
    "orders(orders paid)",
    "orders(orders created)",
    "pesanan",
    "attributed sku orders",
    "attributed orders",
    "orders",
    "created",
    "buat pesanan",
    "order created",
    "pesanan dibuat",
  ]);
  const followersIdx = findColIdx([
    "pengikut baru dari livestream",
    "pengikut baru",
    "new followers",
    "pengikut",
    "follower",
    "followers",
    "fans",
  ]);
  const likesIdx = findColIdx(["suka", "likes", "like", "love"]);
  const sharesIdx = findColIdx(["dibagikan", "share", "shares", "bagikan", "sebar"]);
  const commentsIdx = findColIdx(["komentar", "comment", "komen", "comments"]);
  const peakViewersIdx = findColIdx([
    "penonton tertinggi",
    "peak viewers",
    "highest viewers",
  ]);
  const shopVouchersIdx = findColIdx([
    "voucher toko diklaim",
    "shop voucher claimed",
  ]);
  const specialVouchersIdx = findColIdx([
    "voucher spesial live diklaim",
    "special live voucher claimed",
  ]);
  const coinsClaimedIdx = findColIdx(["koin diklaim", "coins claimed"]);

  let isMonthFirst = false;
  let shouldSwapExcelDates = false;
  let definiteMatchFound = false;

  for (let r = headerRowIdx + 1; r < jsonData.length; r++) {
    const rowData = jsonData[r];
    if (!rowData || rowData.length === 0) continue;
    const rawStart = rowData[startIdx !== -1 ? startIdx : 0];

    if (rawStart && typeof rawStart === "number") {
      const dateObj = XLSX.SSF.parse_date_code(rawStart) as { d: number; m: number } | null;
      if (!dateObj) continue;
      if (dateObj.d > 12) {
        shouldSwapExcelDates = false;
        definiteMatchFound = true;
      } else if (dateObj.m > 12) {
        shouldSwapExcelDates = true;
        definiteMatchFound = true;
      }
    } else if (rawStart && typeof rawStart === "string") {
      const allMatches = rawStart.match(/\b(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})\b/g);
      if (allMatches) {
        for (const matchStr of allMatches) {
          const dtSplit = matchStr.split(/[\/\-]/);
          if (dtSplit.length !== 3) continue;

          let firstStr = dtSplit[0];
          let secondStr = dtSplit[1];
          if (dtSplit[0].length === 4) {
            firstStr = dtSplit[1];
            secondStr = dtSplit[2];
          }

          const first = parseInt(firstStr, 10);
          const second = parseInt(secondStr, 10);
          if (!Number.isNaN(first) && !Number.isNaN(second)) {
            if (first > 12) {
              isMonthFirst = false;
              shouldSwapExcelDates = false;
              definiteMatchFound = true;
            } else if (second > 12) {
              isMonthFirst = true;
              shouldSwapExcelDates = true;
              definiteMatchFound = true;
            }
          }
        }
      }
    }
  }

  if (!definiteMatchFound) {
    isMonthFirst = false;
    shouldSwapExcelDates = false;
  }

  const parseDateTimeToMs = (value: unknown) => {
    if (value === undefined || value === null || value === "") return 0;
    if (typeof value === "number") {
      const dateObj = XLSX.SSF.parse_date_code(value) as
        | { y: number; m: number; d: number; H: number; M: number; S?: number }
        | null;
      if (!dateObj) return 0;
      return new Date(
        dateObj.y,
        dateObj.m - 1,
        dateObj.d,
        dateObj.H || 0,
        dateObj.M || 0,
        dateObj.S || 0,
      ).getTime();
    }

    const normalized = parseDateString(String(value), isMonthFirst).replace(" ", "T");
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };

  const rows: ReportingRawRow[] = [];

  for (let r = headerRowIdx + 1; r < jsonData.length; r++) {
    const rowData = jsonData[r];
    if (!rowData || rowData.length === 0) continue;

    const titleRaw =
      titleIdx !== -1 ? String(rowData[titleIdx] || "") : String(rowData[0] || "");
    if (
      titleRaw.toLowerCase() === "total" ||
      titleRaw.toLowerCase().includes("ringkasan") ||
      titleRaw.toLowerCase() === "summary"
    ) {
      continue;
    }
    if (titleIdx !== -1 && !rowData[titleIdx]) continue;

    const title = titleRaw || `Stream ${r}`;
    const rawStart = rowData[startIdx !== -1 ? startIdx : 0];

    let formattedDate = "";
    let shift = "Shift Lainnya";
    if (rawStart) {
      if (typeof rawStart === "number") {
        formattedDate = parseExcelDateCode(rawStart, shouldSwapExcelDates);
        const hour = parseInt(formattedDate.slice(11, 13), 10);
        const matchedShift = getShiftFromHour(hour, shifts);
        if (matchedShift) shift = matchedShift;
      } else {
        formattedDate = parseDateString(String(rawStart), isMonthFirst);
        const timeMatch = formattedDate.match(/(\d{1,2}:\d{2})/);
        if (timeMatch) {
          const hour = parseInt(timeMatch[1], 10);
          if (!Number.isNaN(hour)) {
            const matchedShift = getShiftFromHour(hour, shifts);
            if (matchedShift) shift = matchedShift;
          }
        }
      }
    }

    const dateOnly = formattedDate.split(" ")[0] || formattedDate;

    let duration = 0;
    if (durationIdx !== -1) {
      const rawDur = String(rowData[durationIdx] || "");
      if (rawDur.includes(":")) {
        const parts = rawDur.split(":").map(Number);
        if (parts.length === 3) {
          duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          duration = parts[0] * 60 + parts[1];
        }
      } else {
        const safeFloat = parseFloat(rawDur.replace(/,/g, "."));
        if (!Number.isNaN(safeFloat)) {
          if (safeFloat > 0 && safeFloat < 1.0) {
            duration = Math.round(safeFloat * 86400);
          } else {
            duration = safeFloat;
          }
        }
      }
    }

    if (
      duration <= 0 &&
      startIdx !== -1 &&
      endIdx !== -1 &&
      rowData[startIdx] &&
      rowData[endIdx]
    ) {
      const startMs = parseDateTimeToMs(rowData[startIdx]);
      const endMs = parseDateTimeToMs(rowData[endIdx]);
      if (startMs > 0 && endMs > startMs) {
        duration = Math.round((endMs - startMs) / 1000);
      }
    }

    const gmv = gmvIdx !== -1 ? parseIndonesianNumber(rowData[gmvIdx]) : 0;
    const products_sold =
      productIdx !== -1 ? parseIndonesianNumber(rowData[productIdx]) : 0;

    const parsedImpressions =
      impressionsIdx !== -1 ? parseIndonesianNumber(rowData[impressionsIdx]) : 0;
    const parsedViews = viewsIdx !== -1 ? parseIndonesianNumber(rowData[viewsIdx]) : 0;
    const parsedPenonton =
      penontonIdx !== -1 ? parseIndonesianNumber(rowData[penontonIdx]) : 0;
    const parsedLiveVisits =
      liveVisitsIdx !== -1 ? parseIndonesianNumber(rowData[liveVisitsIdx]) : 0;
    const parsedProductImpressions =
      productImpressionsIdx !== -1
        ? parseIndonesianNumber(rowData[productImpressionsIdx])
        : 0;
    const parsedClicks = clicksIdx !== -1 ? parseIndonesianNumber(rowData[clicksIdx]) : 0;
    const parsedOrders = ordersIdx !== -1 ? parseIndonesianNumber(rowData[ordersIdx]) : 0;
    const orders = parsedOrders || 0;

    const buyers =
      buyerIdx !== -1 ? parseIndonesianNumber(rowData[buyerIdx]) : parsedOrders;

    const parsedAov = aovIdx !== -1 ? parseIndonesianNumber(rowData[aovIdx]) : 0;
    const aov =
      parsedOrders > 0
        ? gmv / parsedOrders
        : parsedAov > 0
          ? parsedAov
          : buyers > 0
            ? gmv / buyers
            : 0;

    const parsedFollowers =
      followersIdx !== -1 ? parseIndonesianNumber(rowData[followersIdx]) : 0;
    const parsedLikes = likesIdx !== -1 ? parseIndonesianNumber(rowData[likesIdx]) : 0;
    const parsedShares = sharesIdx !== -1 ? parseIndonesianNumber(rowData[sharesIdx]) : 0;
    const parsedComments =
      commentsIdx !== -1 ? parseIndonesianNumber(rowData[commentsIdx]) : 0;
    const parsedPeakViewers =
      peakViewersIdx !== -1 ? parseIndonesianNumber(rowData[peakViewersIdx]) : 0;
    const parsedShopVouchers =
      shopVouchersIdx !== -1 ? parseIndonesianNumber(rowData[shopVouchersIdx]) : 0;
    const parsedSpecialVouchers =
      specialVouchersIdx !== -1 ? parseIndonesianNumber(rowData[specialVouchersIdx]) : 0;
    const parsedCoinsClaimed =
      coinsClaimedIdx !== -1 ? parseIndonesianNumber(rowData[coinsClaimedIdx]) : 0;

    const rawAvgViewDuration =
      avgViewDurationIdx !== -1 ? rowData[avgViewDurationIdx] : "";
    let parsedAvgViewDuration = 0;
    if (typeof rawAvgViewDuration === "number") {
      parsedAvgViewDuration =
        rawAvgViewDuration > 0 && rawAvgViewDuration < 1
          ? Math.round(rawAvgViewDuration * 86400)
          : Math.round(rawAvgViewDuration);
    } else {
      const rawAvgViewDurationStr = String(rawAvgViewDuration || "");
      if (rawAvgViewDurationStr.includes(":")) {
        const parts = rawAvgViewDurationStr.split(":").map(Number);
        if (parts.length === 3) {
          parsedAvgViewDuration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          parsedAvgViewDuration = parts[0] * 60 + parts[1];
        }
      } else {
        const numericAvgViewDuration =
          parseFloat(rawAvgViewDurationStr.replace(/[^0-9.]/g, "")) || 0;
        parsedAvgViewDuration =
          numericAvgViewDuration > 0 && numericAvgViewDuration < 1
            ? Math.round(numericAvgViewDuration * 86400)
            : Math.round(numericAvgViewDuration);
      }
    }

    const fileLevelAvgView = parsedAvgViewDuration;

    const impressions = parsedImpressions || 0;
    const views = parsedViews || parsedImpressions || 0;
    const penonton = parsedPenonton || parsedImpressions || 0;
    const clicks = parsedClicks || 0;
    const liveVisits = parsedLiveVisits || 0;
    const productImpressions = parsedProductImpressions || 0;
    const followers = parsedFollowers || 0;
    const likes = parsedLikes || 0;
    const shares = parsedShares || 0;
    const comments = parsedComments || 0;
    const avgViewDuration = fileLevelAvgView || 0;
    const peakViewers = parsedPeakViewers || 0;
    const shopVouchers = parsedShopVouchers || 0;
    const specialVouchers = parsedSpecialVouchers || 0;
    const coinsClaimed = parsedCoinsClaimed || 0;
    const hasFunnelInFile = parsedImpressions > 0 || parsedClicks > 0 || parsedOrders > 0;

    rows.push({
      title,
      date: dateOnly,
      dateTime: formattedDate,
      shift,
      duration,
      gmv,
      products_sold,
      buyers,
      aov,
      views,
      impressions,
      penonton,
      liveVisits,
      productImpressions,
      clicks,
      orders,
      followers,
      likes,
      shares,
      comments,
      avgViewDuration,
      peakViewers,
      shopVouchers,
      specialVouchers,
      coinsClaimed,
      hasFunnelInFile,
    });
  }

  return rows;
}
