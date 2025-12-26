import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TreeControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  extremeLeft?: number;
  extremeRight?: number;
}

const TreeControls = ({ searchQuery, onSearchChange, extremeLeft = 0, extremeRight = 0 }: TreeControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Extreme Left Badge */}
      <Badge
        variant="outline"
        className="bg-primary/10 border-primary text-primary hover:bg-primary/20 px-4 py-2 text-sm font-medium"
      >
        EXTREME LEFT = {extremeLeft}
      </Badge>

      {/* Search Input */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by User Name"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border focus:border-primary"
        />
      </div>

      {/* Extreme Right Badge */}
      <Badge
        variant="outline"
        className="bg-green-500/10 border-green-500 text-green-500 hover:bg-green-500/20 px-4 py-2 text-sm font-medium"
      >
        EXTREME RIGHT = {extremeRight}
      </Badge>
    </div>
  );
};

export default TreeControls;
