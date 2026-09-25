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

  // TikTok identifiers (both English and Indonesian)
  if (
    normalizedHeaders.some(
      (h) =>
        h.includes("tiktok") ||
        h.includes("attributed") ||
        h.includes("teratribusi") ||
        h.includes("product impressions") ||
        h.includes("product clicks") ||
        h.includes("live room") ||
        h.includes("judul ruang live") ||
        h.includes("live impressions") ||
        h.includes("tayangan langsung") ||
        h.includes("tayangan live") ||
        h.includes("highest ccu") ||
        h.includes("anchor") ||
        h.includes("uid"),
    )
  ) {
    return "TikTok Live";
  }

  // Shopee identifiers (both English and Indonesian)
  if (
    normalizedHeaders.some(
      (h) =>
        h.includes("shopee") ||
        h.includes("pesanan(pesanan") ||
        h.includes("orders(orders") ||
        h.includes("penjualan(pesanan") ||
        h.includes("sales(orders") ||
        h.includes("produk terjual(pesanan") ||
        h.includes("items sold(orders") ||
        h.includes("pembeli(pesanan") ||
        h.includes("buyers(orders") ||
        h.includes("tambah ke keranjang") ||
        h.includes("add to cart") ||
        h.includes("penonton aktif") ||
        h.includes("active viewers") ||
        h.includes("durasi rata-rata menonton") ||
        h.includes("rata-rata durasi ditonton") ||
        h.includes("avg. watch duration") ||
        h.includes("penonton tertinggi") ||
        h.includes("peak viewers") ||
        h.includes("voucher toko diklaim") ||
        h.includes("shop voucher claimed") ||
        h.includes("waktu mulai streaming") ||
        h.includes("streaming start time") ||
        h.includes("max concurrent viewers") ||
        h.includes("username pembeli") ||
        h.includes("live id"),
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
          // Indonesian keywords
          cLower.includes("streaming") ||
          cLower.includes("mulai") ||
          cLower.includes("selesai") ||
          cLower.includes("gmv") ||
          cLower.includes("user id") ||
          cLower.includes("penonton") ||
          cLower.includes("penonton aktif") ||
          cLower.includes("produk terjual") ||
          cLower.includes("pesanan") ||
          cLower.includes("pembeli") ||
          cLower.includes("keranjang") ||
          cLower.includes("suka") ||
          cLower.includes("komentar") ||
          cLower.includes("dibagikan") ||
          cLower.includes("pengikut") ||
          cLower.includes("voucher") ||
          cLower.includes("durasi") ||
          cLower.includes("periode") ||
          // English keywords
          cLower.includes("room title") ||
          cLower.includes("start time") ||
          cLower.includes("end time") ||
          cLower.includes("duration") ||
          cLower.includes("attributed") ||
          cLower.includes("sales") ||
          cLower.includes("orders") ||
          cLower.includes("items sold") ||
          cLower.includes("customers") ||
          cLower.includes("buyers") ||
          cLower.includes("impressions") ||
          cLower.includes("views") ||
          cLower.includes("viewers") ||
          cLower.includes("likes") ||
          cLower.includes("comments") ||
          cLower.includes("shares") ||
          cLower.includes("followers") ||
          cLower.includes("add to cart") ||
          cLower.includes("cart") ||
          cLower.includes("product clicks") ||
          cLower.includes("product impressions") ||
          cLower.includes("peak")
        );
      })
    ) {
      return rowIndex;
    }
  }

  return -1;
}
