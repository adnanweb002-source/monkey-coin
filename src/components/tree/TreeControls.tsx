import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TreeControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void; // 👈 NEW
  extremeLeft?: number;
  extremeRight?: number;
  onExtremeLeftClick?: () => void;
  onExtremeRightClick?: () => void;
  setCurrentRootId?: (id: number | null) => void;
  currentRootId?: number | null;
  userId?: number;
}

const TreeControls = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  extremeLeft = 0,
  extremeRight = 0,
  onExtremeLeftClick,
  onExtremeRightClick,
  setCurrentRootId,
  currentRootId,
  userId,
}: TreeControlsProps) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      
      <button
        onClick={onExtremeLeftClick}
        className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold px-4 py-2 rounded-md text-xs"
      >
        EXTREME LEFT
      </button>

      {/* Search Input + Button */}
      <div className="flex items-center gap-2 w-full max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by Member ID"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-md h-9 text-sm"
          />
        </div>

        <button
          onClick={onSearchSubmit}
          className="bg-[#D97706] hover:bg-[#B45309] text-white px-3 py-2 rounded-md text-xs"
        >
          SEARCH
        </button>
      </div>

      {currentRootId !== userId && (
        <button
          onClick={() => setCurrentRootId?.(userId || null)}
          className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold px-4 py-2 rounded-md text-xs"
        >
          MY POSITION
        </button>
      )}

      <button
        onClick={onExtremeRightClick}
        className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold px-4 py-2 rounded-md text-xs"
      >
        EXTREME RIGHT
      </button>
    </div>
  );
};

export default TreeControls;