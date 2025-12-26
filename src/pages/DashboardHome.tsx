import CurrentLevel from "@/components/dashboard/CurrentLevel";
import PackagesSection from "@/components/dashboard/PackagesSection";
import RecentlyAddedUsers from "@/components/dashboard/RecentlyAddedUsers";
import WalletCards from "@/components/dashboard/WalletCards";
import { useGetPackages, useGetUserTree, useGetWallets } from "./api";

const DashboardHome = () => {
const {data:packages}=useGetPackages();
const {data:wallets}=useGetWallets();
let user=JSON.parse((localStorage.getItem("userProfile")))
console.log(user)
const {data}=useGetUserTree(user?.id);

  return (
    <>
      {/* Wallet Cards */}
      <div className="mb-6">
        <WalletCards  wallets={wallets}/>
      </div>

      {/* Three Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentlyAddedUsers />
        <CurrentLevel />
        <PackagesSection packages={packages||[]} />
      </div>
    </>
  );
};

export default DashboardHome;