const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const originalBlock1 = `                             {/* Summary Cards */}
                             <div className="mb-2">
                                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg mb-6">
                                   <Calendar className="w-4 h-4 text-indigo-500" />
                                   <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-tight">Data Performance: {latestDateLabel}</span>
                                </div>
                             </div>
                             <div className="space-y-6 mb-6">
                               <div>
                                 <h4 className="text-sm md:text-base font-black text-slate-900 mb-4 uppercase tracking-widest">Sale Metrics</h4>`;

const originalBlock2 = `                                 <HorizontalFunnel 
                                   title="Live Sales Funnel"
                                   subtitle="All Platform & Dates"
                                   steps={(tableLogs.length > 0 && tableLogs[0].platform !== "TikTok Live" && tableLogs[0].platform?.toLowerCase().includes("shopee")) ? [
                                     { label: "Total Viewers", value: new Intl.NumberFormat('id-ID').format(totalDbImpressions) },
                                     { label: "Active Viewers", value: new Intl.NumberFormat('id-ID').format(totalDbLiveVisits) },
                                     { label: "Add To Cart", value: new Intl.NumberFormat('id-ID').format(totalDbClicks) },
                                     { label: "Orders", value: new Intl.NumberFormat('id-ID').format(totalDbOrdersFunnel) }
                                   ] : [
                                     { label: "LIVE impressions", value: new Intl.NumberFormat('id-ID').format(totalDbImpressions) },
                                     { label: "Video/Live Visits", value: new Intl.NumberFormat('id-ID').format(totalDbLiveVisits) },
                                     { label: "Product impressions", value: new Intl.NumberFormat('id-ID').format(totalDbProductImpressions) },
                                     { label: \`Product clicks (CTR: \${funnelCtr.toFixed(2)}%)\`, value: new Intl.NumberFormat('id-ID').format(totalDbClicks) },
                                     { label: \`Orders paid (CTOR: \${funnelCtor.toFixed(2)}%)\`, value: new Intl.NumberFormat('id-ID').format(totalDbBuyers) }
                                   ]}
                                 />`;

const replaceBlock1 = `                             {/* Summary Cards */}
                             {(() => {
                               const isShopee = tableLogs.length > 0 && tableLogs[0].platform !== "TikTok Live" && tableLogs[0].platform?.toLowerCase().includes("shopee");
                               if (isShopee) {
                                 return (
                                   <div className="space-y-6 mb-6">
                                     <div>
                                      <h4 className="text-sm md:text-base font-black text-slate-900 mb-4 uppercase tracking-widest">Performance live</h4>
                                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                                         <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                           <div className="flex justify-between items-start mb-2 gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                                             <div className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider leading-tight flex-1">GMV</div>
                                             <PercentBadge cur={totalGmvDb} prev={pTotalGmvDb} />
                                           </div>
                                           <div className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 mt-1 xl:mt-2">Rp{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(totalGmvDb)}</div>
                                         </div>
                                         <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                           <div className="flex justify-between items-start mb-2 gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                                             <div className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider leading-tight flex-1">Item Solds</div>
                                             <PercentBadge cur={totalItemsSoldDb} prev={pTotalItemsSoldDb} />
                                           </div>
                                           <div className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 mt-1 xl:mt-2">{new Intl.NumberFormat('id-ID').format(totalItemsSoldDb)}</div>
                                         </div>
                                         <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                           <div className="flex justify-between items-start mb-2 gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                                             <div className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider leading-tight flex-1">GMV/Hours</div>
                                             <PercentBadge cur={gmvPerHour} prev={pGmvPerHour} />
                                           </div>
                                           <div className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 mt-1 xl:mt-2">Rp{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(gmvPerHour)}</div>
                                         </div>
                                         <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                           <div className="flex justify-between items-start mb-2 gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                                             <div className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider leading-tight flex-1">Conversion Rate %</div>
                                             <PercentBadge cur={conversionRateShopee} prev={pConversionRateShopee} />
                                           </div>
                                           <div className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 mt-1 xl:mt-2">{conversionRateShopee.toFixed(2)}%</div>
                                         </div>
                                      </div>
                                     </div>

                                     {totalDbImpressions > 0 && (
                                       <div className="mb-6">
                                         <HorizontalFunnel 
                                           title="Funneling Live"
                                           subtitle="Shopee Live Performance"
                                           steps={[
                                             { label: "Viewer", value: new Intl.NumberFormat('id-ID').format(totalDbImpressions) },
                                             { label: "Viewer Enganged", value: new Intl.NumberFormat('id-ID').format(totalDbLiveVisits) },
                                             { label: "Add To Card", value: new Intl.NumberFormat('id-ID').format(totalDbClicks) },
                                             { label: "Purchase", value: new Intl.NumberFormat('id-ID').format(totalDbOrdersFunnel) }
                                           ]}
                                         />
                                       </div>
                                     )}
                                   </div>
                                 );
                               }

                               return (
                                <>
                             <div className="mb-2">
                                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg mb-6">
                                   <Calendar className="w-4 h-4 text-indigo-500" />
                                   <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-tight">Data Performance: {latestDateLabel}</span>
                                </div>
                             </div>
                             <div className="space-y-6 mb-6">
                               <div>
                                 <h4 className="text-sm md:text-base font-black text-slate-900 mb-4 uppercase tracking-widest">Sale Metrics</h4>`;

const replaceBlock2 = `                                 <HorizontalFunnel 
                                   title="Live Sales Funnel"
                                   subtitle="All Platform & Dates"
                                   steps={[
                                     { label: "LIVE impressions", value: new Intl.NumberFormat('id-ID').format(totalDbImpressions) },
                                     { label: "Video/Live Visits", value: new Intl.NumberFormat('id-ID').format(totalDbLiveVisits) },
                                     { label: "Product impressions", value: new Intl.NumberFormat('id-ID').format(totalDbProductImpressions) },
                                     { label: \`Product clicks (CTR: \${funnelCtr.toFixed(2)}%)\`, value: new Intl.NumberFormat('id-ID').format(totalDbClicks) },
                                     { label: \`Orders paid (CTOR: \${funnelCtor.toFixed(2)}%)\`, value: new Intl.NumberFormat('id-ID').format(totalDbBuyers) }
                                   ]}
                                 />`;

const originalBlock3 = `                                 </div>
                               </div>
                             </div>
 
                             {/* Funnel */}`;

const replaceBlock3 = `                                 </div>
                               </div>
                             </div>
                             </>
                             );
                            })()}
 
                             {/* Funnel */}`;

code = code.replaceAll(originalBlock1, replaceBlock1);
code = code.replaceAll(originalBlock2, replaceBlock2);
code = code.replaceAll(originalBlock3, replaceBlock3);

fs.writeFileSync('src/App.tsx', code);
console.log('done modifying script');
