import { useState } from "react";
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
} from "lucide-react";

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string }[];
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Make Investment", icon: DollarSign, path: "/investment" },
  { label: "My Tree", icon: TreePine, path: "/tree" },
  { label: "Deposit", icon: Wallet, path: "/deposit" },
  { label: "Transfer Funds", icon: ArrowRightLeft, path: "/transfer" },
  { label: "Withdrawal Funds", icon: ArrowDownToLine, path: "/withdrawal" },
  {
    label: "Reports",
    icon: FileText,
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
  { label: "Marketing Tools", icon: Wrench, path: "/marketing-tools" },
  { label: "Contact Support", icon: HeadphonesIcon, path: "/support" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Reports"]);

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

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">L</span>
          </div>
          <span className="text-foreground font-semibold text-lg">Logo</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms of Use
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
