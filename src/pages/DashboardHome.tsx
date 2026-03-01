import { TrendingUp, Wallet, Network, Wrench, DollarSign, ArrowDownToLine, ArrowUpFromLine, Award } from "lucide-react";
import TwoFactorWarningBanner from "@/components/dashboard/TwoFactorWarningBanner";
import WalletCards from "@/components/dashboard/WalletCards";
import BVDisplay from "@/components/dashboard/BVDisplay";
import DashboardActionCard from "@/components/dashboard/DashboardActionCard";
import StatsCard from "@/components/dashboard/StatsCard";
import AffiliateLinksCard from "@/components/dashboard/AffiliateLinksCard";
import RankProgressCard from "@/components/dashboard/RankProgressCard";
import PackagesSection from "@/components/dashboard/PackagesSection";
import RecentlyAddedUsers from "@/components/dashboard/RecentlyAddedUsers";
import { useGetPackages, useGetUserTree, useGetWallets } from "./api";
import useDashboardStats from "@/hooks/useDashboardStats";
import type { UserProfile } from "@/types/user";

const DashboardHome = () => {
  const { data: packages } = useGetPackages();
  const { data: wallets } = useGetWallets();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  let user: UserProfile | null = null;
  try {
    const profileStr = localStorage.getItem("userProfile");
    if (profileStr) user = JSON.parse(profileStr);
  } catch { /* ignore */ }

  useGetUserTree(user?.id);

  return (
    <div className="space-y-6">
      {/* 2FA Warning */}
      <TwoFactorWarningBanner isEnabled={user?.isG2faEnabled ?? false} />

      {/* Wallet Cards */}
      <WalletCards wallets={wallets} />

      {/* BV Display */}
      <BVDisplay leftBv={user?.leftBv ?? 0} rightBv={user?.rightBv ?? 0} />

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardActionCard
          title="Yield Overview"
          subtitle="Check your daily yield income"
          icon={TrendingUp}
          route="/income/daily"
        />
        <DashboardActionCard
          title="Make Your Deposit"
          subtitle="Quick, secure deposits for investing"
          icon={Wallet}
          route="/wallet/deposit"
        />
        <DashboardActionCard
          title="Network Structure"
          subtitle="Check your team growth"
          icon={Network}
          route="/tree"
        />
        <DashboardActionCard
          title="Growth Tools"
          subtitle="We always give you the right tools"
          icon={Wrench}
          route="/packages"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Fund Deposited" value={stats?.fundDeposited ?? 0} icon={DollarSign} isLoading={statsLoading} />
        <StatsCard title="Yield Received" value={stats?.yieldReceived ?? 0} icon={ArrowDownToLine} isLoading={statsLoading} />
        <StatsCard title="Total Withdrawal" value={stats?.totalWithdrawal ?? 0} icon={ArrowUpFromLine} isLoading={statsLoading} />
        <StatsCard title="Rewards Earned" value={stats?.rewardsEarned ?? 0} icon={Award} isLoading={statsLoading} />
      </div>

      {/* Affiliate Links */}
      <AffiliateLinksCard user={user} />

      {/* Rank Progress */}
      <RankProgressCard />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentlyAddedUsers />
        <PackagesSection packages={packages || []} />
      </div>
    </div>
  );
};

export default DashboardHome;
