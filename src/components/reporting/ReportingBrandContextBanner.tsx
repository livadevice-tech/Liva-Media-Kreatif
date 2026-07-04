type ReportingBrandContextBannerProps = {
  brandName: string;
  brandId: string;
  onBack: () => void;
  sessionCount: number;
  batchCount: number;
  platformCount: number;
  totalGmv: number;
  latestActivity: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function ReportingBrandContextBanner({
  brandName,
  brandId,
  onBack,
  sessionCount,
  batchCount,
  platformCount,
  totalGmv,
  latestActivity,
}: ReportingBrandContextBannerProps) {
  return (
    <section className="rounded-[22px] border border-[#e5def7] bg-[#fcfbff] px-5 py-4 shadow-[0_1px_0_rgba(86,0,224,0.04)] sm:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              aria-label="Kembali ke daftar brand"
              className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d7d0ea] bg-white text-slate-700 shadow-sm transition-colors hover:bg-[#f8f5ff] focus:outline-none focus:ring-2 focus:ring-[#5600e0] focus:ring-offset-2"
            >
              <span className="text-xl leading-none">←</span>
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#5600e0] font-display text-lg font-black text-white shadow-[0_12px_24px_rgba(86,0,224,0.22)]">
                {brandName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "RB"}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#5600e0]">
                  Report Live Brand
                </p>
                <h2 className="mt-1 font-display text-[clamp(1.45rem,2vw,1.9rem)] font-black tracking-tight text-slate-950">
                  {brandName || "Nama Brand"}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  ID: {brandId || "-"}
                  <span className="mx-2 text-slate-300">•</span>
                  {new Intl.NumberFormat("id-ID").format(batchCount)} batch data
                </p>
              </div>
            </div>
          </div>

          <div className="hidden flex-wrap justify-end gap-2 md:flex">
            <span className="inline-flex items-center rounded-full border border-[#e5def7] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
              {new Intl.NumberFormat("id-ID").format(sessionCount)} sesi
            </span>
            <span className="inline-flex items-center rounded-full border border-[#e5def7] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
              {new Intl.NumberFormat("id-ID").format(platformCount)} platform
            </span>
            <span className="inline-flex items-center rounded-full border border-[#e5def7] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
              {formatCurrency(totalGmv)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-[#e5def7] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
            Brand aktif
          </span>
          <span className="inline-flex items-center rounded-full border border-[#e5def7] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
            Update {latestActivity || "-"}
          </span>
        </div>
      </div>
    </section>
  );
}
