import { useState, useEffect } from "react";
import WalletCards from "@/components/dashboard/WalletCards";
import RecentlyAddedUsers from "@/components/dashboard/RecentlyAddedUsers";
import CurrentLevel from "@/components/dashboard/CurrentLevel";
import PackagesSection from "@/components/dashboard/PackagesSection";
import type { Package } from "@/types/package";

const DashboardHome = () => {
  const [packages, setPackages] = useState<Package[]>([]);

  // TODO: Replace with actual API call
  useEffect(() => {
    // Placeholder - fetch packages from API
    setPackages([]);
  }, []);

  return (
    <>
      {/* Wallet Cards */}
      <div className="mb-6">
        <WalletCards />
      </div>

      {/* Three Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentlyAddedUsers />
        <CurrentLevel />
        <PackagesSection packages={packages} />
      </div>
    </>
  );
};

export default DashboardHome;
