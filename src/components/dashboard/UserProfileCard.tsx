import { getAvatarPath } from "@/types/user";
import type { UserProfile } from "@/types/user";
import { MapPin, Mail, Phone, Shield } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const UserProfileCard = ({ user }: { user: UserProfile | null }) => {
  if (!user) return null;

  const copyMemberId = async () => {
    if (!user.memberId) return;
    await navigator.clipboard.writeText(user.memberId);
    toast.success("Member ID copied!");
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center h-full">
      <div className="w-20 h-20 rounded-full border-2 border-primary/40 overflow-hidden mb-4">
        <img
          src={getAvatarPath(user.avatarId)}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>

      <h3 className="text-lg font-bold text-foreground">
        {user.firstName} {user.lastName}
      </h3>
      <p className="text-xs text-muted-foreground mt-1 font-mono">
        {user.memberId}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={copyMemberId}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </p>

      <div className="w-full mt-5 space-y-3 text-left">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
        {user.phoneNumber && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{user.phoneNumber}</span>
          </div>
        )}
        {user.country && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{user.country}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
          <span
            className={
              user.status === "ACTIVE" ? "text-green-500" : "text-destructive"
            }
          >
            {user.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
