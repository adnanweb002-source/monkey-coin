import { TreeNode } from "@/types/tree";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TreeNodeHoverDetailsProps {
  node: TreeNode;
  position: { x: number; y: number };
  nodeHeight: number;
  isMobile?: boolean;
  onClose: () => void;
}

const TreeNodeHoverDetails = ({ node, position, nodeHeight, isMobile, onClose }: TreeNodeHoverDetailsProps) => {
  const getName = (email: string) => {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  console.log("Rendering TreeNodeHoverDetails for node:", node);

  const formatBV = (value: number | string | undefined) => {
    if (value === undefined || value === null) return "—";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString();
  };

  // Extended node with optional fields
  const extendedNode = node as TreeNode & {
    firstName?: string;
    lastName?:string;
    joinDate?: string;
    createdAt?: string;
    rank?: string;
    leftBv?: number | string;
    rightBv?: number | string;
    sponsorMemberId?: string;
  };

  const details = [
    { label: "Member ID", value: node.memberId },
    { label: "Full Name", value: `${extendedNode.firstName} ${extendedNode.lastName}` },
    { label: "Email", value: node.email },
    {
      label: "Status",
      value: (
        <Badge
          variant={node.isActive ? "default" : "secondary"}
          className={cn(
            "text-xs",
            node.isActive
              ? "bg-green-500/10 text-green-600 border-green-500/30"
              : "bg-red-500/10 text-red-600 border-red-500/30"
          )}
        >
          {node.isActive ? "ACTIVE" : "INACTIVE"}
        </Badge>
      ),
    },
    {
      label: "Position",
      value: (
        <Badge variant="outline" className="text-xs">
          {node.position}
        </Badge>
      ),
    },
    {
      label: "Join Date",
      value: extendedNode.joinDate || extendedNode.createdAt
        ? format(new Date(extendedNode.joinDate || extendedNode.createdAt!), "dd MMM yyyy")
        : "—",
    },
    { label: "Rank", value: extendedNode.rank || "—" },
    { label: "BV Left", value: formatBV(extendedNode.leftBv) },
    { label: "BV Right", value: formatBV(extendedNode.rightBv) },
    {
      label: "Sponsor Member ID",
      value: extendedNode.sponsorMemberId || "—",
    },
  ];

  return (
    <>
      {/* Backdrop (mobile/tap mode only) */}
      {isMobile && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
          onTouchStart={onClose}
        />
      )}
      {/* Tooltip Panel - positioned directly below the node with arrow pointing up */}
      <div
        className={cn(
          "absolute z-50 bg-card border border-border rounded-lg shadow-lg",
          "min-w-[240px] max-w-[300px]",
          "animate-in fade-in-0 zoom-in-95 duration-150"
        )}
        style={{
          left: position.x,
          top: position.y + 8, // Small gap below the node
          transform: "translateX(-50%)",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={(e) => e.stopPropagation()}
      >
        {/* Arrow pointer pointing UP toward the node */}
        <div
          className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 
                     border-l-[8px] border-l-transparent 
                     border-r-[8px] border-r-transparent 
                     border-b-[8px] border-b-border"
        />
        <div
          className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-0 h-0 
                     border-l-[7px] border-l-transparent 
                     border-r-[7px] border-r-transparent 
                     border-b-[7px] border-b-card"
        />

        {/* Header */}
        <div className="p-3 border-b border-border bg-secondary/30 rounded-t-lg">
          <div className="flex items-center gap-3">
            <img
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${node.memberId}&backgroundColor=transparent`}
              alt={getName(node.email)}
              className="w-10 h-10 rounded-lg border border-border"
            />
            <div>
              <p className="font-semibold text-sm">{getName(node.email)}</p>
              <p className="text-xs text-muted-foreground">{node.memberId}</p>
            </div>
          </div>
        </div>

        {/* Details Table */}
        <div className="p-2">
          <table className="w-full text-xs">
            <tbody>
              {details.map((item, index) => (
                <tr key={index} className="border-b border-border/50 last:border-0">
                  <td className="py-1.5 pr-3 text-muted-foreground whitespace-nowrap">
                    {item.label}
                  </td>
                  <td className="py-1.5 text-right font-medium truncate max-w-[140px]">
                    {typeof item.value === "string" || typeof item.value === "number" ? (
                      <span className="truncate block">{item.value}</span>
                    ) : (
                      item.value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TreeNodeHoverDetails;
