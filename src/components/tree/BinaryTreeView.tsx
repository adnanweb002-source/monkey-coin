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

const NODE_WIDTH = 120;
const HORIZONTAL_GAP = 16;
const VERTICAL_GAP = 50;

const BinaryTreeView = ({ rootNode, onNodeClick, onAddUser, highlightedNodeIds, searchQuery }: BinaryTreeViewProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const handleNodeClick = (node: TreeNode) => {
    setSelectedNodeId(node.id);
    onNodeClick?.(node);
  };

  // Calculate the width needed for a subtree
  const getSubtreeWidth = (depth: number): number => {
    if (depth <= 0) return NODE_WIDTH;
    return getSubtreeWidth(depth - 1) * 2 + HORIZONTAL_GAP;
  };

  const renderNode = (
    node: TreeNode | null, 
    parentId?: number, 
    position?: "LEFT" | "RIGHT", 
    depth: number = 0,
    maxDepth: number = 5
  ): React.ReactNode => {
    const subtreeWidth = getSubtreeWidth(maxDepth - depth);
    const childSubtreeWidth = getSubtreeWidth(maxDepth - depth - 1);

    // Show AddUserNode for null children
    if (!node && parentId !== undefined && position) {
      return (
        <div 
          className="flex flex-col items-center"
          style={{ width: subtreeWidth }}
        >
          <AddUserNode
            position={position}
            parentId={parentId}
            onClick={() => onAddUser?.(parentId, position)}
          />
        </div>
      );
    }

    if (!node) return null;

    const hasLeftChild = node.leftChild !== undefined;
    const hasRightChild = node.rightChild !== undefined;
    const showChildren = hasLeftChild || hasRightChild || depth < maxDepth;

    return (
      <div 
        className="flex flex-col items-center"
        style={{ width: subtreeWidth }}
      >
        {/* Current Node */}
        <TreeNodeCard
          node={node}
          isRoot={depth === 0}
          isSelected={selectedNodeId === node.id}
          isHighlighted={highlightedNodeIds?.has(node.id) ?? false}
          searchQuery={searchQuery}
          onClick={() => handleNodeClick(node)}
        />

        {/* Connector Lines & Children */}
        {showChildren && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical line from parent node */}
            <div 
              className="bg-border/70"
              style={{ 
                width: 2, 
                height: VERTICAL_GAP / 2 
              }} 
            />

            {/* Horizontal connector bar with vertical drops */}
            <div 
              className="relative flex items-start justify-center"
              style={{ width: childSubtreeWidth * 2 + HORIZONTAL_GAP }}
            >
              {/* Horizontal line */}
              <div 
                className="absolute top-0 bg-border/70"
                style={{ 
                  height: 2,
                  left: childSubtreeWidth / 2,
                  right: childSubtreeWidth / 2,
                }}
              />
              
              {/* Left vertical connector */}
              <div 
                className="absolute bg-border/70"
                style={{ 
                  width: 2,
                  height: VERTICAL_GAP / 2,
                  left: childSubtreeWidth / 2,
                  top: 0
                }}
              />
              
              {/* Right vertical connector */}
              <div 
                className="absolute bg-border/70"
                style={{ 
                  width: 2,
                  height: VERTICAL_GAP / 2,
                  right: childSubtreeWidth / 2,
                  top: 0
                }}
              />
            </div>

            {/* Children Container */}
            <div 
              className="flex justify-center"
              style={{ 
                marginTop: VERTICAL_GAP / 2 - 2,
                gap: HORIZONTAL_GAP
              }}
            >
              {/* Left Child Branch */}
              <div 
                className="flex flex-col items-center"
                style={{ width: childSubtreeWidth }}
              >
                {renderNode(node.leftChild ?? null, node.id, "LEFT", depth + 1, maxDepth)}
              </div>

              {/* Right Child Branch */}
              <div 
                className="flex flex-col items-center"
                style={{ width: childSubtreeWidth }}
              >
                {renderNode(node.rightChild ?? null, node.id, "RIGHT", depth + 1, maxDepth)}
              </div>
            </div>
          </div>
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
