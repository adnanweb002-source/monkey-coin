import { cn } from "@/lib/utils";
import { VALID_AVATAR_IDS, type AvatarId } from "@/types/user";

// Import all avatar images
import avatar1 from "@/assets/avatars/1.png";
import avatar2 from "@/assets/avatars/2.png";
import avatar3 from "@/assets/avatars/3.png";
import avatar4 from "@/assets/avatars/4.png";
import avatar5 from "@/assets/avatars/5.png";
import avatar6 from "@/assets/avatars/6.png";
import avatar7 from "@/assets/avatars/7.png";
import avatar8 from "@/assets/avatars/8.png";
import avatar9 from "@/assets/avatars/9.png";
import avatar10 from "@/assets/avatars/10.png";
import avatarDefault from "@/assets/avatars/default.png";

// Avatar image map
const AVATAR_IMAGES: Record<AvatarId, string> = {
  "1": avatar1,
  "2": avatar2,
  "3": avatar3,
  "4": avatar4,
  "5": avatar5,
  "6": avatar6,
  "7": avatar7,
  "8": avatar8,
  "9": avatar9,
  "10": avatar10,
  "default": avatarDefault,
};

export const getAvatarImage = (avatarId?: string): string => {
  const validId = avatarId && VALID_AVATAR_IDS.includes(avatarId as AvatarId) ? avatarId as AvatarId : "default";
  return AVATAR_IMAGES[validId];
};

interface UserAvatarProps {
  avatarId?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
}

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

const UserAvatar = ({ avatarId, size = "md", className, alt = "User avatar" }: UserAvatarProps) => {
  const imageSrc = getAvatarImage(avatarId);

  return (
    <div className={cn("rounded-full overflow-hidden shrink-0", sizeClasses[size], className)}>
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

export default UserAvatar;
