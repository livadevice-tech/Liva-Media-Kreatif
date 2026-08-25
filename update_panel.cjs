const fs = require('fs');

const path = 'src/components/reporting/ReportBrandSelectionPanel.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Recharts import if missing
if (!code.includes('import { AreaChart')) {
  code = code.replace(
    'import { Fragment, type KeyboardEvent, useState } from "react";',
    'import { Fragment, type KeyboardEvent, useState } from "react";\nimport { AreaChart, Area, ResponsiveContainer } from "recharts";'
  );
}

// 2. Add MobileReportBrandCard component before ReportBrandSelectionPanel
const mobileCardCode = `
function MobileReportBrandCard({
  row,
  openBrandCardActionsId,
  onBrandSelect,
  onToggleBrandCardActions,
  onDeleteAllBrandRawData,
  onDeleteBrandDataByDateRange,
}: {
  row: ReportBrandRowView;
  openBrandCardActionsId: string | null;
  onBrandSelect: (brandId: string) => void;
  onToggleBrandCardActions: (brandId: string) => void;
  onDeleteAllBrandRawData: (brandId: string, brandName: string, platform?: string) => void;
  onDeleteBrandDataByDateRange?: (brandId: string, brandName: string) => void;
}) {
  const brand = row.brand;
  const brandPlatforms = row.platforms;
  const isActionsOpen = openBrandCardActionsId === brand.id;
  const primaryPlatform = row.platforms.length > 0 ? row.platforms.join(" / ") : "TOTAL ONLINE SALES";
  
  // Format percentage
  const percentChange = row.percentChange || 0;
  const isPositive = percentChange >= 0;
  const formattedPercent = Math.abs(percentChange).toFixed(2).replace('.', ',') + '%';

  // Format GMV
  const formattedGmv = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(row.totalGmv);

  // Fill chart with dummy data if not enough
  const chartData = (row.monthlyTrend && row.monthlyTrend.length > 1) ? row.monthlyTrend : [
    { label: 'Jun', value: row.totalGmv * 0.4 },
    { label: 'Jul', value: row.totalGmv * 0.6 },
    { label: 'Aug', value: row.totalGmv * 0.5 },
    { label: 'Sep', value: row.totalGmv * 0.8 },
    { label: 'Oct', value: row.totalGmv * 0.9 },
    { label: 'Nov', value: row.totalGmv }
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onBrandSelect(brand.id)}
      className="md:hidden group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
    >
      {/* Top Header: Logo, Title, Date, Menu */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 overflow-hidden items-center justify-center rounded-2xl bg-slate-100 text-sm font-black uppercase text-slate-700">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
            ) : (
              brand.name.substring(0, 2)
            )}
          </div>
          <div>
            <h4 className="text-[13px] font-black uppercase text-slate-800 leading-tight">
              {brand.name}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">
              {row.latestActivity ? new Date(row.latestActivity).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : "Belum ada data"}
            </span>
          </div>
        </div>

        <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
           <button
             type="button"
             onClick={() => onToggleBrandCardActions(brand.id)}
             className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
           >
             <MoreHorizontal className="size-5" />
           </button>
           {isActionsOpen && (
             <div className="absolute right-0 top-10 z-30 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onBrandSelect(brand.id);
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Buka Dashboard
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    const pwd = brand.clientPassword || "liva123";
                    navigator.clipboard.writeText(pwd);
                    alert("Password portal " + brand.name + " berhasil disalin: " + pwd);
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                >
                  Salin Password Portal
                </button>
                {brandPlatforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteAllBrandRawData(brand.id, brand.name, platform);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Hapus Data {platform}
                  </button>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Title & GMV */}
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {primaryPlatform}
          </span>
          <div className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
            {formattedGmv}
          </div>
        </div>
        
        {/* Percentage Badge */}
        <div className={\`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black \${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}\`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{formattedPercent}</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-24 w-full mt-2 -ml-2 relative z-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={"colorUv" + brand.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill={"url(#colorUv" + brand.id + ")"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* X Axis Labels */}
      <div className="flex justify-between items-center px-2 mt-2 text-[10px] font-bold text-slate-400">
        {chartData.map((d, i) => (
           <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
`;

code = code.replace(
  'export function ReportBrandSelectionPanel',
  mobileCardCode + '\nexport function ReportBrandSelectionPanel'
);

// 3. Hide old card on mobile, show on desktop
code = code.replace(
  'className="group relative flex min-h-56 min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"',
  'className="hidden md:flex group relative min-h-56 min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"'
);

// 4. Render Mobile card
const mobileCardRender = `
              <MobileReportBrandCard
                row={row}
                openBrandCardActionsId={openBrandCardActionsId}
                onBrandSelect={onBrandSelect}
                onToggleBrandCardActions={onToggleBrandCardActions}
                onDeleteAllBrandRawData={onDeleteAllBrandRawData}
                onDeleteBrandDataByDateRange={onDeleteBrandDataByDateRange}
              />
              <ReportBrandCard
                row={row}
`;
code = code.replace(
  '              <ReportBrandCard\n                row={row}',
  mobileCardRender
);

fs.writeFileSync(path, code);
