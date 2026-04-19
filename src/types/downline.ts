export interface DownlineMemberRow {
  id: number;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  status: string;
  position: "LEFT" | "RIGHT" | null;
  sponsorId: number | null;
  createdAt: string;
  avatarId: string;
  currentRank: number;
  activePackageCount: number;
  totalDeposits: string;
  totalWithdrawals: string;
  totalPackageAmount: string;
}

export interface DownlineMembersResponse {
  data: DownlineMemberRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
