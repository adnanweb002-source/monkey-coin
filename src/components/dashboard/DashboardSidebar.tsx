import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  DollarSign,
  TreePine,
  Wallet,
  ArrowRightLeft,
  ArrowDownToLine,
  FileText,
  ChevronDown,
  ChevronRight,
  Wrench,
  HeadphonesIcon,
  X,
  Users,
  Package,
  Shield,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { tokenStorage } from "@/lib/api";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  labelKey: string;
  icon: React.ElementType;
  path?: string;
  children?: { labelKey: string; path: string }[];
  disabled?: boolean;
  adminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { labelKey: "sidebar.dashboard", icon: Home, path: "/dashboard" },
  { labelKey: "sidebar.myProfile", icon: User, path: "/profile" },
  { labelKey: "sidebar.makeInvestment", icon: DollarSign, path: "/packages" },
  { labelKey: "sidebar.myTree", icon: TreePine, path: "/tree" },
  { labelKey: "sidebar.deposit", icon: Wallet, path: "/wallet/deposit" },
  { labelKey: "sidebar.depositHistory", icon: FileText, path: "/wallet/deposit-history" },
  { labelKey: "sidebar.transferFunds", icon: ArrowRightLeft, path: "/wallet/transfer" },
  { labelKey: "sidebar.withdrawalFunds", icon: ArrowDownToLine, path: "/wallet/withdraw" },
  { labelKey: "sidebar.withdrawalRequests", icon: FileText, path: "/wallet/withdraw-requests" },
  { labelKey: "sidebar.transactions", icon: ArrowRightLeft, path: "/wallet/transactions" },
  {
    labelKey: "sidebar.income",
    icon: FileText,
    children: [
      { labelKey: "sidebar.directIncome", path: "/income/direct" },
      { labelKey: "sidebar.binaryIncome", path: "/income/binary" },
      { labelKey: "sidebar.referralIncome", path: "/income/referral" },
    ],
  },
  {
    labelKey: "sidebar.reports",
    icon: FileText,
    children: [
      { labelKey: "sidebar.wallets", path: "/reports/wallets" },
      { labelKey: "sidebar.gainReport", path: "/reports/gain-report" },
      { labelKey: "sidebar.trackReferral", path: "/reports/track-referral" },
      { labelKey: "sidebar.rankAndReward", path: "/reports/rank-reward" },
      { labelKey: "sidebar.teamActivation", path: "/reports/team-activation" },
      { labelKey: "sidebar.withdrawal", path: "/wallet/withdraw" },
      { labelKey: "sidebar.withdrawalStatus", path: "/wallet/withdraw-requests" },
      { labelKey: "sidebar.depositFunds", path: "/wallet/deposit" },
      { labelKey: "sidebar.holidayList", path: "/reports/holiday-list" },
      { labelKey: "sidebar.downlineDeposit", path: "/reports/downline-deposit" },
    ],
  },
  { labelKey: "sidebar.marketingTools", icon: Wrench, path: "/marketing-tools", disabled: true },
  { labelKey: "sidebar.contactSupport", icon: HeadphonesIcon, path: "/support" },
];

const adminItems: SidebarItem[] = [
  { labelKey: "admin.userManagement", icon: Users, path: "/admin/users", adminOnly: true },
  { labelKey: "admin.packagesManagement", icon: Package, path: "/admin/packages", adminOnly: true },
  { labelKey: "admin.deposits", icon: Wallet, path: "/admin/deposits", adminOnly: true },
  { labelKey: "admin.packageWalletRules", icon: Wrench, path: "/admin/package-wallet-rules", adminOnly: true },
  { labelKey: "admin.supportedWalletTypes", icon: Wallet, path: "/admin/supported-wallet-types", adminOnly: true },
  { labelKey: "admin.systemSettings", icon: Settings, path: "/admin/settings", adminOnly: true },
  { labelKey: "admin.supportQueries", icon: HeadphonesIcon, path: "/admin/support/queries", adminOnly: true },
  { labelKey: "admin.systemPrune", icon: Shield, path: "/admin/system/prune", adminOnly: true },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ isOpen, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["sidebar.reports"]);
  const isMobile = useIsMobile();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      const profile = JSON.parse(stored);
      setIsAdmin(profile?.role === "ADMIN");
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/auth/logout");
      toast({ title: t("common.success"), description: t("auth.loggedOut") });
    } catch (error) {
      toast({ title: "Warning", description: t("auth.logoutWarning"), variant: "destructive" });
    } finally {
      tokenStorage.clearTokens();
      localStorage.removeItem("userProfile");
      setIsLoggingOut(false);
      navigate("/signin");
    }
  };

  const toggleExpand = (labelKey: string) => {
    setExpandedItems((prev) =>
      prev.includes(labelKey)
        ? prev.filter((item) => item !== labelKey)
        : [...prev, labelKey]
    );
  };

  const isActive = (path?: string) => path && location.pathname === path;
  const isChildActive = (children?: { path: string }[]) =>
    children?.some((child) => location.pathname === child.path);

  const handleNavClick = () => {
    if (isMobile) {
      onToggle();
    }
  };

  const allItems = isAdmin ? [...sidebarItems, ...adminItems] : sidebarItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 z-50",
          isMobile ? "fixed left-0 top-0" : "relative",
          isOpen ? "w-64" : isMobile ? "-translate-x-full w-64" : "w-0 overflow-hidden"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="text-foreground font-semibold text-lg">Vaultire Finance</span>
          </div>
          {isMobile && (
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {allItems.map((item) => (
              <li key={item.labelKey}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.labelKey)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isChildActive(item.children)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} />
                        <span>{t(item.labelKey)}</span>
                      </div>
                      {expandedItems.includes(item.labelKey) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {expandedItems.includes(item.labelKey) && (
                      <ul className="mt-1 ml-6 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              onClick={handleNavClick}
                              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive(child.path)
                                  ? "text-primary"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {t(child.labelKey)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path || "#"}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive(item.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      item.adminOnly && "border-l-2 border-primary"
                    )}
                  >
                    <item.icon size={18} />
                    <span>{t(item.labelKey)}</span>
                    {item.adminOnly && (
                      <Shield size={12} className="ml-auto text-primary" />
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isLoggingOut}
              >
                <LogOut size={18} className="mr-3" />
                {isLoggingOut ? t("sidebar.loggingOut") : t("sidebar.logout")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("auth.logoutConfirm")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("auth.logoutDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("auth.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t("auth.logout")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" onClick={handleNavClick} className="hover:text-foreground transition-colors">
              {t("sidebar.privacyPolicy")}
            </Link>
            <Link to="/terms" onClick={handleNavClick} className="hover:text-foreground transition-colors">
              {t("sidebar.termsOfUse")}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
