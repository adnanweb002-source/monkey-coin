import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationProvider } from "@/contexts/NotificationContext";

const DashboardLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const pageUrl = window.location.href;
  useEffect(() => {
    if (pageUrl.includes(import.meta.env.VITE_ADMIN_URL)) {
      if (localStorage.getItem("userProfile")) {
        const userProfile = JSON.parse(
          localStorage.getItem("userProfile") || "{}",
        );
        if (userProfile?.role !== "ADMIN") {
          window.location.href = import.meta.env.VITE_URL
        }
      } else {
        window.location.href = import.meta.env.VITE_URL + "signin";
      }
    }
  }, [pageUrl]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <NotificationProvider>
      <div className="h-screen bg-background flex overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Fixed Header */}
          <DashboardHeader
            onMenuClick={toggleSidebar}
            showMenuButton={isMobile || !sidebarOpen}
          />

          {/* Scrollable Content */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <Outlet />
            <footer className="mt-8 py-4 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Vaultire Infinite | All Rights Reserved
            </footer>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default DashboardLayout;
