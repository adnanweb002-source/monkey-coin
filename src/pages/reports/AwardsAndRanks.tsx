import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserRanks, getRankProgress, claimRank } from "@/lib/rankApi";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Lock, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

const AwardsAndRanks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const { data: ranks, isLoading } = useQuery({
    queryKey: ["user-ranks"],
    queryFn: getUserRanks,
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["rank-progress"],
    queryFn: getRankProgress,
  });

  const claimMutation = useMutation({
    mutationFn: claimRank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-ranks"] });
      queryClient.invalidateQueries({ queryKey: ["rank-progress"] });
      toast({ title: "Rank reward claimed successfully!" });
      setClaimingId(null);
    },
    onError: (err) => {
      toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" });
      setClaimingId(null);
    },
  });

  const handleClaim = (rankId: string) => {
    setClaimingId(rankId);
    claimMutation.mutate(rankId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Awards & Ranks</h1>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Rank Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {progressLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : progress?.completed ? (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">All ranks completed! Congratulations!</span>
            </div>
          ) : progress ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Next Rank: <span className="font-semibold text-foreground">{progress.rank}</span>
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Left Progress</span>
                  <span className="text-muted-foreground">
                    {progress.leftProgress.toLocaleString()} / {progress.requiredLeft.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={Math.min((progress.leftProgress / progress.requiredLeft) * 100, 100)}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Right Progress</span>
                  <span className="text-muted-foreground">
                    {progress.rightProgress.toLocaleString()} / {progress.requiredRight.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={Math.min((progress.rightProgress / progress.requiredRight) * 100, 100)}
                  className="h-2"
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No progress data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Ranks Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Claim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : ranks?.length ? (
              ranks.map((rank, index) => (
                <TableRow key={rank.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{rank.name}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-semibold">${rank.reward.toLocaleString()}</span>
                      {rank.rewardTitle && (
                        <p className="text-xs text-muted-foreground">{rank.rewardTitle}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {rank.claimable ? (
                      <Button
                        size="sm"
                        onClick={() => handleClaim(rank.id)}
                        disabled={claimingId === rank.id}
                      >
                        {claimingId === rank.id && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        Claim
                      </Button>
                    ) : rank.unlocked ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" /> Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 opacity-50">
                        <Lock className="h-3 w-3" /> Locked
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No ranks available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AwardsAndRanks;
