import { Plus } from "lucide-react";

interface AddUserNodeProps {
  position: "LEFT" | "RIGHT";
  parentId: number;
  parentMemberId: string;
  onClick?: () => void;
}

const AddUserNode = ({ onClick }: AddUserNodeProps) => {
  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center p-2.5 rounded-xl cursor-pointer transition-all duration-200 bg-[#FFF8E1] border-2 border-[#FFE082] hover:border-[#FFB300] w-[100px] shadow-[0_4px_12px_rgba(255,224,130,0.2)]"
    >
      {/* Avatar Placeholder with Plus Icon */}
      <div className="relative w-[56px] h-[56px] rounded-lg overflow-hidden mb-1.5 bg-white/50 border border-white/60 flex items-center justify-center">
        {/* Placeholder Avatar */}
        <img 
          src="https://api.dicebear.com/7.x/notionists/svg?seed=placeholder&backgroundColor=transparent"
          alt="Add User"
          className="w-full h-full object-cover opacity-40"
        />
        {/* Plus Icon Overlay */}
        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#4a4a4a] flex items-center justify-center">
          <Plus className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Add User Text */}
      <span className="text-[#1a1a1a] font-bold text-xs text-center">Add</span>
      <span className="text-[#1a1a1a] font-bold text-xs text-center -mt-0.5">User</span>
    </div>
  );
};

export default AddUserNode;
