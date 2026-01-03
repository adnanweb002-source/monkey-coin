export interface TreeNode {
  id: number;
  memberId: string;
  email: string;
  position: "LEFT" | "RIGHT";
  isActive: boolean;
  parent: { id: number } | null;
  leftChild: TreeNode | null;
  rightChild: TreeNode | null;
  sponsor: any | null;
  // Extended optional fields for hover details
  fullName?: string;
  joinDate?: string;
  createdAt?: string;
  rank?: string;
  leftBv?: number | string;
  rightBv?: number | string;
  activePackageCount?: number;
  avatarId?: string;
}

export interface TreeApiParams {
  userId: number;
  depth?: number;
}
