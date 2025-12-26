import { TreeNode } from "@/types/tree";
import { cn } from "@/lib/utils";

interface TreeNodeCardProps {
  node: TreeNode;
  isRoot?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  searchQuery?: string;
  onClick?: () => void;
}

// Pastel color palette matching the reference design
const PASTEL_COLORS = [
  { bg: "bg-amber-100", border: "border-amber-400", ring: "ring-amber-400" }, // Yellow/Gold - Root
  { bg: "bg-blue-100", border: "border-blue-300", ring: "ring-blue-300" },
  { bg: "bg-green-100", border: "border-green-300", ring: "ring-green-300" },
  { bg: "bg-purple-100", border: "border-purple-300", ring: "ring-purple-300" },
  { bg: "bg-orange-100", border: "border-orange-300", ring: "ring-orange-300" },
  { bg: "bg-pink-100", border: "border-pink-300", ring: "ring-pink-300" },
  { bg: "bg-teal-100", border: "border-teal-300", ring: "ring-teal-300" },
  { bg: "bg-indigo-100", border: "border-indigo-300", ring: "ring-indigo-300" },
];

// Helper to highlight matching text
const HighlightText = ({ text, query }: { text: string; query?: string }) => {
  if (!query?.trim()) return <>{text}</>;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return <>{text}</>;
  
  return (
    <>
      {text.slice(0, index)}
      <span className="bg-primary/40 text-primary-foreground rounded px-0.5">
        {text.slice(index, index + query.trim().length)}
      </span>
      {text.slice(index + query.trim().length)}
    </>
  );
};

const TreeNodeCard = ({ 
  node, 
  isRoot, 
  isSelected, 
  isHighlighted, 
  searchQuery, 
  onClick 
}: TreeNodeCardProps) => {
  const getName = (email: string) => {
    const name = email.split("@")[0];
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getColorScheme = (id: number, isRootNode: boolean) => {
    if (isRootNode) return PASTEL_COLORS[0]; // Yellow/Gold for root
    return PASTEL_COLORS[(id % (PASTEL_COLORS.length - 1)) + 1];
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
        "shadow-md hover:shadow-lg",
        "w-[120px]",
        isSelected && "ring-2 ring-primary",
        isHighlighted && "ring-2 ring-primary shadow-lg shadow-primary/30"
      )}
    >
      {/* Avatar Container */}
      <div 
        className={cn(
          "w-[70px] h-[70px] rounded-xl overflow-hidden mb-2 border-2",
          colorScheme.border,
          "bg-white/50"
        )}
      >
        <img 
          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${node.memberId}`}
          alt={getName(node.email)}
          className="w-full h-full object-cover"
        />
        {/* Active Status Indicator */}
        {node.isActive && (
          <div className="absolute top-[68px] right-[22px] w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
        )}
      </div>

      {/* Name */}
      <span className="text-foreground font-bold text-sm text-center truncate w-full">
        <HighlightText text={getName(node.email)} query={searchQuery} />
      </span>

      {/* Member ID */}
      <span className="text-muted-foreground text-[10px] mt-0.5 truncate w-full text-center">
        Id - <HighlightText text={node.memberId.length > 10 ? node.memberId.substring(0, 10) : node.memberId} query={searchQuery} />
      </span>
    </div>
  );
};

export default TreeNodeCard;
