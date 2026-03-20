import { Trophy, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

import { getUserRanks, getRankProgress } from "@/lib/rankApi";

import rank1 from "@/assets/ranks/1.png";
import rank2 from "@/assets/ranks/2.png";
import rank3 from "@/assets/ranks/3.png";
import rank4 from "@/assets/ranks/4.png";
import rank5 from "@/assets/ranks/5.png";
import rank6 from "@/assets/ranks/6.png";
import rank7 from "@/assets/ranks/7.png";
import rank8 from "@/assets/ranks/8.png";
import rank9 from "@/assets/ranks/9.png";
import rank10 from "@/assets/ranks/10.png";
import rank11 from "@/assets/ranks/11.png";

const rankImages: Record<number, string> = {
  1: rank1,
  2: rank2,
  3: rank3,
  4: rank4,
  5: rank5,
  6: rank6,
  7: rank7,
  8: rank8,
  9: rank9,
  10: rank10,
  11: rank11,
};

const RankProgressCard = () => {
  const navigate = useNavigate();

  // Fetch ranks
  const { data: ranks, isLoading: ranksLoading } = useQuery({
    queryKey: ["user-ranks"],
    queryFn: getUserRanks,
  });

  // Fetch progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["rank-progress"],
    queryFn: getRankProgress,
  });

  const isLoading = ranksLoading || progressLoading;

  // 🧠 Compute current rank
  const currentRank = ranks?.filter((r) => r.unlocked)?.slice(-1)[0];

  // 🧠 Compute next rank
  const nextRankObj = ranks?.find((r) => !r.unlocked);

  // 🧠 Progress %
  let progressPercent = 0;

  if (progress && !progress.completed) {
    const left = (progress.leftProgress / progress.requiredLeft) * 100;
    const right = (progress.rightProgress / progress.requiredRight) * 100;

    progressPercent = Math.min(left, right, 100);
  } else if (progress?.completed) {
    progressPercent = 100;
  }

  const rankImg = rankImages[currentRank?.order || 1];

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-card border rounded-xl p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-card to-primary/5 border border-primary/20 rounded-xl p-6 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
      {/* Trophy */}
      <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
        {rankImg ? (
          <img src={rankImg} alt="Rank" className="w-12 h-12 object-contain" />
        ) : (
          <Trophy className="h-8 w-8 text-primary" />
        )}
      </div>

      {/* Rank */}
      <h3 className="text-xl font-bold text-foreground mb-1">
        {currentRank?.name || "Member"}
      </h3>

      <p className="text-xs text-muted-foreground mb-4">
        Next rank:{" "}
        <span className="text-primary font-medium">
          {progress?.completed
            ? "All ranks completed 🎉"
            : nextRankObj?.name || "—"}
        </span>
      </p>

      {/* Progress */}
      <div className="max-w-xs mx-auto mb-4">
        <Progress
          value={Math.floor(progressPercent)}
          className="h-2.5 bg-muted"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          {Math.floor(progressPercent)}% complete
        </p>
      </div>

      {/* CTA */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/reports/ranks")}
        className="border-primary/30 text-primary hover:bg-primary/10"
      >
        View Report
      </Button>
    </div>
  );
};

export default RankProgressCard;
