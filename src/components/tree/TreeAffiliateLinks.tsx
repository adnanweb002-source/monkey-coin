import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const DOMAIN = window.location.origin;

const buildAffiliateLink = (
  sponsorMemberId: string,
  position: "LEFT" | "RIGHT",
) => `${DOMAIN}/panel/signup?ref=${sponsorMemberId}&position=${position}`;

interface TreeAffiliateLinksProps {
  memberId: string | null | undefined;
}

/**
 * Compact left/right referral copy actions for the binary tree page (same URLs as Affiliate Links card).
 */
const TreeAffiliateLinks = ({ memberId }: TreeAffiliateLinksProps) => {
  const { t } = useTranslation();
  const mid = memberId?.trim() || "";
  const leftLink = mid ? buildAffiliateLink(mid, "LEFT") : "";
  const rightLink = mid ? buildAffiliateLink(mid, "RIGHT") : "";

  const copyLink = async (link: string, sideLabel: string) => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success(t("tree.affiliateLinkCopied", { side: sideLabel }));
  };

  if (!mid) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        {t("tree.affiliateLinksUnavailable")}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
        {t("tree.yourAffiliateLinks")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border px-3 py-2 min-w-0">
          <span className="text-xs font-semibold text-primary shrink-0 w-12">
            {t("tree.left")}
          </span>
          <p className="text-xs text-muted-foreground truncate flex-1 font-mono min-w-0">
            {leftLink}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => copyLink(leftLink, t("tree.left"))}
            aria-label={t("tree.copyLeftLink")}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border px-3 py-2 min-w-0">
          <span className="text-xs font-semibold text-primary shrink-0 w-12">
            {t("tree.right")}
          </span>
          <p className="text-xs text-muted-foreground truncate flex-1 font-mono min-w-0">
            {rightLink}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => copyLink(rightLink, t("tree.right"))}
            aria-label={t("tree.copyRightLink")}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TreeAffiliateLinks;
