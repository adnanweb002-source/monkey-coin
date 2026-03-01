import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface RankProgressCardProps {
  rankName?: string;
  nextRank?: string;
  progress?: number;
}

const RankProgressCard = ({
  rankName = "Member",
  nextRank = "Silver",
  progress = 0,
}: RankProgressCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-primary/10 via-card to-primary/5 border border-primary/20 rounded-xl p-6 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
      {/* Trophy */}
      <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
        <Trophy className="h-8 w-8 text-primary" />
      </div>

      {/* Rank */}
      <h3 className="text-xl font-bold text-foreground mb-1">{rankName}</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Next rank: <span className="text-primary font-medium">{nextRank}</span>
      </p>

      {/* Progress bar */}
      <div className="max-w-xs mx-auto mb-4">
        <Progress value={progress} className="h-2.5 bg-muted" />
        <p className="text-xs text-muted-foreground mt-1.5">{progress}% complete</p>
      </div>

      {/* View Report */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/reports/rank-reward")}
        className="border-primary/30 text-primary hover:bg-primary/10"
      >
        View Report
      </Button>
    </div>
  );
};

export default RankProgressCard;
