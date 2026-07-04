import type { ReportingRawRow } from "../../shared/types/reporting";
import {
  buildReportingUploadPreviewGroups,
  type ShopeeRawTab,
} from "../../shared/utils/reportingUploadPreview";
import {
  formatReportingPreviewCvr,
  formatReportingPreviewCtr,
  formatReportingPreviewDate,
  formatReportingPreviewDurationMinutes,
  formatReportingPreviewGroupDuration,
  formatReportingPreviewRate,
  formatReportingPreviewShopeeRawDate,
  formatReportingPreviewShopeeTime,
} from "../../shared/utils/reportingUploadPreviewFormatters";

type ReportingUploadPreviewTableProps = {
  reportingRawData: readonly ReportingRawRow[];
  saveTargetPlatform: string;
  uploadTargetTab: "live" | "engagement";
  shopeeRawTab: ShopeeRawTab;
  rawDateSortAsc: boolean;
  onRawDateSortToggle: () => void;
  shifts: readonly string[];
};

const idFormat = new Intl.NumberFormat("id-ID");

export function ReportingUploadPreviewTable({
  reportingRawData,
  saveTargetPlatform,
  uploadTargetTab,
  shopeeRawTab,
  rawDateSortAsc,
  onRawDateSortToggle,
  shifts,
}: ReportingUploadPreviewTableProps) {
  const isShopeeLive = saveTargetPlatform === "Shopee Live";
  const isTikTokLive = saveTargetPlatform === "TikTok Live";
  const isShopeeRawTab = isShopeeLive && shopeeRawTab === "raw";
  const shopeeGroupRows =
    isShopeeLive && uploadTargetTab === "live" && shopeeRawTab !== "raw"
      ? buildReportingUploadPreviewGroups(
          reportingRawData,
          shopeeRawTab,
          shifts,
          rawDateSortAsc,
        )
      : [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            {uploadTargetTab === "engagement" ? (
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th
                  className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={onRawDateSortToggle}
                >
                  <div className="flex items-center gap-1">
                    Waktu Sesi
                    {rawDateSortAsc ? (
                      <span className="text-indigo-500">↑</span>
                    ) : (
                      <span className="text-slate-400">↓</span>
                    )}
                  </div>
                </th>
                <th className="px-5 py-4">Streaming / Akun</th>
                <th className="px-5 py-4 text-right">Tayangan Sesi</th>
                <th className="px-5 py-4 text-right">Likes</th>
                <th className="px-5 py-4 text-right">Comments / Shares</th>
                <th className="px-5 py-4 text-right">New Followers</th>
                <th className="px-5 py-4 text-right">Voucher & Koin</th>
                <th className="px-5 py-4 text-right">ERR %</th>
              </tr>
            ) : isShopeeLive ? (
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {shopeeRawTab !== "raw" ? (
                  <>
                    <th
                      className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={onRawDateSortToggle}
                    >
                      <div className="flex items-center gap-1">
                        {shopeeRawTab === "day"
                          ? "Tanggal"
                          : shopeeRawTab === "shift"
                            ? "Shift"
                            : "Hari"}
                        {rawDateSortAsc ? (
                          <span className="text-indigo-500">↑</span>
                        ) : (
                          <span className="text-slate-400">↓</span>
                        )}
                      </div>
                    </th>
                    <th className="px-5 py-4">Durasi</th>
                  </>
                ) : (
                  <>
                    <th
                      className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={onRawDateSortToggle}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {rawDateSortAsc ? (
                          <span className="text-indigo-500">↑</span>
                        ) : (
                          <span className="text-slate-400">↓</span>
                        )}
                      </div>
                    </th>
                    <th className="px-5 py-4">Start</th>
                  </>
                )}
                <th className="px-5 py-4 text-right">Viewers</th>
                <th className="px-5 py-4 text-right">GMV</th>
                <th className="px-5 py-4 text-right">Item Sold</th>
                <th className="px-5 py-4 text-right">Customer</th>
                <th className="px-5 py-4 text-right">Convertion Rate</th>
              </tr>
            ) : (
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th
                  className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={onRawDateSortToggle}
                >
                  <div className="flex items-center gap-1">
                    Waktu Mulai
                    {rawDateSortAsc ? (
                      <span className="text-indigo-500">↑</span>
                    ) : (
                      <span className="text-slate-400">↓</span>
                    )}
                  </div>
                </th>
                <th className="px-5 py-4">Streaming / Akun</th>
                <th className="px-5 py-4 text-right">Durasi (Mnt)</th>
                <th className="px-5 py-4 text-right">Perolehan GMV</th>
                <th className="px-5 py-4 text-right">Produk Terjual</th>
                <th className="px-5 py-4 text-right">Pembeli (Orders)</th>
                <th className="px-5 py-4 text-right">Rasio CTR / CVR</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(() => {
              if (shopeeGroupRows.length > 0) {
                return shopeeGroupRows.map((g, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-800">
                        {g.label}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-slate-500">
                        {formatReportingPreviewGroupDuration(g.duration)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-bold text-slate-700">
                        {idFormat.format(g.penonton)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-emerald-600">
                        Rp{idFormat.format(g.gmv)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-bold text-slate-700">
                        {idFormat.format(g.products_sold)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-indigo-600">
                        {idFormat.format(g.orders)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-indigo-600">
                        {g.penonton > 0 ? ((g.orders / g.penonton) * 100).toFixed(2) : "0.00"}%
                      </td>
                    </tr>
                  ));
              }

              return [...reportingRawData]
                .sort((a, b) => {
                  const d1 = new Date(a.date).getTime();
                  const d2 = new Date(b.date).getTime();
                  return rawDateSortAsc ? d1 - d2 : d2 - d1;
                })
                .map((row, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {isShopeeRawTab ? (
                        <>
                          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-800">
                            {formatReportingPreviewShopeeRawDate(row)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-800">
                            {formatReportingPreviewShopeeTime(row)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-bold text-slate-700">
                            {idFormat.format(row.penonton || 0)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-emerald-600">
                            Rp{idFormat.format(row.gmv || 0)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-bold text-slate-700">
                            {idFormat.format(row.products_sold || 0)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-indigo-600">
                            {idFormat.format(row.orders || 0)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-indigo-600">
                            {formatReportingPreviewRate(
                              row.orders || 0,
                              row.penonton || row.impressions || 0 || 1,
                            )}
                            %
                          </td>
                        </>
                      ) : isShopeeLive ? (
                        <>
                          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-800">
                            {formatReportingPreviewDate(row, saveTargetPlatform)}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-left">
                            <div className="font-extrabold text-indigo-950 leading-tight">
                              {row.title}
                            </div>
                            <div className="flex gap-2 text-[9px] font-bold text-slate-400 mt-1">
                              <span>
                                ❤️ {idFormat.format(row.likes || 0)} Likes
                              </span>
                              <span>•</span>
                              <span>
                                💬 {idFormat.format(row.comments || 0)} Comments
                              </span>
                            </div>
                          </td>
                          {uploadTargetTab === "engagement" ? (
                            <>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-slate-700 font-mono">
                                {idFormat.format(row.impressions || 0)}
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-slate-700 font-mono">
                                {idFormat.format(row.likes || 0)}
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-mono">
                                <div className="font-semibold text-slate-700">
                                  💬 {idFormat.format(row.comments || 0)}
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 mt-1">
                                  🔗 {idFormat.format(row.shares || 0)} Shares
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-extrabold text-emerald-600 font-mono">
                                +{idFormat.format(row.followers || 0)} Fans
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-mono">
                                <div className="font-semibold text-slate-700">
                                  🎫{" "}
                                  {idFormat.format(
                                    (row.shopVouchers || 0) +
                                      (row.specialVouchers || 0),
                                  )}{" "}
                                  Vcr
                                </div>
                                <div className="text-[9px] text-amber-600 font-bold mt-1">
                                  🪙 {idFormat.format(row.coinsClaimed || 0)} Koin
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-indigo-600 font-mono">
                                {formatReportingPreviewCtr(row)}%
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="text-xs font-semibold text-slate-600">
                                  {formatReportingPreviewDurationMinutes(
                                    row.duration,
                                  )}
                                </div>
                                {isTikTokLive && (
                                  <div className="text-[9px] font-black text-green-600 mt-1 animate-pulse">
                                    +{row.followers} Fans
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="text-xs font-black text-emerald-600">
                                  {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                  }).format(row.gmv)}
                                </div>
                                <div className="text-[9px] font-extrabold text-slate-400 mt-0.5">
                                  AOV: Rp
                                  {Math.round(row.aov || 0).toLocaleString("id-ID")}
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="text-xs font-bold text-slate-700">
                                  {row.products_sold} Pcs
                                </div>
                                <div className="text-[9px] text-slate-400 font-bold mt-1">
                                  🛍️ {row.clicks} Klik Keranjang
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="text-xs font-bold text-slate-700">
                                  {row.buyers} Users
                                </div>
                                <div className="text-[9px] text-pink-600 font-bold mt-1">
                                  🛒 {row.orders} Checkout
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="text-xs font-black text-indigo-600">
                                  CTR: {formatReportingPreviewCtr(row)}%
                                </div>
                                <div className="text-[9px] font-black text-slate-500 mt-1">
                                  CVR: {formatReportingPreviewCvr(row)}%
                                </div>
                              </td>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-800">
                            {formatReportingPreviewDate(row, saveTargetPlatform)}
                            <span className="block text-[9px] font-semibold text-slate-400 mt-1 font-mono">
                              Platform: {saveTargetPlatform}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-left">
                            <div className="font-extrabold text-indigo-950 leading-tight">
                              {row.title}
                            </div>
                            {isTikTokLive && (
                              <div className="flex gap-2 text-[9px] font-bold text-slate-400 mt-1">
                                <span>
                                  ❤️ {idFormat.format(row.likes || 0)} Likes
                                </span>
                                <span>•</span>
                                <span>
                                  🔗 {idFormat.format(row.shares || 0)} Shares
                                </span>
                              </div>
                            )}
                            {isShopeeLive && (
                              <div className="flex gap-2 text-[9px] font-bold text-slate-400 mt-1">
                                <span>
                                  ❤️ {idFormat.format(row.likes || 0)} Likes
                                </span>
                                <span>•</span>
                                <span>
                                  💬 {idFormat.format(row.comments || 0)} Comments
                                </span>
                              </div>
                            )}
                          </td>
                          {uploadTargetTab === "engagement" ? (
                            <>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-slate-700 font-mono">
                                {idFormat.format(row.impressions || 0)}
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-slate-700 font-mono">
                                {idFormat.format(row.likes || 0)}
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-mono">
                                <div className="font-semibold text-slate-700">
                                  💬 {idFormat.format(row.comments || 0)}
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 mt-1">
                                  🔗 {idFormat.format(row.shares || 0)} Shares
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-extrabold text-emerald-600 font-mono">
                                +{idFormat.format(row.followers || 0)} Fans
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-mono">
                                <div className="font-semibold text-slate-700">
                                  🎫{" "}
                                  {idFormat.format(
                                    (row.shopVouchers || 0) +
                                      (row.specialVouchers || 0),
                                  )}{" "}
                                  Vcr
                                </div>
                                <div className="text-[9px] text-amber-600 font-bold mt-1">
                                  🪙 {idFormat.format(row.coinsClaimed || 0)} Koin
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-black text-indigo-600 font-mono">
                                {formatReportingPreviewCtr(row)}%
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="text-xs font-semibold text-slate-600">
                                  {formatReportingPreviewDurationMinutes(
                                    row.duration,
                                  )}
                                </div>
                                {isTikTokLive && (
                                  <div className="text-[9px] font-black text-green-600 mt-1 animate-pulse">
                                    +{row.followers} Fans
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="text-xs font-black text-emerald-600">
                                  {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                  }).format(row.gmv)}
                                </div>
                                <div className="text-[9px] font-extrabold text-slate-400 mt-0.5">
                                  AOV: Rp
                                  {Math.round(row.aov || 0).toLocaleString("id-ID")}
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="text-xs font-bold text-slate-700">
                                  {row.products_sold} Pcs
                                </div>
                                <div className="text-[9px] text-slate-400 font-bold mt-1">
                                  🛍️ {row.clicks} Klik Keranjang
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="text-xs font-bold text-slate-700">
                                  {row.buyers} Users
                                </div>
                                <div className="text-[9px] text-pink-600 font-bold mt-1">
                                  🛒 {row.orders} Checkout
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="text-xs font-black text-indigo-600">
                                  CTR: {formatReportingPreviewCtr(row)}%
                                </div>
                                <div className="text-[9px] font-black text-slate-500 mt-1">
                                  CVR: {formatReportingPreviewCvr(row)}%
                                </div>
                              </td>
                            </>
                          )}
                        </>
                      )}
                    </tr>
                  );
                });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
