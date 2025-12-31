import { useState, useRef, useEffect, useCallback } from "react";
import { TreeNode } from "@/types/tree";
import TreeNodeCard from "./TreeNodeCard";
import TreeNodeContextMenu from "./TreeNodeContextMenu";
import TreeNodeHoverDetails from "./TreeNodeHoverDetails";
import AddUserNode from "./AddUserNode";
import { cn } from "@/lib/utils";

interface BinaryTreeViewProps {
  rootNode: TreeNode | null;
  onNodeClick?: (node: TreeNode) => void;
  onAddUser?: (parentId: string, position: "LEFT" | "RIGHT") => void;
  highlightedNodeIds?: Set<number>;
  searchQuery?: string;
}

const NODE_WIDTH = 100;
const NODE_HEIGHT = 105;
const HORIZONTAL_SPACING = 16;
const VERTICAL_SPACING = 50;
const CONNECTOR_COLOR = "#5C5C5C";

interface HoverState {
  node: TreeNode | null;
  position: { x: number; y: number };
  nodeHeight: number;
}

const BinaryTreeView = ({ 
  rootNode, 
  onNodeClick, 
  onAddUser, 
  highlightedNodeIds, 
  searchQuery 
}: BinaryTreeViewProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hoverState, setHoverState] = useState<HoverState>({ node: null, position: { x: 0, y: 0 }, nodeHeight: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [tappedNodeId, setTappedNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      const profile = JSON.parse(stored);
      setIsAdmin(profile?.role === "ADMIN");
    }
    
    // Detect mobile
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleNodeClick = (node: TreeNode) => {
    setSelectedNodeId(node.id);
    onNodeClick?.(node);
  };

  // Get position relative to tree container using data attributes
  const getNodePosition = (nodeId: number): { x: number; y: number; height: number } | null => {
    const nodeElement = containerRef.current?.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement || !containerRef.current) return null;
    
    const nodeRect = nodeElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    return {
      x: nodeRect.left - containerRect.left + nodeRect.width / 2,
      y: nodeRect.top - containerRect.top + nodeRect.height,
      height: nodeRect.height,
    };
  };

  const handleHoverStart = useCallback((node: TreeNode) => {
    if (isMobile) return;
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Delay showing hover to avoid flicker and allow click to work
    hoverTimeoutRef.current = setTimeout(() => {
      const pos = getNodePosition(node.id);
      if (pos) {
        setHoverState({
          node,
          position: { x: pos.x, y: pos.y },
          nodeHeight: pos.height,
        });
      }
    }, 300);
  }, [isMobile]);

  const handleHoverEnd = useCallback(() => {
    if (isMobile) return;
    
    // Clear pending hover show
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Delay hiding to allow moving to the popup
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverState({ node: null, position: { x: 0, y: 0 }, nodeHeight: 0 });
    }, 150);
  }, [isMobile]);

  // Keep popup open when mouse enters the popup itself
  const handlePopupMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handlePopupMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverState({ node: null, position: { x: 0, y: 0 }, nodeHeight: 0 });
    }, 100);
  }, []);

  const handleMobileTap = useCallback((node: TreeNode) => {
    if (!isMobile) return;
    
    // First tap shows details, second tap triggers context menu
    if (tappedNodeId === node.id) {
      // Second tap - close details and let context menu handle it
      setTappedNodeId(null);
      setHoverState({ node: null, position: { x: 0, y: 0 }, nodeHeight: 0 });
      return; // Let the event propagate to context menu
    } else {
      // First tap - show details
      const pos = getNodePosition(node.id);
      if (pos) {
        setHoverState({
          node,
          position: { x: pos.x, y: pos.y },
          nodeHeight: pos.height,
        });
        setTappedNodeId(node.id);
      }
    }
  }, [isMobile, tappedNodeId]);

  const closeHoverDetails = useCallback(() => {
    setHoverState({ node: null, position: { x: 0, y: 0 }, nodeHeight: 0 });
    setTappedNodeId(null);
  }, []);

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
    const midY = startY + (endY - startY) * 0.5;
    const radius = 6;

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
    parentMemberId?: string,
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
            parentMemberId={parentMemberId}
            onClick={() => onAddUser?.(parentMemberId, position)}
          />
        </div>
      );
      return { elements, connectors };
    }

    if (!node) {
      return { elements, connectors };
    }

    elements.push(
      <TreeNodeContextMenu key={`menu-${node.id}`} node={node} isAdmin={isAdmin}>
        <div
          className="absolute"
          data-node-id={node.id}
          style={{
            left: x - NODE_WIDTH / 2,
            top: y,
          }}
          onMouseEnter={() => handleHoverStart(node)}
          onMouseLeave={handleHoverEnd}
          onTouchEnd={() => handleMobileTap(node)}
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
      </TreeNodeContextMenu>
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
      const leftResult = renderNode(node.leftChild, leftCenterX, childY, node.id, node.memberId, "LEFT");
      elements.push(...leftResult.elements);
      connectors.push(...leftResult.connectors);
    } else {
      const leftResult = renderNode(null, leftCenterX, childY, node.id, node.memberId, "LEFT", true);
      elements.push(...leftResult.elements);
    }

    if (hasRight) {
      const rightResult = renderNode(node.rightChild, rightCenterX, childY, node.id, node.memberId, "RIGHT");
      elements.push(...rightResult.elements);
      connectors.push(...rightResult.connectors);
    } else {
      const rightResult = renderNode(null, rightCenterX, childY, node.id, node.memberId, "RIGHT", true);
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
  const treeHeight = (maxDepth + 1) * (NODE_HEIGHT + VERTICAL_SPACING) + 80;

  const startX = treeWidth / 2 + 40;
  const startY = 20;

  const { elements, connectors } = renderNode(rootNode, startX, startY);

  return (
    <div 
      ref={containerRef}
      className="w-full flex justify-center relative"
    >
      <div 
        className="relative"
        style={{ 
          width: treeWidth + 80,
          height: treeHeight,
        }}
      >
        {/* SVG layer for connectors */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: treeWidth + 80, height: treeHeight }}
        >
          {connectors}
        </svg>

        {/* Nodes layer */}
        {elements}

        {/* Hover Details Popup */}
        {hoverState.node && (
          <div 
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          >
            <TreeNodeHoverDetails
              node={hoverState.node}
              position={hoverState.position}
              nodeHeight={hoverState.nodeHeight}
              onClose={closeHoverDetails}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BinaryTreeView;
