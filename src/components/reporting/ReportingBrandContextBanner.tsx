type ReportingBrandContextBannerProps = {
  brandName: string;
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
  sessionCount,
  batchCount,
  platformCount,
  totalGmv,
  latestActivity,
}: ReportingBrandContextBannerProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700">
              Brand aktif
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
              Siap dianalisis
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {brandName || "Nama Brand"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Ini adalah ruang kerja detail untuk melihat performa brand
              terpilih. Fokus utama ada di periode aktif, ringkasan performa,
              dan riwayat upload supaya navigasi data terasa lebih jelas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Sesi
            </div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {new Intl.NumberFormat("id-ID").format(sessionCount)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Batch
            </div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {new Intl.NumberFormat("id-ID").format(batchCount)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Platform
            </div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {new Intl.NumberFormat("id-ID").format(platformCount)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              GMV
            </div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {formatCurrency(totalGmv)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 col-span-2 sm:col-span-3 xl:col-span-1">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Update terakhir
            </div>
            <div className="mt-1 text-sm font-black leading-5 text-slate-900">
              {latestActivity || "-"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
