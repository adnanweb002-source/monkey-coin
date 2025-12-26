import { TreeNode } from "@/types/tree";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TreeNodeCardProps {
  node: TreeNode;
  isRoot?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const TreeNodeCard = ({ node, isRoot, isSelected, onClick }: TreeNodeCardProps) => {
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (id: number) => {
    const colors = [
      "from-purple-500 to-purple-700",
      "from-blue-500 to-blue-700",
      "from-green-500 to-green-700",
      "from-orange-500 to-orange-700",
      "from-pink-500 to-pink-700",
      "from-teal-500 to-teal-700",
    ];
    return colors[id % colors.length];
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all duration-300",
        "bg-gradient-to-b from-card to-secondary border border-border/50",
        "hover:scale-105 hover:shadow-lg hover:shadow-primary/20",
        "min-w-[140px]",
        isRoot && "border-primary/50 shadow-lg shadow-primary/10",
        isSelected && "ring-2 ring-primary border-primary"
      )}
    >
      {/* Active Status Indicator */}
      <div
        className={cn(
          "absolute top-3 right-3 w-3 h-3 rounded-full",
          node.isActive ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-muted-foreground/50"
        )}
      />

      {/* Avatar */}
      <Avatar className={cn("w-16 h-16 mb-3 ring-2 ring-border")}>
        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${node.memberId}`} />
        <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold", getAvatarColor(node.id))}>
          {getInitials(node.email)}
        </AvatarFallback>
      </Avatar>

      {/* Name/Email */}
      <span className="text-foreground font-semibold text-sm text-center truncate max-w-[120px]">
        {node.email.split("@")[0]}
      </span>

      {/* Member ID */}
      <span className="text-muted-foreground text-xs mt-1">
        ID: {node.memberId}
      </span>
    </div>
  );
};

export default TreeNodeCard;
