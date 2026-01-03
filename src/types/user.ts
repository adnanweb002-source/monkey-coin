// Valid avatar IDs
export const VALID_AVATAR_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "default"] as const;
export type AvatarId = typeof VALID_AVATAR_IDS[number];

// Helper to get avatar image path
export const getAvatarPath = (avatarId?: string): string => {
  const validId = avatarId && VALID_AVATAR_IDS.includes(avatarId as AvatarId) ? avatarId : "default";
  return `/src/assets/avatars/${validId}.png`;
};

interface UserProfile {
  id: number;
  memberId: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  country: string;
  sponsorId: number;
  parentId: number;
  position: "LEFT" | "RIGHT";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  isG2faEnabled: boolean;
  role?: "USER" | "ADMIN";
  leftBv?: number;
  rightBv?: number;
  avatarId?: string;
}


export type { UserProfile };
