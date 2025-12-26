import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddUserNodeProps {
  position: "LEFT" | "RIGHT";
  parentId: number;
  onClick?: () => void;
}

const AddUserNode = ({ position, parentId, onClick }: AddUserNodeProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all duration-300",
        "bg-secondary/50 border-2 border-dashed border-border hover:border-primary/50",
        "hover:bg-secondary hover:shadow-lg hover:shadow-primary/10",
        "min-w-[140px] min-h-[140px]"
      )}
    >
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3 border-2 border-dashed border-muted-foreground/30">
        <Plus className="w-8 h-8 text-muted-foreground" />
      </div>
      <span className="text-muted-foreground font-medium text-sm">Add User</span>
      <span className="text-muted-foreground/50 text-xs mt-1">{position}</span>
    </div>
  );
};

export default AddUserNode;
