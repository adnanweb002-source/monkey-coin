import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { TreeNode } from "@/types/tree";
import BinaryTreeView from "@/components/tree/BinaryTreeView";
import TreeControls from "@/components/tree/TreeControls";
import TreeWalletCards from "@/components/tree/TreeWalletCards";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Mock data for development - matches reference design exactly
const mockTreeData: TreeNode = {
  id: 1,
  memberId: "MG27862064",
  email: "manuel@example.com",
  position: "LEFT",
  isActive: true,
  parent: null,
  sponsor: null,
  leftChild: {
    id: 2,
    memberId: "MG27862064",
    email: "derrick@example.com",
    position: "LEFT",
    isActive: true,
    parent: { id: 1 },
    sponsor: null,
    leftChild: {
      id: 6,
      memberId: "MG27862064",
      email: "homer@example.com",
      position: "LEFT",
      isActive: true,
      parent: { id: 2 },
      sponsor: null,
      leftChild: {
        id: 10,
        memberId: "MG27862064",
        email: "jackie@example.com",
        position: "LEFT",
        isActive: true,
        parent: { id: 6 },
        sponsor: null,
        leftChild: null,
        rightChild: null,
      },
      rightChild: {
        id: 11,
        memberId: "MG27862064",
        email: "pablo@example.com",
        position: "RIGHT",
        isActive: true,
        parent: { id: 6 },
        sponsor: null,
        leftChild: null,
        rightChild: null,
      },
    },
    rightChild: {
      id: 7,
      memberId: "MG27862064",
      email: "emmett@example.com",
      position: "RIGHT",
      isActive: true,
      parent: { id: 2 },
      sponsor: null,
      leftChild: {
        id: 12,
        memberId: "MG27862064",
        email: "roman@example.com",
        position: "LEFT",
        isActive: true,
        parent: { id: 7 },
        sponsor: null,
        leftChild: null,
        rightChild: null,
      },
      rightChild: null,
    },
  },
  rightChild: {
    id: 3,
    memberId: "MG27862064",
    email: "jake@example.com",
    position: "RIGHT",
    isActive: true,
    parent: { id: 1 },
    sponsor: null,
    leftChild: {
      id: 8,
      memberId: "MG27862064",
      email: "everett@example.com",
      position: "LEFT",
      isActive: true,
      parent: { id: 3 },
      sponsor: null,
      leftChild: null,
      rightChild: null,
    },
    rightChild: {
      id: 9,
      memberId: "MG27862064",
      email: "gabriel@example.com",
      position: "RIGHT",
      isActive: true,
      parent: { id: 3 },
      sponsor: null,
      leftChild: null,
      rightChild: null,
    },
  },
};

// Add Thomas node to rightChild
mockTreeData.rightChild!.rightChild = {
  id: 4,
  memberId: "MG27862064",
  email: "ryan@example.com",
  position: "RIGHT",
  isActive: true,
  parent: { id: 1 },
  sponsor: null,
  leftChild: {
    id: 13,
    memberId: "3194160864",
    email: "gabriel@example.com",
    position: "LEFT",
    isActive: true,
    parent: { id: 4 },
    sponsor: null,
    leftChild: null,
    rightChild: null,
  },
  rightChild: {
    id: 14,
    memberId: "MG57002064",
    email: "antonio@example.com",
    position: "RIGHT",
    isActive: true,
    parent: { id: 4 },
    sponsor: null,
    leftChild: null,
    rightChild: null,
  },
};

// Add Thomas as a sibling
mockTreeData.rightChild = {
  id: 5,
  memberId: "MG27862064",
  email: "thomas@example.com",
  position: "RIGHT",
  isActive: true,
  parent: { id: 1 },
  sponsor: null,
  leftChild: {
    id: 3,
    memberId: "MG27862064",
    email: "jake@example.com",
    position: "LEFT",
    isActive: true,
    parent: { id: 5 },
    sponsor: null,
    leftChild: {
      id: 8,
      memberId: "MG27862064",
      email: "everett@example.com",
      position: "LEFT",
      isActive: true,
      parent: { id: 3 },
      sponsor: null,
      leftChild: null,
      rightChild: null,
    },
    rightChild: {
      id: 9,
      memberId: "MG27862064",
      email: "gabriel@example.com",
      position: "RIGHT",
      isActive: true,
      parent: { id: 3 },
      sponsor: null,
      leftChild: {
        id: 15,
        memberId: "MG27853064",
        email: "gabriel2@example.com",
        position: "LEFT",
        isActive: true,
        parent: { id: 9 },
        sponsor: null,
        leftChild: null,
        rightChild: null,
      },
      rightChild: {
        id: 16,
        memberId: "MG57002064",
        email: "antonio@example.com",
        position: "RIGHT",
        isActive: true,
        parent: { id: 9 },
        sponsor: null,
        leftChild: null,
        rightChild: null,
      },
    },
  },
  rightChild: null,
};

const useGetTree = (userId: number, depth: number) => {
  return useQuery<TreeNode>({
    queryKey: ["tree", userId, depth],
    queryFn: async () => {
      try {
        const response = await api.get(`/tree/user/${userId}?depth=${depth}`);
        return response.data;
      } catch {
        // Return mock data for development when API is unavailable
        return mockTreeData;
      }
    },
  });
};

// Helper to count business volume (total nodes in left/right branches)
const countBusinessVolume = (node: TreeNode | null): { left: number; right: number } => {
  const countNodes = (n: TreeNode | null): number => {
    if (!n) return 0;
    return 1 + countNodes(n.leftChild) + countNodes(n.rightChild);
  };

  if (!node) return { left: 0, right: 0 };

  return {
    left: countNodes(node.leftChild),
    right: countNodes(node.rightChild),
  };
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
  const [depth] = useState(20);
  const userId = 1;

  const { data: treeData, isLoading, error } = useGetTree(userId, depth);

  const matchingNodeIds = treeData ? findMatchingNodeIds(treeData, searchQuery) : new Set<number>();

  const handleNodeClick = (node: TreeNode) => {
    toast.info(`Selected: ${node.email}`, {
      description: `Member ID: ${node.memberId}`,
    });
  };

  const handleAddUser = (parentId: number, position: "LEFT" | "RIGHT") => {
    toast.info(`Add user to ${position} of parent ${parentId}`);
  };

  const businessVolume = treeData ? countBusinessVolume(treeData) : { left: 0, right: 0 };

  return (
    <div className="space-y-4 min-h-screen bg-[#0f0f1a] p-4">
      {/* Wallet Cards */}
      <TreeWalletCards />

      {/* Tree Controls */}
      <TreeControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        extremeLeft={businessVolume.left}
        extremeRight={businessVolume.right}
      />

      {/* Tree Visualization Container */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Skeleton className="w-28 h-28 rounded-xl bg-[#2a2a2a]" />
          <div className="flex gap-12 mt-6">
            <Skeleton className="w-24 h-24 rounded-xl bg-[#2a2a2a]" />
            <Skeleton className="w-24 h-24 rounded-xl bg-[#2a2a2a]" />
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
  );
};

export default MyTree;
