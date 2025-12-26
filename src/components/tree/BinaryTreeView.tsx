import { useState, useRef } from "react";
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

const NODE_WIDTH = 110;
const NODE_HEIGHT = 120;
const HORIZONTAL_SPACING = 20;
const VERTICAL_SPACING = 60;
const CONNECTOR_COLOR = "#4a4a4a";

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

  const getMaxDepth = (node: TreeNode | null, currentDepth: number = 0): number => {
    if (!node) return currentDepth;
    const leftDepth = getMaxDepth(node.leftChild, currentDepth + 1);
    const rightDepth = getMaxDepth(node.rightChild, currentDepth + 1);
    return Math.max(leftDepth, rightDepth);
  };

  const getSubtreeWidth = (node: TreeNode | null, showAddPlaceholder: boolean = true): number => {
    if (!node) {
      return showAddPlaceholder ? NODE_WIDTH : 0;
    }

    const hasLeft = node.leftChild !== null;
    const hasRight = node.rightChild !== null;

    if (!hasLeft && !hasRight) {
      return (NODE_WIDTH * 2) + HORIZONTAL_SPACING;
    }

    const leftWidth = getSubtreeWidth(node.leftChild, !hasLeft);
    const rightWidth = getSubtreeWidth(node.rightChild, !hasRight);

    return leftWidth + HORIZONTAL_SPACING + rightWidth;
  };

  // Render L-shaped connector lines matching the reference
  const renderConnector = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const midY = startY + (endY - startY) * 0.4;
    const radius = 8;

    // Determine direction
    const goingLeft = endX < startX;
    const goingRight = endX > startX;

    let path = "";

    if (goingLeft) {
      path = `
        M ${startX} ${startY}
        L ${startX} ${midY - radius}
        Q ${startX} ${midY} ${startX - radius} ${midY}
        L ${endX + radius} ${midY}
        Q ${endX} ${midY} ${endX} ${midY + radius}
        L ${endX} ${endY}
      `;
    } else if (goingRight) {
      path = `
        M ${startX} ${startY}
        L ${startX} ${midY - radius}
        Q ${startX} ${midY} ${startX + radius} ${midY}
        L ${endX - radius} ${midY}
        Q ${endX} ${midY} ${endX} ${midY + radius}
        L ${endX} ${endY}
      `;
    } else {
      path = `M ${startX} ${startY} L ${endX} ${endY}`;
    }

    return (
      <path
        d={path}
        fill="none"
        stroke={CONNECTOR_COLOR}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

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

    const childY = y + NODE_HEIGHT + VERTICAL_SPACING;
    
    const leftSubtreeWidth = getSubtreeWidth(node.leftChild, !hasLeft);
    const rightSubtreeWidth = getSubtreeWidth(node.rightChild, !hasRight);
    
    const totalWidth = leftSubtreeWidth + HORIZONTAL_SPACING + rightSubtreeWidth;
    const leftCenterX = x - totalWidth / 2 + leftSubtreeWidth / 2;
    const rightCenterX = x + totalWidth / 2 - rightSubtreeWidth / 2;

    // Add connectors
    const leftConnector = renderConnector(
      x,
      y + NODE_HEIGHT,
      leftCenterX,
      childY
    );
    connectors.push(
      <g key={`connector-left-${node.id}`}>{leftConnector}</g>
    );

    const rightConnector = renderConnector(
      x,
      y + NODE_HEIGHT,
      rightCenterX,
      childY
    );
    connectors.push(
      <g key={`connector-right-${node.id}`}>{rightConnector}</g>
    );

    // Render children
    if (hasLeft) {
      const leftResult = renderNode(node.leftChild, leftCenterX, childY, node.id, "LEFT");
      elements.push(...leftResult.elements);
      connectors.push(...leftResult.connectors);
    } else {
      const leftResult = renderNode(null, leftCenterX, childY, node.id, "LEFT", true);
      elements.push(...leftResult.elements);
    }

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
      <div className="flex items-center justify-center h-64 text-gray-400">
        No tree data available
      </div>
    );
  }

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
        "scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#3a3a3a]"
      )}
      style={{ maxHeight: "calc(100vh - 350px)" }}
    >
      <div 
        className="relative mx-auto"
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
