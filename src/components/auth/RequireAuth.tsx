import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { tokenStorage } from "@/lib/api";
import type { UserProfile } from "@/types/user";

interface RequireAuthProps {
  children: React.ReactNode;
  require2FA?: boolean;
}

const RequireAuth = ({ children, require2FA = true }: RequireAuthProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [has2FA, setHas2FA] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = tokenStorage.getAccessToken();
      const profileStr = localStorage.getItem("userProfile");

      if (!token || !profileStr) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const profile: UserProfile = JSON.parse(profileStr);
        setIsAuthenticated(true);
        setHas2FA(profile.isG2faEnabled);
      } catch {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Authenticated but 2FA not enabled - redirect to setup
  // Exception: if we're already on the 2FA setup page
  if (require2FA && !has2FA && location.pathname !== "/security/2fa/setup") {
    return <Navigate to="/security/2fa/setup" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
