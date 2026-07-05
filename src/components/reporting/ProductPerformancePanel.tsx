import { ChevronDown, ChevronUp } from "lucide-react";
import { SkuUploadHistoryCard } from "./SkuUploadHistoryCard";
import { buildProductPerformanceViewModel } from "../../shared/utils/productPerformanceViewModel";
import type { BrandPerformanceLogEntry, SkuLogEntry } from "../../shared/types/reporting";

type ProductPerformancePanelProps = {
  shopeeSkuLogs: SkuLogEntry[];
  brandPerformanceLogs: BrandPerformanceLogEntry[];
  activeReportBrandId: string;
  operatorDateFilterType: "all" | "latest" | "month" | "custom";
  selectedLatestDate: string;
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
  selectedLatestDate,
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
  const { currentSkus, aggregatedSkus, totalSold } =
    buildProductPerformanceViewModel({
    shopeeSkuLogs,
    brandPerformanceLogs,
    activeReportBrandId,
    operatorDateFilterType,
    selectedLatestDate,
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
        <div className="rounded-[22px] border border-[#e6dff8] bg-white px-5 py-4 shadow-[0_1px_0_rgba(17,24,39,0.03)]">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
            Tab Product
          </p>
          <h3 className="mt-1 font-display text-lg font-black tracking-tight text-slate-950">
            Performa SKU per periode
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
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
      <div className="rounded-[22px] border border-[#e6dff8] bg-white px-5 py-4 shadow-[0_1px_0_rgba(17,24,39,0.03)]">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
          Tab Product
        </p>
        <h3 className="mt-1 font-display text-lg font-black tracking-tight text-slate-950">
          Performa SKU per periode
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Analisis ini menyorot distribusi revenue dan item terjual per SKU
          pada brand aktif. Gunakan navigasi periode untuk membandingkan
          performa harian secara lebih cepat.
        </p>
      </div>

      <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] lg:p-6">
        <div className="flex flex-col gap-3 mb-6">
          <p className="text-[10px] sm:text-xs text-slate-500 font-semibold -mt-1">
            Distribusi revenue dan penjualan per SKU
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center rounded-full border border-[#e6dff8] bg-[#faf8ff] px-3 py-1.5 text-xs font-bold text-[#5600e0]">
              Total Item Sold:{" "}
              {new Intl.NumberFormat("id-ID").format(totalSold)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-[18px] border border-[#ece7f7] custom-scrollbar">
          <table className="w-full text-left bg-white">
            <thead className="sticky top-0 z-10 bg-[#faf8ff] shadow-sm">
              <tr>
                <th className="w-16 px-5 py-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
                  No
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
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
            <tbody className="divide-y divide-slate-100 bg-white text-sm font-semibold text-slate-700">
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
