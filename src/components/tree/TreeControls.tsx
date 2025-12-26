import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TreeControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  extremeLeft?: number;
  extremeRight?: number;
  onExtremeLeftClick?: () => void;
  onExtremeRightClick?: () => void;
}

const TreeControls = ({ 
  searchQuery, 
  onSearchChange, 
  onExtremeLeftClick,
  onExtremeRightClick
}: TreeControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {/* Extreme Left Button */}
      <button
        onClick={onExtremeLeftClick}
        className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
      >
        EXTREME LEFT
      </button>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by User Name"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#D97706] rounded-lg h-10"
        />
      </div>

      {/* Extreme Right Button */}
      <button
        onClick={onExtremeRightClick}
        className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
      >
        EXTREME RIGHT
      </button>
    </div>
  );
};

export default TreeControls;
