const fs = require('fs');

let fileContent = fs.readFileSync('src/shared/utils/xlsxUploadParsers.ts', 'utf8');

// The replacement logic:
const newStrictFilterLogic = `
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
    
    let finalPenonton = parsedPenonton || finalImpressions || 0;
    let finalProductImpressions = parsedProductImpressions || 0;
    let finalFollowers = parsedFollowers || 0;
    let finalSpecialVouchers = parsedSpecialVouchers || 0;
    let finalCoinsClaimed = parsedCoinsClaimed || 0;

    if (isShopee) {
      if (uploadTargetTab === "live") {
        // Only keep Live/Sales metrics, zero out everything else
        finalViews = 0;
        finalPeakViewers = 0;
        finalShopVouchers = 0;
        finalBuyers = 0;
        finalLikes = 0;
        finalComments = 0;
        finalShares = 0;
        finalImpressions = 0;
        finalPenonton = 0;
        finalProductImpressions = 0;
        finalFollowers = 0;
        finalSpecialVouchers = 0;
        finalCoinsClaimed = 0;
      } else if (uploadTargetTab === "engagement") {
        // Only keep Engagement metrics, zero out everything else
        finalGmv = 0;
        finalProductsSold = 0;
        finalOrders = 0;
        finalClicks = 0;
        finalAvgViewDuration = 0;
        finalLiveVisits = 0;
        finalPenonton = 0;
        finalProductImpressions = 0;
        finalFollowers = 0;
        finalSpecialVouchers = 0;
        finalCoinsClaimed = 0;
      }
    }

    const finalAov = finalOrders > 0 ? finalGmv / finalOrders : parsedAov > 0 ? parsedAov : finalBuyers > 0 ? finalGmv / finalBuyers : 0;
    const impressions = finalImpressions;
    const views = finalViews;
    const penonton = finalPenonton;
    const clicks = finalClicks;
    const liveVisits = finalLiveVisits;
    const productImpressions = finalProductImpressions;
    const followers = finalFollowers;
    const likes = finalLikes;
    const shares = finalShares;
    const comments = finalComments;
    const avgViewDuration = finalAvgViewDuration;
    const peakViewers = finalPeakViewers;
    const shopVouchers = finalShopVouchers;
    const specialVouchers = finalSpecialVouchers;
    const coinsClaimed = finalCoinsClaimed;
    const hasFunnelInFile = impressions > 0 || clicks > 0 || finalOrders > 0;
`;

// Replace from 'const isShopee =' up to 'const hasFunnelInFile ='
fileContent = fileContent.replace(
  /const isShopee = platform\.toLowerCase\(\)\.includes\("shopee"\);[\s\S]*?const hasFunnelInFile = impressions > 0 \|\| clicks > 0 \|\| finalOrders > 0;/,
  newStrictFilterLogic
);

fs.writeFileSync('src/shared/utils/xlsxUploadParsers.ts', fileContent, 'utf8');
console.log('Modified parseReportingUploadRows strictly filter ALL columns');
