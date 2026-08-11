export interface BrandLike {
  id: string;
  name?: string | null;
}

export function detectBrandFromFilename(
  fileName: string,
  brands: readonly BrandLike[],
) {
  const fileNameLower = fileName.toLowerCase();

  // 1. Prioritas Pertama: Exact match (contoh: "Sumber Ayu" ada utuh di filename)
  for (const brand of brands) {
    const brandNameLower = (brand.name || "").toLowerCase();
    if (brandNameLower && fileNameLower.includes(brandNameLower)) {
      return brand;
    }
  }

  // 2. Prioritas Kedua: Match tanpa spasi/simbol (contoh: "sumber_ayu" di file cocok dengan "sumberayu" brand)
  const fileNameClean = fileNameLower.replace(/[^a-z0-9]/g, "");
  for (const brand of brands) {
    const brandNameClean = (brand.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (brandNameClean && fileNameClean.includes(brandNameClean)) {
      return brand;
    }
  }

  return null;
}

export function detectPlatformFromFilename(fileName: string) {
  const fileNameLower = fileName.toLowerCase();

  if (fileNameLower.includes("tiktok")) return "TikTok Live";
  if (fileNameLower.includes("shopee")) return "Shopee Live";
  if (fileNameLower.includes("tokopedia") || fileNameLower.includes("tokoped")) {
    return "Tokopedia";
  }
  if (fileNameLower.includes("lazada") || fileNameLower.includes("laz")) {
    return "Lazada";
  }

  return "";
}

export function detectReportingPlatformFromHeaders(headers: readonly string[]) {
  const normalizedHeaders = headers.map((h) => h.toLowerCase());

  if (
    normalizedHeaders.some(
      (h) =>
        h.includes("tiktok") ||
        h.includes("attributed") ||
        h.includes("product impressions") ||
        h.includes("product clicks"),
    )
  ) {
    return "TikTok Live";
  }

  if (normalizedHeaders.some((h) => h.includes("shopee"))) {
    return "Shopee Live";
  }

  if (
    normalizedHeaders.some(
      (h) =>
        h.includes("live room") ||
        h.includes("judul ruang live") ||
        h.includes("highest ccu") ||
        h.includes("penonton serentak tertinggi") ||
        h.includes("anchor") ||
        h.includes("uid") ||
        h.includes("live impressions") ||
        h.includes("attributed gmv") ||
        h.includes("product impressions"),
    )
  ) {
    return "TikTok Live";
  }

  if (
    normalizedHeaders.some(
      (h) =>
        h.includes("username pembeli") ||
        h.includes("live id") ||
        h.includes("nama produk") ||
        h.includes("nama livestream") ||
        h.includes("livestream name") ||
        h.includes("tambah ke keranjang") ||
        h.includes("penonton aktif") ||
        h.includes("pesanan(pesanan dibuat)") ||
        h.includes("max concurrent viewers") ||
        h.includes("orders(orders paid)"),
    )
  ) {
    return "Shopee Live";
  }

  return "";
}

export function findReportingUploadHeaderRowIndex(
  rows: readonly unknown[][],
): number {
  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 50); rowIndex += 1) {
    const row = rows[rowIndex];
    if (
      row &&
      row.some((cell) => {
        if (typeof cell !== "string") return false;
        const cLower = cell.toLowerCase().trim();

        if (
          cLower === "interaksi" ||
          cLower === "promosi" ||
          cLower === "konversi" ||
          cLower === "data utama"
        ) {
          const nonEmptyStringCols = row.filter(
            (value) => typeof value === "string" && value.trim().length > 0,
          ).length;
          if (nonEmptyStringCols < 8) return false;
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
      })
    ) {
      return rowIndex;
    }
  }

  return -1;
}
