import { useState } from "react";
import { TreeNode } from "@/types/tree";
import TreeNodeCard from "./TreeNodeCard";
import AddUserNode from "./AddUserNode";
import { cn } from "@/lib/utils";

interface BinaryTreeViewProps {
  rootNode: TreeNode | null;
  onNodeClick?: (node: TreeNode) => void;
  onAddUser?: (parentId: number, position: "LEFT" | "RIGHT") => void;
  highlightedNodeIds?: Set<number>;
  searchQuery?: string;
}

const BinaryTreeView = ({ rootNode, onNodeClick, onAddUser, highlightedNodeIds, searchQuery }: BinaryTreeViewProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const handleNodeClick = (node: TreeNode) => {
    setSelectedNodeId(node.id);
    onNodeClick?.(node);
  };

  const renderNode = (node: TreeNode | null, parentId?: number, position?: "LEFT" | "RIGHT", depth: number = 0) => {
    if (!node && parentId !== undefined && position) {
      return (
        <div className="flex flex-col items-center">
          <AddUserNode
            position={position}
            parentId={parentId}
            onClick={() => onAddUser?.(parentId, position)}
          />
        </div>
      );
    }

    if (!node) return null;

    const hasChildren = node.leftChild || node.rightChild;

    return (
      <div className="flex flex-col items-center">
        {/* Current Node */}
        <TreeNodeCard
          node={node}
          isRoot={depth === 0}
          isSelected={selectedNodeId === node.id}
          isHighlighted={highlightedNodeIds?.has(node.id) ?? false}
          searchQuery={searchQuery}
          onClick={() => handleNodeClick(node)}
        />

        {/* Connector Lines */}
        {(hasChildren || depth < 2) && (
          <>
            {/* Vertical line from node */}
            <div className="w-0.5 h-6 bg-border" />

            {/* Horizontal line connecting children */}
            <div className="flex items-start w-full justify-center">
              <div className="flex items-center">
                {/* Left branch line */}
                <div className="w-24 h-0.5 bg-border rounded-l-full" />
              </div>
              <div className="w-0.5 h-0.5 bg-border" />
              <div className="flex items-center">
                {/* Right branch line */}
                <div className="w-24 h-0.5 bg-border rounded-r-full" />
              </div>
            </div>

            {/* Children Container */}
            <div className="flex gap-12 mt-0">
              {/* Left Child */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-border" />
                {renderNode(node.leftChild, node.id, "LEFT", depth + 1)}
              </div>

              {/* Right Child */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-border" />
                {renderNode(node.rightChild, node.id, "RIGHT", depth + 1)}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!rootNode) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No tree data available
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full overflow-auto p-8",
      "scrollbar-thin scrollbar-track-background scrollbar-thumb-border"
    )}>
      <div className="min-w-max flex justify-center">
        {renderNode(rootNode)}
      </div>
    </div>
  );
};

export default BinaryTreeView;
