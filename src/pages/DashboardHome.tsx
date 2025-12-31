import CurrentLevel from "@/components/dashboard/CurrentLevel";
import PackagesSection from "@/components/dashboard/PackagesSection";
import RecentlyAddedUsers from "@/components/dashboard/RecentlyAddedUsers";
import WalletCards from "@/components/dashboard/WalletCards";
import TwoFactorWarningBanner from "@/components/dashboard/TwoFactorWarningBanner";
import { useGetPackages, useGetUserTree, useGetWallets } from "./api";
import type { UserProfile } from "@/types/user";

const DashboardHome = () => {
  const { data: packages } = useGetPackages();
  const { data: wallets } = useGetWallets();
  
  let user: UserProfile | null = null;
  try {
    const profileStr = localStorage.getItem("userProfile");
    if (profileStr) {
      user = JSON.parse(profileStr);
    }
  } catch {
    // Ignore parse errors
  }
  
  const { data } = useGetUserTree(user?.id);

  return (
    <>
      {/* 2FA Warning Banner */}
      <TwoFactorWarningBanner isEnabled={user?.isG2faEnabled ?? false} />

      {/* Wallet Cards */}
      <div className="mb-6">
        <WalletCards wallets={wallets} />
      </div>

      {/* Three Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentlyAddedUsers />
        <CurrentLevel />
        <PackagesSection packages={packages || []} />
      </div>
    </>
  );
};

export default DashboardHome;