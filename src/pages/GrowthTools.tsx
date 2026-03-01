
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import AffiliateLinksCard from "@/components/dashboard/AffiliateLinksCard";
import { PackageIcon } from "lucide-react";
import { UserProfile } from "@/types/user";

const GrowthTools = () => {
  const {
    data: packages = [],
    isLoading: isLoadingPackages,
    isError,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const response = await api.get("/packages");
      return response.data;
    },
  });

  let user: UserProfile | null = null;
  try {
    const profileStr = localStorage.getItem("userProfile");
    if (profileStr) user = JSON.parse(profileStr);
  } catch { /* ignore */ }


  if (isLoadingPackages) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Investment Packages
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose a package to start investing
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Growth Tools</h1>
          <p className="text-muted-foreground mt-1">
            Grow your network and increase your income
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
            <PackageIcon size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-lg font-medium">
            Failed to load growth tools
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Growth Tools</h1>
        <p className="text-muted-foreground mt-1 mb-6">
          Grow your network and increase your income
        </p>
        <AffiliateLinksCard user={user} />
      </div>
    </div>
  );
};

export default GrowthTools;
