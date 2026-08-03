const fs = require('fs');

let fileContent = fs.readFileSync('src/shared/utils/xlsxUploadParsers.ts', 'utf8');

// Modify the function signature of parseReportingUploadRows
fileContent = fileContent.replace(
  'export function parseReportingUploadRows(\n  jsonData: WorksheetRows,\n  shifts: readonly string[],\n  platform: string = "",\n): ReportingRawRow[] {',
  'export function parseReportingUploadRows(\n  jsonData: WorksheetRows,\n  shifts: readonly string[],\n  platform: string = "",\n  uploadTargetTab: "live" | "engagement" | "all" = "all"\n): ReportingRawRow[] {'
);

// Find the section where data is pushed to rows array
const replaceTarget = /const impressions = parsedImpressions \|\| 0;/;
const strictFilterLogic = `
    const isShopee = platform.toLowerCase().includes("shopee");
    
    // Strict parsing based on target tab for Shopee
    let finalGmv = gmv;
    let finalProductsSold = products_sold;
    let finalOrders = parsedOrders || 0;
    let finalClicks = parsedClicks || 0;
    let finalAvgViewDuration = fileLevelAvgView || 0;
    let finalLiveVisits = parsedLiveVisits || 0;
    
    let finalViews = parsedViews || parsedImpressions || 0;
    let finalPeakViewers = parsedPeakViewers || 0;
    let finalShopVouchers = parsedShopVouchers || 0;
    let finalBuyers = buyers;
    let finalLikes = parsedLikes || 0;
    let finalComments = parsedComments || 0;
    let finalShares = parsedShares || 0;
    let finalImpressions = parsedImpressions || 0;

    if (isShopee) {
      if (uploadTargetTab === "live") {
        // Only keep Live/Sales metrics, zero out Engagement metrics
        finalViews = 0;
        finalPeakViewers = 0;
        finalShopVouchers = 0;
        finalBuyers = 0;
        finalLikes = 0;
        finalComments = 0;
        finalShares = 0;
        finalImpressions = 0;
      } else if (uploadTargetTab === "engagement") {
        // Only keep Engagement metrics, zero out Live/Sales metrics
        finalGmv = 0;
        finalProductsSold = 0;
        finalOrders = 0;
        finalClicks = 0;
        finalAvgViewDuration = 0;
        finalLiveVisits = 0;
      }
    }

    const aov = finalOrders > 0 ? finalGmv / finalOrders : parsedAov > 0 ? parsedAov : finalBuyers > 0 ? finalGmv / finalBuyers : 0;
    const impressions = finalImpressions;
    const views = finalViews;
    const penonton = parsedPenonton || finalImpressions || 0;
    const clicks = finalClicks;
    const liveVisits = finalLiveVisits;
    const productImpressions = parsedProductImpressions || 0;
    const followers = parsedFollowers || 0;
    const likes = finalLikes;
    const shares = finalShares;
    const comments = finalComments;
    const avgViewDuration = finalAvgViewDuration;
    const peakViewers = finalPeakViewers;
    const shopVouchers = finalShopVouchers;
    const specialVouchers = parsedSpecialVouchers || 0;
    const coinsClaimed = parsedCoinsClaimed || 0;
    const hasFunnelInFile = impressions > 0 || clicks > 0 || finalOrders > 0;

    rows.push({
      title,
      date: dateOnly,
      dateTime: formattedDate,
      shift,
      duration,
      gmv: finalGmv,
      products_sold: finalProductsSold,
      buyers: finalBuyers,
      aov,
      views,
      impressions,
      penonton,
      liveVisits,
      productImpressions,
      clicks,
      orders: finalOrders,
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
    continue; // Skip the old rows.push block by continuing the loop
`;

// Replace from 'const impressions =' up to '});' with our new logic
fileContent = fileContent.replace(
  /const impressions = parsedImpressions \|\| 0;[\s\S]*?rows\.push\(\{[\s\S]*?hasFunnelInFile,[\s\S]*?\}\);/,
  strictFilterLogic
);

fs.writeFileSync('src/shared/utils/xlsxUploadParsers.ts', fileContent, 'utf8');
console.log('Modified parseReportingUploadRows strictly filter columns');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Also update the confirmation logic in App.tsx
// We need to change the success path to show an alert asking for confirmation too.
appContent = appContent.replace(
  /const missingCols = validateReportingHeaders\(jsonData, detectedPlatform \|\| "", uploadTargetTab\);[\s\S]*?\} catch \(err\) \{/g,
  `const missingCols = validateReportingHeaders(jsonData, detectedPlatform || "", uploadTargetTab);
      if (missingCols.length > 0) {
        requestConfirm(
          "Peringatan: Kolom Standar Tidak Lengkap",
          \`Beberapa kolom standar metrik \${detectedPlatform || "platform ini"} tidak ditemukan di file Excel Anda:\\n\\n\` + 
          \`- \${missingCols.join("\\n- ")}\\n\\n\` +
          \`Jika Anda melanjutkan, data untuk metrik tersebut akan otomatis diisi dengan angka 0. Apakah Anda ingin tetap melanjutkan?\`,
          () => {
            const reportingRows = parseReportingUploadRows(jsonData, shifts, detectedPlatform || "", uploadTargetTab);
            setReportingRawData(reportingRows);
          },
          "warning"
        );
      } else {
        requestConfirm(
          "Data Lengkap: Semua Metrik Ditemukan",
          "Semua metrik wajib berhasil dibaca dari file Excel. Apakah Anda yakin ingin memproses dan menampilkan data ini ke tabel preview?",
          () => {
            const reportingRows = parseReportingUploadRows(jsonData, shifts, detectedPlatform || "", uploadTargetTab);
            setReportingRawData(reportingRows);
          },
          "success"
        );
      }
    } catch (err) {`
);

fs.writeFileSync('src/App.tsx', appContent, 'utf8');
console.log('Modified App.tsx to show success alert & strict parse parameter');

