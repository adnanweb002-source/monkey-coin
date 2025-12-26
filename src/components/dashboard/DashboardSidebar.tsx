import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Menu,
  X,
  Users,
  Shield,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string }[];
  disabled?: boolean;
  adminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Make Investment", icon: DollarSign, path: "/packages" },
  { label: "My Tree", icon: TreePine, path: "/tree" },
  { label: "Deposit", icon: Wallet, path: "/wallet/deposit" },
  { label: "Deposit Requests", icon: FileText, path: "/wallet/deposit-requests" },
  { label: "Transfer Funds", icon: ArrowRightLeft, path: "/wallet/transfer" },
  { label: "Withdrawal Funds", icon: ArrowDownToLine, path: "/wallet/withdraw" },
  { label: "Withdrawal Requests", icon: FileText, path: "/wallet/withdraw-requests" },
  { label: "Transactions", icon: ArrowRightLeft, path: "/wallet/transactions" },
  {
    label: "Reports",
    icon: FileText,
    disabled: true,
    children: [
      { label: "Wallet", path: "/reports/wallet" },
      { label: "Direct Income", path: "/reports/direct-income" },
      { label: "Binary Income", path: "/reports/binary-income" },
      { label: "Team Activation", path: "/reports/team-activation" },
      { label: "Track Referral", path: "/reports/track-referral" },
      { label: "Gain Report", path: "/reports/gain" },
      { label: "Withdrawal", path: "/reports/withdrawal" },
      { label: "Withdrawal Status", path: "/reports/withdrawal-status" },
      { label: "Deposit Funds", path: "/reports/deposit-funds" },
      { label: "Holiday List", path: "/reports/holiday-list" },
      { label: "Rank and Reward", path: "/reports/rank-reward" },
      { label: "Downline Deposit Fund", path: "/reports/downline-deposit" },
    ],
  },
  { label: "Marketing Tools", icon: Wrench, path: "/marketing-tools", disabled: true },
  { label: "Contact Support", icon: HeadphonesIcon, path: "/support", disabled: true },
];

const adminItems: SidebarItem[] = [
  { label: "User Management", icon: Users, path: "/admin/users", adminOnly: true },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ isOpen, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Reports"]);
  const isMobile = useIsMobile();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      const profile = JSON.parse(stored);
      setIsAdmin(profile?.role === "ADMIN");
    }
  }, []);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
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

  const allItems = isAdmin ? [...sidebarItems.slice(0, 1), ...adminItems, ...sidebarItems.slice(1)] : sidebarItems;

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
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <span className="text-foreground font-semibold text-lg">Monkey Coin</span>
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
              <li key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isChildActive(item.children)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </div>
                      {expandedItems.includes(item.label) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {expandedItems.includes(item.label) && (
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
                              {child.label}
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
                    <span>{item.label}</span>
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
        <div className="p-4 border-t border-border">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" onClick={handleNavClick} className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" onClick={handleNavClick} className="hover:text-foreground transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
