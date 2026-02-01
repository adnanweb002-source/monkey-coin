import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Moon, Sun, Plus, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { UserProfile } from "@/types/user";
import { useIsMobile } from "@/hooks/use-mobile";
import UserAvatar from "@/components/common/UserAvatar";
import LanguageSelector from "@/components/common/LanguageSelector";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

const DashboardHeader = ({
  onMenuClick,
  showMenuButton,
}: DashboardHeaderProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      setUserProfile(JSON.parse(stored));
    }

    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profileUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileUpdated", handleStorageChange);
    };
  }, []);

  const formatDateTime = (date: Date) => {
    return (
      date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      ", " +
      date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) +
      ", " +
      date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "Europe/London" })
    );
  };

  return (
    <header className="h-14 md:h-16 px-4 md:px-6 bg-background border-b border-border flex items-center justify-between shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-2 md:gap-4">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          >
            <Menu size={20} />
          </button>
        )}

        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          {t("header.dashboard")}
        </h1>

        {!isMobile && (
          <>
            <LanguageSelector />

            <span className="text-primary text-sm font-medium">
              {formatDateTime(currentDateTime)}
            </span>
          </>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-4">
        {isMobile && <LanguageSelector compact />}

        {!isMobile && (
          <Link
            to="/wallet/deposit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            <span>{t("header.deposit")}</span>
          </Link>
        )}

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center text-foreground"
        >
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center text-foreground relative">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
            2
          </span>
        </button>

        {/* User profile */}
        <Link
          to="/profile"
          className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity"
        >
          <UserAvatar
            avatarId={userProfile?.avatarId}
            size={isMobile ? "sm" : "md"}
            alt={
              userProfile
                ? `${userProfile.firstName} ${userProfile.lastName}`
                : "User avatar"
            }
          />
          {!isMobile && (
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {userProfile
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : "User"}
              </p>
              <p className="text-xs text-primary">
                {userProfile?.role === "ADMIN"
                  ? t("common.admin")
                  : userProfile?.status === "ACTIVE"
                    ? t("common.active")
                    : t("common.user")}
              </p>
            </div>
          )}
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader;
