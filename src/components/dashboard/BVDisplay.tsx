import { useState } from "react";
import { RefreshCw, ArrowLeftRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import type { UserProfile } from "@/types/user";

interface BVDisplayProps {
  leftBv: number;
  rightBv: number;
}

const BVDisplay = ({ leftBv: initialLeftBv, rightBv: initialRightBv }: BVDisplayProps) => {
  const [leftBv, setLeftBv] = useState(initialLeftBv);
  const [rightBv, setRightBv] = useState(initialRightBv);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get("/auth/get-profile");
      const profile: UserProfile = response.data;
      
      setLeftBv(profile.leftBv ?? 0);
      setRightBv(profile.rightBv ?? 0);
      
      // Update localStorage with fresh profile
      localStorage.setItem("userProfile", JSON.stringify(profile));
      
      toast.success("BV data refreshed");
    } catch (error) {
      toast.error("Failed to refresh BV data");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Binary Volume</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Left BV</p>
            <p className="text-2xl font-bold text-foreground">{leftBv.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Right BV</p>
            <p className="text-2xl font-bold text-foreground">{rightBv.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BVDisplay;
