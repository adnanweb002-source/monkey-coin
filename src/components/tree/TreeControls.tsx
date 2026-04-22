import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface TreeControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
  onExtremeLeftClick?: () => void;
  onExtremeRightClick?: () => void;
  onMyPosition?: () => void;
  onShiftUp?: () => void;
  /** When true, Shift Up is in progress (e.g. API). */
  shiftUpLoading?: boolean;
  currentRootId?: number | null;
  userId?: number;
}

const btnClass =
  "bg-[#D97706] hover:bg-[#B45309] disabled:opacity-50 disabled:pointer-events-none text-white font-semibold px-4 py-2 rounded-md text-xs";

const TreeControls = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onExtremeLeftClick,
  onExtremeRightClick,
  onMyPosition,
  onShiftUp,
  shiftUpLoading = false,
  currentRootId,
  userId,
}: TreeControlsProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 py-2 lg:flex-row lg:items-center lg:justify-between">
      <button
        type="button"
        onClick={onExtremeLeftClick}
        className={btnClass}
      >
        {t("tree.extremeLeft")}
      </button>

      <div className="flex items-center gap-2 w-full max-w-md min-w-0 flex-1">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder={t("tree.searchByUserName")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-md h-9 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={onSearchSubmit}
          className={btnClass}
        >
          {t("common.search")}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {currentRootId !== userId && (
          <button type="button" onClick={onMyPosition} className={btnClass}>
            {t("tree.myPosition")}
          </button>
        )}
        <button
          type="button"
          onClick={onShiftUp}
          disabled={shiftUpLoading}
          className={btnClass}
        >
          {t("tree.shiftUp")}
        </button>
        <button
          type="button"
          onClick={onExtremeRightClick}
          className={btnClass}
        >
          {t("tree.extremeRight")}
        </button>
      </div>
    </div>
  );
};

export default TreeControls;
