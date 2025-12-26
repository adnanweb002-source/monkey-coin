import { Plus } from "lucide-react";

interface AddUserNodeProps {
  position: "LEFT" | "RIGHT";
  parentId: number;
  onClick?: () => void;
}

const AddUserNode = ({ onClick }: AddUserNodeProps) => {
  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 bg-[#2a2a2a] border-2 border-[#3a3a3a] hover:border-[#4a4a4a] hover:bg-[#333333] w-[110px]"
    >
      {/* Avatar Placeholder with Plus Icon */}
      <div className="relative w-[65px] h-[65px] rounded-xl overflow-hidden mb-2 bg-[#3a3a3a] border-2 border-[#4a4a4a] flex items-center justify-center">
        {/* Placeholder Avatar */}
        <img 
          src="https://api.dicebear.com/7.x/notionists/svg?seed=placeholder&backgroundColor=transparent"
          alt="Add User"
          className="w-full h-full object-cover opacity-40"
        />
        {/* Plus Icon Overlay */}
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#4a4a4a] flex items-center justify-center">
          <Plus className="w-3 h-3 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Add User Text */}
      <span className="text-white font-bold text-sm text-center">Add</span>
      <span className="text-white font-bold text-sm text-center -mt-0.5">User</span>
    </div>
  );
};

export default AddUserNode;
