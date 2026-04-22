import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api, { getErrorMessage } from "@/lib/api";
import { TreeNode } from "@/types/tree";
import BinaryTreeView from "@/components/tree/BinaryTreeView";
import TreeControls from "@/components/tree/TreeControls";
import TreeAffiliateLinks from "@/components/tree/TreeAffiliateLinks";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import WalletCards from "@/components/dashboard/WalletCards";
import { useGetWallets } from "../api";

const useGetTree = (userId: number, depth: number) => {
  return useQuery<TreeNode>({
    queryKey: ["tree", userId, depth],
    queryFn: async () => {
      try {
        const response = await api.get(`/tree/user/${userId}?depth=${depth}`);
        return response.data;
      } catch {
        return {} as TreeNode;
      }
    },
  });
};

const nodeMatchesSearch = (node: TreeNode | null, query: string): boolean => {
  if (!node || !query.trim()) return false;
  const lowerQuery = query.toLowerCase().trim();
  return (
    node.memberId?.toLowerCase().includes(lowerQuery) ||
    node.email?.toLowerCase().includes(lowerQuery) ||
    node.fullName?.toLowerCase().includes(lowerQuery)
  );
};

const findMatchingNodeIds = (
  node: TreeNode | null,
  query: string,
): Set<number> => {
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
  const [depth] = useState(3);

  let userId = 1;
  let memberId: string | null = null;
  try {
    const raw = localStorage.getItem("userProfile");
    if (raw) {
      const p = JSON.parse(raw) as { id?: number; memberId?: string };
      if (typeof p?.id === "number") userId = p.id;
      memberId = p.memberId ?? null;
    }
  } catch {
    /* keep defaults */
  }

  const [currentRootId, setCurrentRootId] = useState<number>(userId);
  /** Stack of previous tree roots when drilling into child nodes (for Shift Up). */
  const [rootHistory, setRootHistory] = useState<number[]>([]);
  const [isShiftUpLoading, setIsShiftUpLoading] = useState(false);

  const { data: wallets } = useGetWallets();

  const { data: treeData, isLoading, error } = useGetTree(currentRootId, depth);

  const matchingNodeIds = treeData
    ? findMatchingNodeIds(treeData, searchQuery)
    : new Set<number>();

  const handleNodeClick = (node: TreeNode) => {
    if (node.id === currentRootId) return;
    setRootHistory((prev) => [...prev, currentRootId]);
    setCurrentRootId(node.id);

    toast.info(`Selected: ${node.email}`, {
      description: `Member ID: ${node.memberId}`,
    });
  };

  const handleMyPosition = () => {
    setCurrentRootId(userId);
    setRootHistory([]);
  };

  const handleShiftUp = async () => {
    if (rootHistory.length > 0) {
      setRootHistory((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const parentRoot = next.pop()!;
        setCurrentRootId(parentRoot);
        return next;
      });
      return;
    }
    setIsShiftUpLoading(true);
    try {
      const res = await api.get<{ userId: number }>(
        "/tree/search/shift-up",
        { params: { currentNodeUserId: String(currentRootId) } },
      );
      const parentId = res.data?.userId;
      if (parentId != null) {
        setCurrentRootId(parentId);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Could not shift up");
    } finally {
      setIsShiftUpLoading(false);
    }
  };

  const handleAddUser = (parentId: string, position: "LEFT" | "RIGHT") => {
    toast.info(`Add user to ${position} of parent ${parentId}`);
    window.open(
      `/panel/signup?ref=${memberId}&position=${position}&parent=${parentId}`,
      "_blank",
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter Member ID");
      return;
    }

    try {
      const res = await api.get(
        `/tree/search/member?memberId=${searchQuery}&rootUserId=${userId}`,
      );

      const foundUserId = res.data?.userId;

      if (foundUserId) {
        setRootHistory([]);
        setCurrentRootId(foundUserId);

        toast.success("User found", {
          description: `Jumped to ${searchQuery}`,
        });
      } else {
        toast.error("User not found in your tree");
      }
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err) || "User not found in your downline",
      );
    }
  };

  const handleExtremeLeftClick = async () => {
    try {
      const res = await api.get(
        `/tree/search/extreme-left?rootUserId=${userId}`,
      );

      const foundUserId = res.data?.userId;

      if (foundUserId) {
        setRootHistory([]);
        setCurrentRootId(foundUserId);

        toast.success("User found", {
          description: `Jumped to extreme left`,
        });
      } else {
        toast.error("User not found in your tree");
      }
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err) || "User not found in your downline",
      );
    }
  };

  const handleExtremeRightClick = async () => {
    try {
      const res = await api.get(
        `/tree/search/extreme-right?rootUserId=${userId}`,
      );

      const foundUserId = res.data?.userId;

      if (foundUserId) {
        setRootHistory([]);
        setCurrentRootId(foundUserId);

        toast.success("User found", {
          description: `Jumped to extreme right`,
        });
      } else {
        toast.error("User not found in your tree");
      }
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err) || "User not found in your downline",
      );
    }
  };

  return (
    <div className="space-y-4 min-h-screen p-4">
      <div className="mb-6">
        <WalletCards wallets={wallets} />
      </div>

      <TreeAffiliateLinks memberId={memberId} />

      <TreeControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        onExtremeLeftClick={handleExtremeLeftClick}
        onExtremeRightClick={handleExtremeRightClick}
        onMyPosition={handleMyPosition}
        onShiftUp={handleShiftUp}
        shiftUpLoading={isShiftUpLoading}
        currentRootId={currentRootId}
        userId={userId}
      />

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
          <span className="text-muted-foreground text-sm">
            Please try again later
          </span>
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
