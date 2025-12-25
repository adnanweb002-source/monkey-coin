import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Collapsible Sidebar */}
        <DashboardSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header with Sidebar Trigger */}
          <header className="h-16 border-b border-border bg-card flex items-center px-4 shrink-0">
            <SidebarTrigger className="mr-4" />
            <DashboardHeader />
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
