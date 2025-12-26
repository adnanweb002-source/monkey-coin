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
        "relative flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all duration-200",
        "bg-green-50 border-2 border-green-200",
        "hover:bg-green-100 hover:border-green-300 hover:shadow-md",
        "w-[120px]"
      )}
    >
      {/* Avatar Placeholder with Plus Icon */}
      <div className="w-[70px] h-[70px] rounded-xl overflow-hidden mb-2 border-2 border-green-200 bg-white/80 flex items-center justify-center relative">
        {/* Placeholder Avatar */}
        <img 
          src="https://api.dicebear.com/7.x/notionists/svg?seed=placeholder&backgroundColor=f0fdf4"
          alt="Add User"
          className="w-full h-full object-cover opacity-50"
        />
        {/* Plus Icon Overlay */}
        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
          <Plus className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Add User Text */}
      <span className="text-foreground font-bold text-sm text-center">Add</span>
      <span className="text-foreground font-bold text-sm text-center -mt-0.5">User</span>
    </div>
  );
};

export default AddUserNode;
