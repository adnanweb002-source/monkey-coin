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
  extremeLeft = 0,
  extremeRight = 0,
  onExtremeLeftClick,
  onExtremeRightClick
}: TreeControlsProps) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      {/* Extreme Left Button */}
      <button
        onClick={onExtremeLeftClick}
        className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold px-4 py-2 rounded-md text-xs transition-colors whitespace-nowrap"
      >
        EXTREME LEFT = {extremeLeft}
      </button>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by User Name"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 placeholder:text-gray-500 focus:border-[#D97706] rounded-md h-9 text-sm"
        />
      </div>

      {/* Extreme Right Button */}
      <button
        onClick={onExtremeRightClick}
        className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold px-4 py-2 rounded-md text-xs transition-colors whitespace-nowrap"
      >
        EXTREME RIGHT = {extremeRight}
      </button>
    </div>
  );
};

export default TreeControls;
