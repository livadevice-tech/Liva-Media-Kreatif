const fs = require('fs');

let fileContent = fs.readFileSync('src/shared/utils/xlsxUploadParsers.ts', 'utf8');

// Modify the function signature
fileContent = fileContent.replace(
  'export function validateReportingHeaders(\n  jsonData: WorksheetRows,\n  platform: string,\n): string[] {',
  'export function validateReportingHeaders(\n  jsonData: WorksheetRows,\n  platform: string,\n  uploadTargetTab: "live" | "engagement" | "all" = "all"\n): string[] {'
);

// Define the new Shopee validation blocks
const newShopeeValidation = `  } else if (isShopee) {
    if (uploadTargetTab === "live" || uploadTargetTab === "all") {
      if (findColIdx(["penjualan(pesanan siap dikirim)", "penjualan(pesanan dibuat)"]) === -1) missingCols.push("Metrik: GMV (Kolom: Penjualan(Pesanan Siap Dikirim))");
      if (findColIdx(["pesanan(pesanan siap dikirim)", "pesanan(pesanan dibuat)"]) === -1) missingCols.push("Metrik: Orders (Kolom: Pesanan(Pesanan Siap Dikirim))");
      if (findColIdx(["produk terjual(pesanan siap dikirim)", "produk terjual(pesanan dibuat)"]) === -1) missingCols.push("Metrik: Item Sold (Kolom: Produk Terjual(Pesanan Siap Dikirim))");
      if (findColIdx(["tambah ke keranjang"]) === -1) missingCols.push("Metrik: Add to Cart (Kolom: Tambah ke Keranjang)");
      if (findColIdx(["durasi rata-rata menonton"]) === -1) missingCols.push("Metrik: Avg View Duration (Kolom: Durasi Rata-Rata Menonton)");
      if (findColIdx(["penonton aktif"]) === -1) missingCols.push("Metrik: Viewer Active (Kolom: Penonton Aktif)");
    }
    
    if (uploadTargetTab === "engagement" || uploadTargetTab === "all") {
      if (findColIdx(["pembeli(pesanan siap dikirim)", "pembeli(pesanan dibuat)"]) === -1) missingCols.push("Metrik: Customer (Kolom: Pembeli(Pesanan Siap Dikirim))");
      if (findColIdx(["dilihat"]) === -1) missingCols.push("Metrik: Views (Kolom: Dilihat)");
      if (findColIdx(["penonton tertinggi"]) === -1) missingCols.push("Metrik: Peak Viewer (Kolom: Penonton Tertinggi)");
      if (findColIdx(["voucher toko diklaim"]) === -1) missingCols.push("Metrik: Voucher Claim (Kolom: Voucher Toko Diklaim)");
      if (findColIdx(["suka"]) === -1) missingCols.push("Metrik: Likes (Kolom: Suka)");
      if (findColIdx(["komentar"]) === -1) missingCols.push("Metrik: Comments (Kolom: Komentar)");
      if (findColIdx(["share"]) === -1) missingCols.push("Metrik: Shares (Kolom: Share)");
    }
  }`;

// Use regex to replace the old Shopee validation block
const shopeeBlockRegex = /\} else if \(isShopee\) \{[\s\S]*?\}\s*return missingCols;/;
fileContent = fileContent.replace(shopeeBlockRegex, newShopeeValidation + '\n\n  return missingCols;');

fs.writeFileSync('src/shared/utils/xlsxUploadParsers.ts', fileContent, 'utf8');
console.log('Modified validation in xlsxUploadParsers.ts');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  'validateReportingHeaders(jsonData, detectedPlatform || "");',
  'validateReportingHeaders(jsonData, detectedPlatform || "", uploadTargetTab);'
);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
console.log('Modified validation call in App.tsx');

