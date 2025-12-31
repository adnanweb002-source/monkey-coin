import { TreeNode } from "@/types/tree";
import { cn } from "@/lib/utils";
import type { MouseEvent as ReactMouseEvent } from "react";

interface TreeNodeCardProps {
  node: TreeNode;
  isRoot?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  searchQuery?: string;
  onClick?: (e: ReactMouseEvent<HTMLDivElement>) => void;
}

// Color schemes matching the reference design exactly
const getColorScheme = (id: number, isRoot: boolean) => {
  if (isRoot) {
    return {
      bg: "bg-[#7CB342]",
      border: "border-[#558B2F]",
      shadow: "shadow-[0_4px_12px_rgba(124,179,66,0.3)]"
    };
  }
  
  const schemes = [
    { bg: "bg-[#FFF8E1]", border: "border-[#FFE082]", shadow: "shadow-[0_4px_12px_rgba(255,224,130,0.2)]" }, // Light yellow
    { bg: "bg-[#FFF8E1]", border: "border-[#FFE082]", shadow: "shadow-[0_4px_12px_rgba(255,224,130,0.2)]" }, // Light yellow
    { bg: "bg-[#E8F5E9]", border: "border-[#A5D6A7]", shadow: "shadow-[0_4px_12px_rgba(165,214,167,0.2)]" }, // Light green
    { bg: "bg-[#FFF3E0]", border: "border-[#FFCC80]", shadow: "shadow-[0_4px_12px_rgba(255,204,128,0.2)]" }, // Light orange
    { bg: "bg-[#F3E5F5]", border: "border-[#CE93D8]", shadow: "shadow-[0_4px_12px_rgba(206,147,216,0.2)]" }, // Light purple
    { bg: "bg-[#E3F2FD]", border: "border-[#90CAF9]", shadow: "shadow-[0_4px_12px_rgba(144,202,249,0.2)]" }, // Light blue
  ];
  
  return schemes[id % schemes.length];
};

const TreeNodeCard = ({ 
  node, 
  isRoot, 
  isSelected, 
  isHighlighted, 
  onClick,
}: TreeNodeCardProps) => {
  const getName = (email: string) => {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const colorScheme = getColorScheme(node.id, isRoot || false);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center p-2.5 rounded-xl cursor-pointer transition-all duration-200",
        colorScheme.bg,
        "border-2",
        colorScheme.border,
        colorScheme.shadow,
        "w-[100px]",
        isSelected && "ring-2 ring-[#D97706]",
        isHighlighted && "ring-2 ring-[#D97706] scale-105"
      )}
    >
      {/* Avatar Container */}
      <div className="relative w-[56px] h-[56px] rounded-lg overflow-hidden mb-1.5 bg-white/50 border border-white/60">
        <img 
          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${node.memberId}&backgroundColor=transparent`}
          alt={getName(node.email)}
          className="w-full h-full object-cover"
        />
        {/* Active Status Indicator */}
        {node.isActive && (
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#4CAF50] border-2 border-white" />
        )}
      </div>

      {/* Name */}
      <span className={cn(
        "font-bold text-xs text-center truncate w-full",
        isRoot ? "text-white" : "text-[#1a1a1a]"
      )}>
        {getName(node.email)}
      </span>

      {/* Member ID Badge */}
      <div className={cn(
        "mt-1 px-1.5 py-0.5 rounded text-[8px] truncate max-w-full",
        isRoot ? "bg-[#558B2F] text-white" : "bg-[#D97706] text-white"
      )}>
        Id - {node.memberId.length > 10 ? node.memberId.substring(0, 10) : node.memberId}
      </div>
    </div>
  );
};

export default TreeNodeCard;
