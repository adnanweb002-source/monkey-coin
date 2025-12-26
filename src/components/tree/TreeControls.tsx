import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center justify-between gap-4 py-4">
      {/* Extreme Left Button */}
      <Button
        onClick={onExtremeLeftClick}
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-sm"
      >
        EXTREME LEFT
      </Button>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by User Name"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background border-border focus:border-orange-400 rounded-lg"
        />
      </div>

      {/* Extreme Right Button */}
      <Button
        onClick={onExtremeRightClick}
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-sm"
      >
        EXTREME RIGHT
      </Button>
    </div>
  );
};

export default TreeControls;
