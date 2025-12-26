import { TreeNode } from "@/types/tree";
import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";

interface TreeNodeCardProps {
  node: TreeNode;
  isRoot?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  searchQuery?: string;
  onClick?: () => void;
}

// Color schemes matching the reference design exactly
const getColorScheme = (id: number, isRoot: boolean) => {
  if (isRoot) {
    return {
      bg: "bg-[#F5D76E]",
      border: "border-[#D4A853]",
      shadow: "shadow-[0_4px_20px_rgba(245,215,110,0.3)]"
    };
  }
  
  const schemes = [
    { bg: "bg-[#A78BFA]", border: "border-[#8B5CF6]", shadow: "shadow-[0_4px_20px_rgba(167,139,250,0.3)]" }, // Purple
    { bg: "bg-[#60A5FA]", border: "border-[#3B82F6]", shadow: "shadow-[0_4px_20px_rgba(96,165,250,0.3)]" }, // Blue
    { bg: "bg-[#4ADE80]", border: "border-[#22C55E]", shadow: "shadow-[0_4px_20px_rgba(74,222,128,0.3)]" }, // Green
    { bg: "bg-[#F97316]", border: "border-[#EA580C]", shadow: "shadow-[0_4px_20px_rgba(249,115,22,0.3)]" }, // Orange
    { bg: "bg-[#EC4899]", border: "border-[#DB2777]", shadow: "shadow-[0_4px_20px_rgba(236,72,153,0.3)]" }, // Pink
    { bg: "bg-[#14B8A6]", border: "border-[#0D9488]", shadow: "shadow-[0_4px_20px_rgba(20,184,166,0.3)]" }, // Teal
  ];
  
  return schemes[id % schemes.length];
};

const TreeNodeCard = ({ 
  node, 
  isRoot, 
  isSelected, 
  isHighlighted, 
  onClick 
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
        "relative flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all duration-200",
        colorScheme.bg,
        "border-2",
        colorScheme.border,
        colorScheme.shadow,
        "w-[110px]",
        isSelected && "ring-2 ring-white",
        isHighlighted && "ring-2 ring-white scale-105"
      )}
    >
      {/* Avatar Container */}
      <div className="relative w-[65px] h-[65px] rounded-xl overflow-hidden mb-2 bg-white/30 border-2 border-white/40">
        <img 
          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${node.memberId}&backgroundColor=transparent`}
          alt={getName(node.email)}
          className="w-full h-full object-cover"
        />
        {/* Active Status Indicator */}
        {node.isActive && (
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#22C55E] border-2 border-white" />
        )}
      </div>

      {/* Name */}
      <span className="text-[#1a1a1a] font-bold text-sm text-center truncate w-full">
        {getName(node.email)}
      </span>

      {/* Member ID with icon */}
      <div className="flex items-center gap-1 mt-0.5">
        <Phone className="w-2.5 h-2.5 text-[#1a1a1a]/70" />
        <span className="text-[#1a1a1a]/70 text-[9px] truncate">
          Id - {node.memberId.length > 8 ? node.memberId.substring(0, 8) : node.memberId}
        </span>
      </div>
    </div>
  );
};

export default TreeNodeCard;
