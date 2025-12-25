import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Moon, Sun, Plus, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { UserProfile } from "@/types/user";

const DashboardHeader = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      setUserProfile(JSON.parse(stored));
    }

    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) + ", " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + ", " + date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <header className="h-16 px-6 bg-background border-b border-border flex items-center justify-between shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        
        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
          <span>🌐</span>
          <span>Language</span>
          <ChevronDown size={14} />
        </button>
        
        <span className="text-primary text-sm font-medium">
          {formatDateTime(currentDateTime)}
        </span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <Link
          to="/wallet/deposit"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          <span>Deposit</span>
        </Link>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground"
        >
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground relative">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
            2
          </span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-foreground">👤</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "User"}
            </p>
            <p className="text-xs text-primary">
              {userProfile?.status === "ACTIVE" ? "Active" : "Super Admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
