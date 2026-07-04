import { Gift, Users } from "lucide-react";
import { ReportMetricCard } from "./ReportMetricCard";
import type { EngagementReportViewModel } from "../../shared/utils/engagementReporting";

type EngagementReportMetricsSectionProps = {
  model: EngagementReportViewModel;
};

export function EngagementReportMetricsSection({
  model,
}: EngagementReportMetricsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
        <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
          <Users className="h-5 w-5 text-[#5600e0]" /> Interaksi (Engagement)
        </h4>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <ReportMetricCard
            label="Views"
            cur={model.totalImpressions}
            prev={0}
            value={new Intl.NumberFormat("id-ID").format(model.totalImpressions)}
          />
          <ReportMetricCard
            label="Likes"
            cur={model.totalLikes}
            prev={0}
            value={new Intl.NumberFormat("id-ID").format(model.totalLikes)}
          />
          <ReportMetricCard
            label="Shares"
            cur={model.totalShares}
            prev={0}
            value={new Intl.NumberFormat("id-ID").format(model.totalShares)}
          />
          <ReportMetricCard
            label="Comments"
            cur={model.totalComments}
            prev={0}
            value={new Intl.NumberFormat("id-ID").format(model.totalComments)}
          />
          <ReportMetricCard
            label="New Followers"
            cur={model.totalFollowers}
            prev={0}
            value={new Intl.NumberFormat("id-ID").format(model.totalFollowers)}
          />
          <ReportMetricCard
            label="ERR %"
            cur={Number(model.formattedErrRate.replace("%", "")) || 0}
            prev={0}
            value={model.formattedErrRate}
          />
        </div>
      </div>

      <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
        <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
          <Gift className="h-5 w-5 text-[#5600e0]" /> Promosi (Vouchers &
          Koin)
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[18px] border border-[#ece7f7] bg-[#faf8ff] p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Voucher Toko Diklaim
            </div>
            <div className="mt-1 text-xl font-black text-slate-950">
              {new Intl.NumberFormat("id-ID").format(model.totalShopVouchers)}
            </div>
          </div>
          <div className="rounded-[18px] border border-[#ece7f7] bg-[#faf8ff] p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Voucher Spesial Live Diklaim
            </div>
            <div className="mt-1 text-xl font-black text-slate-950">
              {new Intl.NumberFormat("id-ID").format(model.totalSpecialVouchers)}
            </div>
          </div>
          <div className="rounded-[18px] border border-amber-100 bg-amber-50/40 p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Koin Diklaim
            </div>
            <div className="text-lg font-black text-amber-700">
              {new Intl.NumberFormat("id-ID").format(model.totalCoinsClaimed)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
