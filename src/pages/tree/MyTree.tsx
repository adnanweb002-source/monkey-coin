import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { TreeNode } from "@/types/tree";
import BinaryTreeView from "@/components/tree/BinaryTreeView";
import TreeWalletCards from "@/components/tree/TreeWalletCards";
import TreeControls from "@/components/tree/TreeControls";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

const useGetTree = (userId: number, depth: number) => {
  return useQuery<TreeNode>({
    queryKey: ["tree", userId, depth],
    queryFn: async () => {
      const response = await api.get(`/tree/user/${userId}?depth=${depth}`);
      return response.data;
    },
  });
};

// Helper to count extreme positions
const countExtremePositions = (node: TreeNode | null): { left: number; right: number } => {
  if (!node) return { left: 0, right: 0 };

  let leftCount = 0;
  let rightCount = 0;

  // Count left extremes
  let current = node;
  while (current?.leftChild) {
    leftCount++;
    current = current.leftChild;
  }

  // Count right extremes
  current = node;
  while (current?.rightChild) {
    rightCount++;
    current = current.rightChild;
  }

  return { left: leftCount, right: rightCount };
};

// Helper to check if a node matches search query
const nodeMatchesSearch = (node: TreeNode | null, query: string): boolean => {
  if (!node || !query.trim()) return false;
  const lowerQuery = query.toLowerCase().trim();
  return (
    node.memberId?.toLowerCase().includes(lowerQuery) ||
    node.email?.toLowerCase().includes(lowerQuery)
  );
};

// Helper to collect all matching node IDs in the tree
const findMatchingNodeIds = (node: TreeNode | null, query: string): Set<number> => {
  const matches = new Set<number>();
  if (!node || !query.trim()) return matches;

  const traverse = (n: TreeNode | null) => {
    if (!n) return;
    if (nodeMatchesSearch(n, query)) {
      matches.add(n.id);
    }
    traverse(n.leftChild);
    traverse(n.rightChild);
  };

  traverse(node);
  return matches;
};

const MyTree = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [depth] = useState(2);
  const userId = 1; // This would come from auth context

  const { data: treeData, isLoading, error } = useGetTree(userId, depth);

  // Find matching nodes based on search query
  const matchingNodeIds = treeData ? findMatchingNodeIds(treeData, searchQuery) : new Set<number>();

  const handleNodeClick = (node: TreeNode) => {
    toast.info(`Selected: ${node.email}`, {
      description: `Member ID: ${node.memberId}`,
    });
  };

  const handleAddUser = (parentId: number, position: "LEFT" | "RIGHT") => {
    toast.info(`Add user to ${position} of parent ${parentId}`);
    // This would open a modal or navigate to add user page
  };

  const extremePositions = treeData ? countExtremePositions(treeData) : { left: 0, right: 0 };

  return (
    <div className="space-y-6">
      {/* Wallet Cards */}
      <TreeWalletCards />

      {/* Tree Controls */}
      <TreeControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        extremeLeft={extremePositions.left}
        extremeRight={extremePositions.right}
      />

      {/* Tree Visualization Container */}
      <div className="bg-card rounded-2xl border border-border min-h-[500px] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Skeleton className="w-32 h-32 rounded-2xl" />
            <div className="flex gap-16 mt-8">
              <Skeleton className="w-32 h-32 rounded-2xl" />
              <Skeleton className="w-32 h-32 rounded-2xl" />
            </div>
            <div className="flex gap-8 mt-8">
              <Skeleton className="w-28 h-28 rounded-2xl" />
              <Skeleton className="w-28 h-28 rounded-2xl" />
              <Skeleton className="w-28 h-28 rounded-2xl" />
              <Skeleton className="w-28 h-28 rounded-2xl" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-destructive gap-3">
            <AlertCircle className="w-12 h-12" />
            <span className="text-lg font-medium">Failed to load tree data</span>
            <span className="text-muted-foreground text-sm">Please try again later</span>
          </div>
        ) : (
          <BinaryTreeView
            rootNode={treeData || null}
            onNodeClick={handleNodeClick}
            onAddUser={handleAddUser}
            highlightedNodeIds={matchingNodeIds}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default MyTree;
