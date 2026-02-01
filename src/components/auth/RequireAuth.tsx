import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
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
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/get-profile");
        const profile: UserProfile = res.data;

        localStorage.setItem("userProfile", JSON.stringify(profile));
        setIsAuthenticated(true);
        setHas2FA(profile.isG2faEnabled || false);

        // check if admin and environment is production
        if (
          profile.role === "ADMIN" &&
          import.meta.env.VITE_ENVIRONMENT === "production" &&
          window.location.hostname !== "admin.gogex.xyz"
        ) {
          window.location.href = "https://admin.gogex.xyz";
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setIsAuthenticated(false);
        localStorage.removeItem("userProfile");
      } finally {
        setIsLoading(false);
      }
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

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
