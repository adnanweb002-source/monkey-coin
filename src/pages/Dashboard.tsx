import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WalletCards from "@/components/dashboard/WalletCards";
import RecentlyAddedUsers from "@/components/dashboard/RecentlyAddedUsers";
import CurrentLevel from "@/components/dashboard/CurrentLevel";
import PackagesSection from "@/components/dashboard/PackagesSection";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Wallet Cards */}
          <div className="mb-6">
            <WalletCards />
          </div>

          {/* Three Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentlyAddedUsers />
            <CurrentLevel />
            <PackagesSection />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
