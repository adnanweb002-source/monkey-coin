import { cn } from "@/lib/utils";

interface TreeConnectorProps {
  type: "vertical" | "left" | "right" | "horizontal";
  className?: string;
}

const TreeConnector = ({ type, className }: TreeConnectorProps) => {
  if (type === "vertical") {
    return (
      <div className={cn("w-0.5 h-8 bg-gradient-to-b from-border to-muted-foreground/30", className)} />
    );
  }

  if (type === "horizontal") {
    return (
      <div className={cn("h-0.5 flex-1 bg-gradient-to-r from-muted-foreground/30 via-border to-muted-foreground/30", className)} />
    );
  }

  // Curved connectors using SVG
  const isLeft = type === "left";
  
  return (
    <svg
      className={cn("w-full h-12 overflow-visible", className)}
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
    >
      <path
        d={isLeft ? "M 50 0 Q 50 25, 20 50" : "M 50 0 Q 50 25, 80 50"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-border"
      />
    </svg>
  );
};

export default TreeConnector;
