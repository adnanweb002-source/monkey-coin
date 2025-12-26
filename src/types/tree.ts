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
}

export interface TreeApiParams {
  userId: number;
  depth?: number;
}
