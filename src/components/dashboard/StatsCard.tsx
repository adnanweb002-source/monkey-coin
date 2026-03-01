import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  isLoading?: boolean;
  prefix?: string;
}

const AnimatedNumber = ({ value, prefix = "$" }: { value: number; prefix?: string }) => {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const duration = 1200;
    const start = displayed;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + diff * eased);
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };

    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value]);

  return (
    <span className="text-2xl font-bold text-foreground">
      {prefix}{displayed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
};

const StatsCard = ({ title, value, icon: Icon, isLoading, prefix = "$" }: StatsCardProps) => {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-xs text-muted-foreground font-medium">{title}</p>
      </div>
      <AnimatedNumber value={value} prefix={prefix} />
    </div>
  );
};

export default StatsCard;
