import {
  Gift,
  Users,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  UserPlus,
  Activity,
  Ticket,
  Sparkles,
  Coins,
} from "lucide-react";
import { ReportMetricCard } from "./ReportMetricCard";
import type { EngagementReportViewModel } from "../../shared/utils/engagementReporting";
import type { BrandDashboardSettings } from "../../types";

type EngagementReportMetricsSectionProps = {
  model: EngagementReportViewModel;
  platform: string;
  brandDashboardSettings?: BrandDashboardSettings;
};

export function EngagementReportMetricsSection({
  model,
  platform,
  brandDashboardSettings,
}: EngagementReportMetricsSectionProps) {
  const isShopee = platform === "Shopee Live";
  
  const hm = brandDashboardSettings?.hiddenMetrics || [];
  const isMetricHidden = (id: string) => hm.includes(isShopee ? `shopee_engagement_${id}` : `tiktok_engagement_${id}`);

  return (
    <div className="space-y-6">
      <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
        <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
          <Users className="h-5 w-5 text-[#5600e0]" /> Interaksi (Engagement)
        </h4>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {!isMetricHidden("views") && (
            <ReportMetricCard
              label="Views"
              cur={model.totalImpressions}
              prev={model.prevTotalImpressions}
              value={new Intl.NumberFormat("id-ID").format(model.totalImpressions)}
              icon={<Eye size={16} />}
            />
          )}
          {!isMetricHidden("likes") && (
            <ReportMetricCard
              label="Likes"
              cur={model.totalLikes}
              prev={model.prevTotalLikes}
              value={new Intl.NumberFormat("id-ID").format(model.totalLikes)}
              icon={<Heart size={16} />}
            />
          )}
          {!isShopee ? (
            !isMetricHidden("shares") && (
              <ReportMetricCard
                label="Shares"
                cur={model.totalShares}
                prev={model.prevTotalShares}
                value={new Intl.NumberFormat("id-ID").format(model.totalShares)}
                icon={<Share2 size={16} />}
              />
            )
          ) : (
            <ReportMetricCard
              label="Voucher Toko"
              cur={model.totalShopVouchers}
              prev={0}
              value={new Intl.NumberFormat("id-ID").format(
                model.totalShopVouchers,
              )}
              icon={<Ticket size={16} />}
            />
          )}
          {!isMetricHidden("comments") && (
            <ReportMetricCard
              label="Comments"
              cur={model.totalComments}
              prev={model.prevTotalComments}
              value={new Intl.NumberFormat("id-ID").format(model.totalComments)}
              icon={<MessageCircle size={16} />}
            />
          )}
          <ReportMetricCard
            label="Followers"
            cur={model.totalFollowers}
            prev={model.prevTotalFollowers}
            value={new Intl.NumberFormat("id-ID").format(model.totalFollowers)}
            icon={<UserPlus size={16} />}
          />
          {!isMetricHidden("engagement_rate") && (
            <ReportMetricCard
              label="ERR %"
              cur={Number(model.formattedErrRate.replace("%", "")) || 0}
              prev={model.prevErrRateNumeric}
              value={model.formattedErrRate}
              icon={<Activity size={16} />}
            />
          )}
        </div>
      </div>

      {isShopee && (
        <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
          <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
            <Gift className="h-5 w-5 text-[#5600e0]" /> Promosi Tambahan (Koin & Spesial)
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ReportMetricCard
              label="Voucher Spesial Live"
              cur={model.totalSpecialVouchers}
              prev={0}
              value={new Intl.NumberFormat("id-ID").format(
                model.totalSpecialVouchers,
              )}
              icon={<Sparkles size={16} />}
            />
            <ReportMetricCard
              label="Koin Diklaim"
              cur={model.totalCoinsClaimed}
              prev={0}
              value={new Intl.NumberFormat("id-ID").format(
                model.totalCoinsClaimed,
              )}
              icon={<Coins size={16} />}
            />
            <ReportMetricCard
              label="Peak Viewer"
              cur={model.maxPeakViewers}
              prev={0}
              value={new Intl.NumberFormat("id-ID").format(
                model.maxPeakViewers,
              )}
              icon={<Users size={16} />}
            />
          </div>
        </div>
      )}
    </div>
  );
}
