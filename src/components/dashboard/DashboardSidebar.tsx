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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
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
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-lg">L</span>
          </div>
          {!isCollapsed && (
            <span className="text-sidebar-foreground font-semibold text-lg">Logo</span>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  {item.children ? (
                    <Collapsible
                      open={expandedItems.includes(item.label) && !isCollapsed}
                      onOpenChange={() => toggleExpand(item.label)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.label}
                          isActive={isChildActive(item.children)}
                        >
                          <item.icon className="shrink-0" />
                          <span>{item.label}</span>
                          {expandedItems.includes(item.label) ? (
                            <ChevronDown className="ml-auto shrink-0" />
                          ) : (
                            <ChevronRight className="ml-auto shrink-0" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.path}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(child.path)}
                              >
                                <Link to={child.path}>{child.label}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive(item.path)}
                    >
                      <Link to={item.path || "#"}>
                        <item.icon className="shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!isCollapsed && (
          <div className="flex gap-4 text-xs text-sidebar-foreground/70">
            <Link to="/privacy" className="hover:text-sidebar-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-sidebar-foreground transition-colors">
              Terms of Use
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
