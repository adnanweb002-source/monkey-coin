import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { TreeNode } from "@/types/tree";
import BinaryTreeView from "@/components/tree/BinaryTreeView";
import TreeControls from "@/components/tree/TreeControls";
import TreeWalletCards from "@/components/tree/TreeWalletCards";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
      id: 4,
      memberId: "MG27862064",
      email: "ryan@example.com",
      position: "RIGHT",
      isActive: true,
      parent: { id: 1 },
      sponsor: null,
      leftChild: {
        id: 13,
        memberId: "MG27862064",
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
        memberId: "MG27862064",
        email: "gabriel2@example.com",
        position: "RIGHT",
        isActive: true,
        parent: { id: 4 },
        sponsor: null,
        leftChild: null,
        rightChild: null,
      },
    },
  },
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
  const [depth] = useState(20);
  const [currentPage, setCurrentPage] = useState(4);
  const totalPages = 13;
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

  const extremePositions = treeData ? countExtremePositions(treeData) : { left: 0, right: 0 };

  return (
    <div className="space-y-6 min-h-screen bg-[#1a1a1a] p-6">
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
      <div className="min-h-[600px] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Skeleton className="w-32 h-32 rounded-2xl bg-[#2a2a2a]" />
            <div className="flex gap-16 mt-8">
              <Skeleton className="w-32 h-32 rounded-2xl bg-[#2a2a2a]" />
              <Skeleton className="w-32 h-32 rounded-2xl bg-[#2a2a2a]" />
            </div>
            <div className="flex gap-8 mt-8">
              <Skeleton className="w-28 h-28 rounded-2xl bg-[#2a2a2a]" />
              <Skeleton className="w-28 h-28 rounded-2xl bg-[#2a2a2a]" />
              <Skeleton className="w-28 h-28 rounded-2xl bg-[#2a2a2a]" />
              <Skeleton className="w-28 h-28 rounded-2xl bg-[#2a2a2a]" />
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

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pb-6">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="px-6 py-2 rounded-lg bg-[#2a2a2a] text-white font-medium">
          {currentPage} / {totalPages}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default MyTree;
