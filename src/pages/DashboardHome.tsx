import { TrendingUp, Wallet, Network, Wrench, DollarSign, ArrowDownToLine, ArrowUpFromLine, Award } from "lucide-react";
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

  let user: UserProfile | null = null;
  try {
    const profileStr = localStorage.getItem("userProfile");
    if (profileStr) user = JSON.parse(profileStr);
  } catch { /* ignore */ }

  return (
    <div className="space-y-6">
      {/* 2FA Warning */}
      <TwoFactorWarningBanner isEnabled={user?.isG2faEnabled ?? false} />

      {/* ROW 1: Wallets (left) + Action Cards (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Wallets 2 per row */}
        <WalletCards wallets={wallets} columns={2} />

        {/* Right: Action cards 2 per row */}
        <div className="grid grid-cols-2 gap-4">
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
            route="/growth-tools"
          />
        </div>
      </div>

      {/* ROW 2: User Profile (left) + Rank (center) + Stats (right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: User Profile */}
        <UserProfileCard user={user} />

        {/* Center: Rank Progress */}
        <RankProgressCard/>

        {/* Right: Stats 2 per row */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard title="Fund Deposited" value={stats?.fundDeposited ?? 0} icon={DollarSign} isLoading={statsLoading} />
          <StatsCard title="Yield Received" value={stats?.yieldReceived ?? 0} icon={ArrowDownToLine} isLoading={statsLoading} />
          <StatsCard title="Total Withdrawal" value={stats?.totalWithdrawal ?? 0} icon={ArrowUpFromLine} isLoading={statsLoading} />
          <StatsCard title="Rewards Earned" value={stats?.rewardsEarned ?? 0} icon={Award} isLoading={statsLoading} />
        </div>
      </div>

      {/* ROW 3: Recently Added Users (left) + Affiliate Links (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentlyAddedUsers />
        <AffiliateLinksCard user={user} />
      </div>
    </div>
  );
};

export default DashboardHome;
