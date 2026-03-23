import { TrendingUp, Wallet, Network, Wrench, DollarSign, ArrowDownToLine, ArrowUpFromLine, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import TwoFactorWarningBanner from "@/components/dashboard/TwoFactorWarningBanner";
import WalletCards from "@/components/dashboard/WalletCards";
import DashboardActionCard from "@/components/dashboard/DashboardActionCard";
import StatsCard from "@/components/dashboard/StatsCard";
import AffiliateLinksCard from "@/components/dashboard/AffiliateLinksCard";
import RankProgressCard from "@/components/dashboard/RankProgressCard";
import RecentlyAddedUsers from "@/components/dashboard/RecentlyAddedUsers";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import { useGetWallets } from "./api";
import useDashboardStats from "@/hooks/useDashboardStats";
import type { UserProfile } from "@/types/user";

const DashboardHome = () => {
  const { data: wallets } = useGetWallets();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { t } = useTranslation();

  let user: UserProfile | null = null;
  try {
    const profileStr = localStorage.getItem("userProfile");
    if (profileStr) user = JSON.parse(profileStr);
  } catch { /* ignore */ }

  return (
    <div className="space-y-6">
      <TwoFactorWarningBanner isEnabled={user?.isG2faEnabled ?? false} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WalletCards wallets={wallets} columns={2} />
        <div className="grid grid-cols-2 gap-4">
          <DashboardActionCard
            title={t("dashboard.yieldOverview")}
            subtitle={t("dashboard.checkDailyYield")}
            icon={TrendingUp}
            route="/income/daily"
          />
          <DashboardActionCard
            title={t("dashboard.makeDeposit")}
            subtitle={t("dashboard.quickSecureDeposits")}
            icon={Wallet}
            route="/wallet/deposit"
          />
          <DashboardActionCard
            title={t("dashboard.networkStructure")}
            subtitle={t("dashboard.checkTeamGrowth")}
            icon={Network}
            route="/tree"
          />
          <DashboardActionCard
            title={t("dashboard.growthTools")}
            subtitle={t("dashboard.rightTools")}
            icon={Wrench}
            route="/growth-tools"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UserProfileCard user={user} />
        <RankProgressCard/>
        <div className="grid grid-cols-2 gap-4">
          <StatsCard title={t("dashboard.fundDeposited")} value={stats?.fundDeposited ?? 0} icon={DollarSign} isLoading={statsLoading} />
          <StatsCard title={t("dashboard.yieldReceived")} value={stats?.yieldReceived ?? 0} icon={ArrowDownToLine} isLoading={statsLoading} />
          <StatsCard title={t("dashboard.totalWithdrawal")} value={stats?.totalWithdrawal ?? 0} icon={ArrowUpFromLine} isLoading={statsLoading} />
          <StatsCard title={t("dashboard.rewardsEarned")} value={stats?.rewardsEarned ?? 0} icon={Award} isLoading={statsLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentlyAddedUsers />
        <AffiliateLinksCard user={user} />
      </div>
    </div>
  );
};

export default DashboardHome;
