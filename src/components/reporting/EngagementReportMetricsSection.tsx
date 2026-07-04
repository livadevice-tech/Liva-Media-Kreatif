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
    <>
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" /> Interaksi (Engagement)
        </h4>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-indigo-500" /> Promosi (Vouchers & Koin)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Voucher Toko Diklaim
            </div>
            <div className="text-xl font-black text-slate-800 mt-1">
              {new Intl.NumberFormat("id-ID").format(model.totalShopVouchers)}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Voucher Spesial Live Diklaim
            </div>
            <div className="text-xl font-black text-slate-800 mt-1">
              {new Intl.NumberFormat("id-ID").format(model.totalSpecialVouchers)}
            </div>
          </div>
          <div className="bg-slate-50 border border-amber-100 rounded-xl p-4 bg-amber-50/30">
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
              Koin Diklaim
            </div>
            <div className="text-lg font-black text-amber-700">
              {new Intl.NumberFormat("id-ID").format(model.totalCoinsClaimed)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
