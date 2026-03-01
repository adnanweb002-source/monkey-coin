import { Copy, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { getAvatarPath } from "@/types/user";
import type { UserProfile } from "@/types/user";

const DOMAIN = window.location.origin;

interface TreeStats {
  leftTotal: number;
  leftActive: number;
  rightTotal: number;
  rightActive: number;
}

const AffiliateLinksCard = ({ user }: { user: UserProfile | null }) => {
  const memberId = user?.memberId || "";

  const { data: treeStats, isLoading } = useQuery<TreeStats>({
    queryKey: ["affiliate-tree-stats", user?.id],
    queryFn: async () => {
      try {
        const res = await api.get(`/tree/user/${user?.id}?depth=200`);
        const tree = res.data;
        return {
          leftTotal: tree?.leftChild ? 1 : 0,
          leftActive: tree?.leftChild?.isActive ? 1 : 0,
          rightTotal: tree?.rightChild ? 1 : 0,
          rightActive: tree?.rightChild?.isActive ? 1 : 0,
        };
      } catch {
        return { leftTotal: 0, leftActive: 0, rightTotal: 0, rightActive: 0 };
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const buildAffiliateLink = (
    sponsorMemberId: string,
    position: "LEFT" | "RIGHT",
  ) => {
    return `${DOMAIN}/signup?ref=${sponsorMemberId}&position=${position}`;
  };

  const leftLink = memberId ? buildAffiliateLink(memberId, "LEFT") : "";

  const rightLink = memberId ? buildAffiliateLink(memberId, "RIGHT") : "";

  const copyLink = async (link: string, side: string) => {
    if (!link) return;

    await navigator.clipboard.writeText(link);
    toast.success(`${side} affiliate link copied!`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
        Affiliate Links
      </h3>

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-primary/40 overflow-hidden">
          <img
            src={getAvatarPath(user?.avatarId)}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Two branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground font-medium mb-2">
            LEFT LINK
          </p>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-muted-foreground truncate flex-1 font-mono">
              {leftLink}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => copyLink(leftLink, "Left")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> {treeStats?.leftTotal ?? 0}{" "}
                Total
              </span>
              <span className="flex items-center gap-1 text-primary">
                <UserCheck className="h-3.5 w-3.5" />{" "}
                {treeStats?.leftActive ?? 0} Active
              </span>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground font-medium mb-2">
            RIGHT LINK
          </p>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-muted-foreground truncate flex-1 font-mono">
              {rightLink}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => copyLink(rightLink, "Right")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> {treeStats?.rightTotal ?? 0}{" "}
                Total
              </span>
              <span className="flex items-center gap-1 text-primary">
                <UserCheck className="h-3.5 w-3.5" />{" "}
                {treeStats?.rightActive ?? 0} Active
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliateLinksCard;
