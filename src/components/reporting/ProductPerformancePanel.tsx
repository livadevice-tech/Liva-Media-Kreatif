import { ChevronDown, ChevronUp } from "lucide-react";
import { SkuUploadHistoryCard } from "./SkuUploadHistoryCard";
import { ReportPeriodNavigator } from "./ReportPeriodNavigator";
import { shiftReportPeriodByOneDay } from "../../shared/utils/reportDateFilters";
import { buildProductPerformanceViewModel } from "../../shared/utils/productPerformanceViewModel";
import type { BrandPerformanceLogEntry, SkuLogEntry } from "../../shared/types/reporting";

type ProductPerformancePanelProps = {
  shopeeSkuLogs: SkuLogEntry[];
  brandPerformanceLogs: BrandPerformanceLogEntry[];
  activeReportBrandId: string;
  operatorDateFilterType: "all" | "latest" | "month" | "custom";
  operatorCustomStartDate: string;
  operatorCustomEndDate: string;
  operatorSelectedMonth: string;
  operatorPlatformFilter: string;
  operatorShiftFilters: string[];
  reportDbSearchQuery: string;
  skuSortCol: "sold" | "revenue";
  skuSortAsc: boolean;
  setSkuSortCol: (value: "sold" | "revenue") => void;
  setSkuSortAsc: (value: boolean) => void;
  setOperatorDateFilterType: (value: "all" | "latest" | "month" | "custom") => void;
  setOperatorCustomStartDate: (value: string) => void;
  setOperatorCustomEndDate: (value: string) => void;
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (value: number | ((prev: number) => number)) => void;
  onDeleteBatch: (batchId: string) => void;
};

export function ProductPerformancePanel({
  shopeeSkuLogs,
  brandPerformanceLogs,
  activeReportBrandId,
  operatorDateFilterType,
  operatorCustomStartDate,
  operatorCustomEndDate,
  operatorSelectedMonth,
  operatorPlatformFilter,
  operatorShiftFilters,
  reportDbSearchQuery,
  skuSortCol,
  skuSortAsc,
  setSkuSortCol,
  setSkuSortAsc,
  setOperatorDateFilterType,
  setOperatorCustomStartDate,
  setOperatorCustomEndDate,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  onDeleteBatch,
}: ProductPerformancePanelProps) {
  const {
    targetLatestDate,
    productPeriodLabel,
    currentSkus,
    aggregatedSkus,
    totalSold,
  } = buildProductPerformanceViewModel({
    shopeeSkuLogs,
    brandPerformanceLogs,
    activeReportBrandId,
    operatorDateFilterType,
    operatorCustomStartDate,
    operatorCustomEndDate,
    operatorSelectedMonth,
    operatorPlatformFilter,
    operatorShiftFilters,
    reportDbSearchQuery,
  });

  if (currentSkus.length === 0) {
    return (
      <div className="px-6 pb-8 sm:px-8 space-y-6 animate-fadeIn">
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            Tab Product
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-900">
            Performa SKU per periode
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Data SKU belum ditemukan untuk kombinasi filter saat ini. Coba
            ubah periode, platform, atau kata kunci pencarian agar daftar
            produk muncul kembali.
          </p>
        </div>
      </div>
    );
  }

  const sortedAggregatedSkus = [...aggregatedSkus].sort((a, b) => {
    if (skuSortCol === "sold") return skuSortAsc ? a.sold - b.sold : b.sold - a.sold;
    if (skuSortCol === "revenue")
      return skuSortAsc ? a.revenue - b.revenue : b.revenue - a.revenue;
    return 0;
  });

  return (
    <div className="px-6 pb-8 sm:px-8 space-y-6 animate-fadeIn">
      <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
          Tab Product
        </p>
        <h3 className="mt-1 text-lg font-black text-slate-900">
          Performa SKU per periode
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Analisis ini menyorot distribusi revenue dan item terjual per SKU
          pada brand aktif. Gunakan navigasi periode untuk membandingkan
          performa harian secara lebih cepat.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:p-7">
        <div className="flex flex-col gap-3 mb-6">
          <ReportPeriodNavigator
            title="Product Performance"
            label={productPeriodLabel}
            onPrev={() => {
              shiftReportPeriodByOneDay({
                direction: -1,
                dateFilterType: operatorDateFilterType,
                targetLatestDate,
                customStartDate: operatorCustomStartDate,
                setDateFilterType: setOperatorDateFilterType,
                setCustomStartDate: setOperatorCustomStartDate,
                setCustomEndDate: setOperatorCustomEndDate,
              });
            }}
            onNext={() => {
              shiftReportPeriodByOneDay({
                direction: 1,
                dateFilterType: operatorDateFilterType,
                targetLatestDate,
                customStartDate: operatorCustomStartDate,
                setDateFilterType: setOperatorDateFilterType,
                setCustomStartDate: setOperatorCustomStartDate,
                setCustomEndDate: setOperatorCustomEndDate,
              });
            }}
          />
          <p className="text-[10px] sm:text-xs text-slate-500 font-semibold -mt-1">
            Distribusi revenue dan penjualan per SKU
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-indigo-700 font-bold text-xs h-[36px] sm:h-[40px] flex items-center">
              Total Item Sold:{" "}
              {new Intl.NumberFormat("id-ID").format(totalSold)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left bg-white">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-5 py-4 w-16 text-center text-slate-500 font-semibold text-xs tracking-widest uppercase">
                  No
                </th>
                <th className="px-5 py-4 text-slate-500 font-semibold text-xs tracking-widest uppercase">
                  SKU
                </th>
                <th
                  className="px-5 py-4 w-32 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => {
                    if (skuSortCol === "sold") setSkuSortAsc(!skuSortAsc);
                    else {
                      setSkuSortCol("sold");
                      setSkuSortAsc(false);
                    }
                  }}
                >
                  <div className="flex items-center justify-end gap-1 text-slate-500 font-semibold text-xs tracking-widest uppercase">
                    Sold
                    {skuSortCol === "sold" &&
                      (skuSortAsc ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-5 py-4 w-40 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => {
                    if (skuSortCol === "revenue") setSkuSortAsc(!skuSortAsc);
                    else {
                      setSkuSortCol("revenue");
                      setSkuSortAsc(false);
                    }
                  }}
                >
                  <div className="flex items-center justify-end gap-1 text-slate-500 font-semibold text-xs tracking-widest uppercase">
                    Revenue
                    {skuSortCol === "revenue" &&
                      (skuSortAsc ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {sortedAggregatedSkus.map((sku, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 text-center text-slate-400 font-bold text-xs">
                    {idx + 1}
                  </td>
                  <td className="px-5 py-3 whitespace-normal min-w-[250px]">
                    <div className="line-clamp-2 text-slate-800 leading-snug">
                      {sku.productName}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-emerald-600 font-black">
                    {new Intl.NumberFormat("id-ID").format(sku.sold)}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-800 font-black">
                    Rp {new Intl.NumberFormat("id-ID").format(sku.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SkuUploadHistoryCard
        brandSkuLogs={shopeeSkuLogs.filter(
          (r) => r.brandId === activeReportBrandId,
        )}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        onDeleteBatch={onDeleteBatch}
      />
    </div>
  );
}
