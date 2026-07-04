type ReportingBrandContextBannerProps = {
  brandName: string;
  brandId: string;
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
  sessionCount,
  batchCount,
  platformCount,
  totalGmv,
  latestActivity,
}: ReportingBrandContextBannerProps) {
  return (
    <section className="rounded-[18px] border border-[#e5e2e1] bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#e8deff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#5600e0]">
              Report Live Brand
            </span>
            <span className="inline-flex items-center rounded-full border border-[#cbc3d9] bg-[#f6f3f2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#494456]">
              Brand aktif
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5600e0] text-base font-black text-white shadow-[0_8px_18px_rgba(86,0,224,0.18)]">
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
              <h2 className="font-display text-[clamp(1.65rem,2.4vw,2.1rem)] font-black tracking-tight text-slate-900">
                {brandName || "Nama Brand"}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-slate-600">
                ID brand: {brandId || "-"}{"  "}•{"  "}
                {new Intl.NumberFormat("id-ID").format(batchCount)} batch data
              </p>
            </div>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-500">
            Ruang kerja ini dibuat untuk membaca performa brand terpilih dengan
            urutan yang jelas: filter periode, platform, KPI, lalu chart dan
            tabel detail.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-[#e5e2e1] bg-[#fcf9f8] px-3 py-1.5 text-[11px] font-bold text-slate-600">
            {new Intl.NumberFormat("id-ID").format(platformCount)} platform
          </span>
          <span className="inline-flex items-center rounded-full border border-[#e5e2e1] bg-[#fcf9f8] px-3 py-1.5 text-[11px] font-bold text-slate-600">
            {formatCurrency(totalGmv)}
          </span>
          <span className="inline-flex items-center rounded-full border border-[#cbc3d9] bg-white px-3 py-1.5 text-[11px] font-bold text-[#494456]">
            Update {latestActivity || "-"}
          </span>
        </div>
      </div>
    </section>
  );
}
