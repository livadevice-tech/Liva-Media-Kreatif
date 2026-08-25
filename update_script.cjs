const fs = require('fs');

const path = 'src/shared/utils/reportBrandSummary.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Update interface
code = code.replace(
  'hasData: boolean;\n}',
  'hasData: boolean;\n  monthlyTrend: { label: string; value: number }[];\n  percentChange: number;\n}'
);

// 2. Add computation in buildReportBrandSummary
const replacement = `
      // Calculate monthly trend (last 6 months)
      const monthlyData: Record<string, number> = {};
      sessionLogs.forEach(log => {
        const dateStr = log.date || log.dateTime || log.uploadedAt;
        if (dateStr) {
          try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              const monthLabel = d.toLocaleString('id-ID', { month: 'short' });
              const yearMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
              if (!monthlyData[yearMonth]) monthlyData[yearMonth] = 0;
              monthlyData[yearMonth] += (log.gmv || 0);
            }
          } catch(e) {}
        }
      });
      
      const sortedMonths = Object.keys(monthlyData).sort();
      // take last 6
      const recentMonths = sortedMonths.slice(-6);
      
      // format to {label, value}
      const monthlyTrend = recentMonths.map(ym => {
        const [year, m] = ym.split('-');
        const d = new Date(parseInt(year), parseInt(m) - 1, 1);
        return {
          label: d.toLocaleString('en-US', { month: 'short' }), // "Jun", "Jul" as requested
          value: monthlyData[ym]
        };
      });

      // Calculate percentChange between last month and previous month
      let percentChange = 0;
      if (recentMonths.length >= 2) {
        const lastMonthVal = monthlyData[recentMonths[recentMonths.length - 1]];
        const prevMonthVal = monthlyData[recentMonths[recentMonths.length - 2]];
        if (prevMonthVal > 0) {
          percentChange = ((lastMonthVal - prevMonthVal) / prevMonthVal) * 100;
        } else if (lastMonthVal > 0) {
          percentChange = 100; // From 0 to something
        }
      }

      return {
        brand,
        sessionCount: sessionLogs.length,
        batchCount: batchLogs.length,
        totalGmv: totalGmvForBrand,
        platforms,
        latestActivity,
        hasData: sessionLogs.length > 0 || batchLogs.length > 0,
        monthlyTrend,
        percentChange
      };
`;

code = code.replace(
  `      return {
        brand,
        sessionCount: sessionLogs.length,
        batchCount: batchLogs.length,
        totalGmv: totalGmvForBrand,
        platforms,
        latestActivity,
        hasData: sessionLogs.length > 0 || batchLogs.length > 0,
      };`,
  replacement
);

fs.writeFileSync(path, code);
