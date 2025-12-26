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
}


export type { UserProfile };
