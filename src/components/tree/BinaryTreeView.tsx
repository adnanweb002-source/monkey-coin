import { useState, useRef, useEffect } from "react";
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
const NODE_HEIGHT = 130;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 80;
const CONNECTOR_COLOR = "#D4A853"; // Golden/amber color matching reference

const BinaryTreeView = ({ 
  rootNode, 
  onNodeClick, 
  onAddUser, 
  highlightedNodeIds, 
  searchQuery 
}: BinaryTreeViewProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = (node: TreeNode) => {
    setSelectedNodeId(node.id);
    onNodeClick?.(node);
  };

  // Calculate the maximum depth of the tree
  const getMaxDepth = (node: TreeNode | null, currentDepth: number = 0): number => {
    if (!node) return currentDepth;
    const leftDepth = getMaxDepth(node.leftChild, currentDepth + 1);
    const rightDepth = getMaxDepth(node.rightChild, currentDepth + 1);
    return Math.max(leftDepth, rightDepth);
  };

  // Calculate width needed for a subtree at a given depth
  const getSubtreeWidth = (node: TreeNode | null, showAddPlaceholder: boolean = true): number => {
    if (!node) {
      return showAddPlaceholder ? NODE_WIDTH : 0;
    }

    const hasLeft = node.leftChild !== null;
    const hasRight = node.rightChild !== null;

    if (!hasLeft && !hasRight) {
      // Leaf node - show 2 add placeholders below
      return (NODE_WIDTH * 2) + HORIZONTAL_SPACING;
    }

    const leftWidth = getSubtreeWidth(node.leftChild, !hasLeft);
    const rightWidth = getSubtreeWidth(node.rightChild, !hasRight);

    return leftWidth + HORIZONTAL_SPACING + rightWidth;
  };

  // Render curved SVG connector line
  const renderConnector = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const midY = startY + (endY - startY) * 0.5;
    
    // Create smooth curved path
    const path = `M ${startX} ${startY} 
                  L ${startX} ${midY - 10}
                  Q ${startX} ${midY}, ${startX + (endX - startX) * 0.3} ${midY}
                  L ${endX - (endX - startX) * 0.3} ${midY}
                  Q ${endX} ${midY}, ${endX} ${midY + 10}
                  L ${endX} ${endY}`;

    return (
      <path
        d={path}
        fill="none"
        stroke={CONNECTOR_COLOR}
        strokeWidth={2}
        strokeLinecap="round"
      />
    );
  };

  // Recursive render function
  const renderNode = (
    node: TreeNode | null,
    x: number,
    y: number,
    parentId?: number,
    position?: "LEFT" | "RIGHT",
    isPlaceholder: boolean = false
  ): { elements: React.ReactNode[]; connectors: React.ReactNode[] } => {
    const elements: React.ReactNode[] = [];
    const connectors: React.ReactNode[] = [];

    // Render add user placeholder
    if (isPlaceholder && parentId !== undefined && position) {
      elements.push(
        <div
          key={`add-${parentId}-${position}`}
          className="absolute"
          style={{
            left: x - NODE_WIDTH / 2,
            top: y,
          }}
        >
          <AddUserNode
            position={position}
            parentId={parentId}
            onClick={() => onAddUser?.(parentId, position)}
          />
        </div>
      );
      return { elements, connectors };
    }

    if (!node) {
      return { elements, connectors };
    }

    // Render current node
    elements.push(
      <div
        key={`node-${node.id}`}
        className="absolute"
        style={{
          left: x - NODE_WIDTH / 2,
          top: y,
        }}
      >
        <TreeNodeCard
          node={node}
          isRoot={!parentId}
          isSelected={selectedNodeId === node.id}
          isHighlighted={highlightedNodeIds?.has(node.id) ?? false}
          searchQuery={searchQuery}
          onClick={() => handleNodeClick(node)}
        />
      </div>
    );

    const hasLeft = node.leftChild !== null;
    const hasRight = node.rightChild !== null;

    // Calculate child positions
    const childY = y + NODE_HEIGHT + VERTICAL_SPACING;
    
    // Get subtree widths for positioning
    const leftSubtreeWidth = getSubtreeWidth(node.leftChild, !hasLeft);
    const rightSubtreeWidth = getSubtreeWidth(node.rightChild, !hasRight);
    
    const totalWidth = leftSubtreeWidth + HORIZONTAL_SPACING + rightSubtreeWidth;
    const leftCenterX = x - totalWidth / 2 + leftSubtreeWidth / 2;
    const rightCenterX = x + totalWidth / 2 - rightSubtreeWidth / 2;

    // Add connector to left child/placeholder
    const leftConnector = renderConnector(
      x,
      y + NODE_HEIGHT,
      leftCenterX,
      childY
    );
    connectors.push(
      <g key={`connector-left-${node.id}`}>{leftConnector}</g>
    );

    // Add connector to right child/placeholder
    const rightConnector = renderConnector(
      x,
      y + NODE_HEIGHT,
      rightCenterX,
      childY
    );
    connectors.push(
      <g key={`connector-right-${node.id}`}>{rightConnector}</g>
    );

    // Render left child or placeholder
    if (hasLeft) {
      const leftResult = renderNode(node.leftChild, leftCenterX, childY, node.id, "LEFT");
      elements.push(...leftResult.elements);
      connectors.push(...leftResult.connectors);
    } else {
      const leftResult = renderNode(null, leftCenterX, childY, node.id, "LEFT", true);
      elements.push(...leftResult.elements);
    }

    // Render right child or placeholder
    if (hasRight) {
      const rightResult = renderNode(node.rightChild, rightCenterX, childY, node.id, "RIGHT");
      elements.push(...rightResult.elements);
      connectors.push(...rightResult.connectors);
    } else {
      const rightResult = renderNode(null, rightCenterX, childY, node.id, "RIGHT", true);
      elements.push(...rightResult.elements);
    }

    return { elements, connectors };
  };

  if (!rootNode) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No tree data available
      </div>
    );
  }

  // Calculate total tree dimensions
  const treeWidth = getSubtreeWidth(rootNode);
  const maxDepth = getMaxDepth(rootNode);
  const treeHeight = (maxDepth + 1) * (NODE_HEIGHT + VERTICAL_SPACING) + 100;

  const startX = treeWidth / 2 + 50;
  const startY = 30;

  const { elements, connectors } = renderNode(rootNode, startX, startY);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full overflow-auto p-4",
        "scrollbar-thin scrollbar-track-background scrollbar-thumb-border"
      )}
      style={{ maxHeight: "calc(100vh - 300px)" }}
    >
      <div 
        className="relative"
        style={{ 
          width: treeWidth + 100,
          height: treeHeight,
          minWidth: "100%"
        }}
      >
        {/* SVG layer for connectors */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: treeWidth + 100, height: treeHeight }}
        >
          {connectors}
        </svg>

        {/* Nodes layer */}
        {elements}
      </div>
    </div>
  );
};

export default BinaryTreeView;
